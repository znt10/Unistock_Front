"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATEGORIAS_ESTOQUE,
  criarEstoqueInicial,
  type EstadoProduto,
  type EstoqueLocal,
} from "@/data/estruturaEstoque";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuthStore } from "@/stores/authStore";

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
};

function carregarEstoque() {
  if (typeof window === "undefined") return criarEstoqueInicial();

  const base = criarEstoqueInicial();
  const salvo = window.localStorage.getItem(STORAGE_KEY);
  if (!salvo) return base;

  try {
    const parsed = JSON.parse(salvo) as EstoqueLocal;
    return { ...base, ...parsed };
  } catch {
    return base;
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

  const aplicarUpdate = useCallback((payload: UpdatePayload, externo = false) => {
    setEstoque((atual) => {
      const anterior = atual[payload.loja]?.[payload.categoria]?.[payload.produto]?.qtd;
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
      };
      setHistorico((lista) => {
        const novoHistorico = [entrada, ...lista].slice(0, 200);
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

  const { conectado, enviar, pendentes } = useWebSocket((message) => {
    if (message.tipo === "estoque:update" && message.payload) {
      aplicarUpdate(message.payload as UpdatePayload, true);
    }
  });

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
      enviar({ tipo: "estoque:update", payload });

      const channel = new BroadcastChannel("unistock-estoque");
      channel.postMessage({ tipo: "estoque:update", payload });
      channel.close();
    },
    [aplicarUpdate, enviar, usuario],
  );

  const zerarLoja = useCallback(
    (loja: string) => {
      Object.entries(CATEGORIAS_ESTOQUE).forEach(([categoria, config]) => {
        config.produtos.forEach((produto) => {
          atualizarItem(loja, categoria, produto, { qtd: 0 });
        });
      });
    },
    [atualizarItem],
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
    conectado,
    pendentes,
    notificacoesExternas,
    ultimaAtualizacao,
    atualizarItem,
    zerarLoja,
    limparBadge: () => setNotificacoesExternas(0),
  };
}
