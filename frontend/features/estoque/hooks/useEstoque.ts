"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type EstadoProduto, type EstoqueLocal } from "@/features/estoque/data/estruturaEstoque";
import { useAuthStore } from "@/shared/stores/authStore";

const STORAGE_KEY = "unistock-estoque-lojas";
const HISTORY_KEY = "unistock-estoque-historico";

type UpdatePayload = {
  loja: string;
  categoria: string;
  produto: string;
  qtd?: number;
  estado?: EstadoProduto;
  updatedAt: string;
  usuario?: string;
};

export type HistoricoEstoque = UpdatePayload & {
  anterior?: number;
  novo?: number;
  anteriorEstado?: EstadoProduto;
  novoEstado?: EstadoProduto;
};

function carregarEstoque() {
  if (typeof window === "undefined") return {};

  const salvo = window.localStorage.getItem(STORAGE_KEY);
  if (!salvo) return {};

  try {
    return JSON.parse(salvo) as EstoqueLocal;
  } catch {
    return {};
  }
}

function carregarHistorico() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]") as HistoricoEstoque[];
  } catch {
    return [];
  }
}

export function useEstoque() {
  const usuario = useAuthStore((state) => state.user?.first_name || state.user?.email || "Usuario");
  const [estoque, setEstoque] = useState<EstoqueLocal>(() => carregarEstoque());
  const [historico, setHistorico] = useState<HistoricoEstoque[]>(() => carregarHistorico());
  const [alterados, setAlterados] = useState<Record<string, number>>({});
  const [notificacoesExternas, setNotificacoesExternas] = useState(0);
  const historicoRef = useRef<HistoricoEstoque[]>(historico);

  useEffect(() => {
    historicoRef.current = historico;
  }, [historico]);

  const aplicarUpdate = useCallback((payload: UpdatePayload, externo = false) => {
    setEstoque((atual) => {
      const itemAnterior = atual[payload.loja]?.[payload.categoria]?.[payload.produto];
      const anterior = itemAnterior?.qtd;
      const proximo: EstoqueLocal = {
        ...atual,
        [payload.loja]: {
          ...atual[payload.loja],
          [payload.categoria]: {
            ...atual[payload.loja]?.[payload.categoria],
            [payload.produto]: {
              ...atual[payload.loja]?.[payload.categoria]?.[payload.produto],
              ...(typeof payload.qtd === "number" ? { qtd: payload.qtd } : {}),
              ...(payload.estado ? { estado: payload.estado } : {}),
              updatedAt: payload.updatedAt,
            },
          },
        },
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proximo));

      const entrada: HistoricoEstoque = {
        ...payload,
        anterior,
        novo: payload.qtd,
        anteriorEstado: itemAnterior?.estado,
        novoEstado: payload.estado,
      };
      setHistorico((lista) => {
        const novoHistorico = [entrada, ...lista].slice(0, 200);
        historicoRef.current = novoHistorico;
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(novoHistorico));
        return novoHistorico;
      });

      return proximo;
    });

    const chave = `${payload.loja}|${payload.categoria}|${payload.produto}`;
    setAlterados((atual) => ({ ...atual, [chave]: Date.now() }));
    window.setTimeout(() => {
      setAlterados((atual) => {
        const novo = { ...atual };
        delete novo[chave];
        return novo;
      });
    }, 1000);

    if (externo) setNotificacoesExternas((valor) => valor + 1);
  }, []);

  const marcarAlterado = useCallback((payload: UpdatePayload) => {
    const chave = `${payload.loja}|${payload.categoria}|${payload.produto}`;
    setAlterados((atual) => ({ ...atual, [chave]: Date.now() }));
    window.setTimeout(() => {
      setAlterados((atual) => {
        const novo = { ...atual };
        delete novo[chave];
        return novo;
      });
    }, 1000);
  }, []);

  const desfazerUltimaAlteracao = useCallback((lojaFiltro?: string) => {
    const lista = historicoRef.current;
    const index = lista.findIndex(
      (entrada) => !lojaFiltro || entrada.loja === lojaFiltro,
    );

    if (index < 0) return null;

    const entrada = lista[index];
    const payload: UpdatePayload = {
      loja: entrada.loja,
      categoria: entrada.categoria,
      produto: entrada.produto,
      qtd: entrada.anterior ?? 0,
      estado: entrada.anteriorEstado ?? entrada.estado ?? "Normal",
      updatedAt: new Date().toISOString(),
      usuario,
    };

    setEstoque((atual) => {
      const proximo: EstoqueLocal = {
        ...atual,
        [payload.loja]: {
          ...atual[payload.loja],
          [payload.categoria]: {
            ...atual[payload.loja]?.[payload.categoria],
            [payload.produto]: {
              ...atual[payload.loja]?.[payload.categoria]?.[payload.produto],
              qtd: payload.qtd ?? 0,
              estado: payload.estado,
              updatedAt: payload.updatedAt,
            },
          },
        },
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proximo));
      return proximo;
    });

    const novoHistorico = lista.filter((_, itemIndex) => itemIndex !== index);
    historicoRef.current = novoHistorico;
    setHistorico(novoHistorico);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(novoHistorico));
    marcarAlterado(payload);

    return payload;
  }, [marcarAlterado, usuario]);

  // Sincronizacao entre abas via BroadcastChannel; entre dispositivos os dados
  // vem da API (TanStack Query com refetch periodico nas paginas).
  useEffect(() => {
    const channel = new BroadcastChannel("unistock-estoque");

    channel.onmessage = (event) => {
      if (event.data?.tipo === "estoque:update") {
        aplicarUpdate(event.data.payload, true);
      }
    };

    return () => channel.close();
  }, [aplicarUpdate]);

  const atualizarItem = useCallback(
    (
      loja: string,
      categoria: string,
      produto: string,
      data: { qtd?: number; estado?: EstadoProduto },
    ) => {
      const payload: UpdatePayload = {
        loja,
        categoria,
        produto,
        ...data,
        updatedAt: new Date().toISOString(),
        usuario,
      };

      aplicarUpdate(payload);

      const channel = new BroadcastChannel("unistock-estoque");
      channel.postMessage({ tipo: "estoque:update", payload });
      channel.close();
    },
    [aplicarUpdate, usuario],
  );

  const ultimaAtualizacao = useMemo(() => {
    let ultima = "";
    Object.values(estoque).forEach((categorias) => {
      Object.values(categorias).forEach((produtos) => {
        Object.values(produtos).forEach((item) => {
          if (item.updatedAt && item.updatedAt > ultima) ultima = item.updatedAt;
        });
      });
    });
    return ultima;
  }, [estoque]);

  return {
    estoque,
    historico,
    alterados,
    notificacoesExternas,
    ultimaAtualizacao,
    atualizarItem,
    desfazerUltimaAlteracao,
    limparBadge: () => setNotificacoesExternas(0),
  };
}
