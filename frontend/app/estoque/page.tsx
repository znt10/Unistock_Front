"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import BarraLojas from "@/components/estoque/BarraLojas";
import CategoriaEstoque from "@/components/estoque/CategoriaEstoque";
import TotalGeral from "@/components/estoque/TotalGeral";
import { useEstoque } from "@/hooks/useEstoque";
import { useLojas } from "@/hooks/useLoja";
import { useProdutos } from "@/hooks/useProduto";
import { getEstoques, patchEstoque, postEstoque } from "@/services/uni";
import { selectIsGerente, useAuthStore } from "@/stores/authStore";
import type { EstadoProduto, EstoqueLocal } from "@/data/estruturaEstoque";

const CATEGORIAS_VIEW: Record<
  string,
  {
    label: string;
    cor: "orange" | "red" | "blue" | "green";
    temEstado?: boolean;
  }
> = {
  SALGADOS_GDE: { label: "SALGADOS GDE", cor: "orange" },
  SALGADOS_MINI: { label: "SALGADOS MINI", cor: "orange", temEstado: true },
  ESFIHAS_GDE: { label: "ESFIHAS GDE", cor: "red" },
  ESFIHAS_MINI: { label: "ESFIHAS MINI", cor: "red" },
  RECHEIOS: { label: "RECHEIOS", cor: "blue" },
  MERCADO: { label: "MERCADO", cor: "green" },
};

const CATEGORIA_ALIASES: Record<string, keyof typeof CATEGORIAS_VIEW> = {
  "SALGADOS GDE": "SALGADOS_GDE",
  "SALGADOS GRANDE": "SALGADOS_GDE",
  "SALGADOS MINI": "SALGADOS_MINI",
  "ESFIHAS GDE": "ESFIHAS_GDE",
  "ESFIHAS GRANDE": "ESFIHAS_GDE",
  "ESFIHAS MINI": "ESFIHAS_MINI",
  RECHEIOS: "RECHEIOS",
  MERCADO: "MERCADO",
};

function normalizarCategoria(categoria?: string) {
  if (!categoria) return "MERCADO";
  const chave = categoria.trim().toUpperCase();
  return CATEGORIAS_VIEW[chave] ? chave : CATEGORIA_ALIASES[chave] || "MERCADO";
}

function normalizarEstado(estado?: string): EstadoProduto {
  if (estado === "CONGELADO") return "Congelado";
  if (estado === "RESFRIADO") return "Resfriado";
  return "Normal";
}

function estadoParaApi(estado?: EstadoProduto) {
  if (estado === "Congelado") return "CONGELADO";
  if (estado === "Resfriado") return "RESFRIADO";
  return "NORMAL";
}

function formatarData(data?: string) {
  if (!data) return "Sem atualizacao";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

export default function EstoquePage() {
  const queryClient = useQueryClient();
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("TODAS");
  const [agora, setAgora] = useState(() => Date.now());
  const usuario = useAuthStore((state) => state.user);
  const lojaIdUsuario = usuario?.loja_id;
  const isGerente = useAuthStore(selectIsGerente);
  const { data: lojasQuery = [], isLoading: carregandoLojas } = useLojas();
  const { data: produtosQuery = [], isLoading: carregandoProdutos } =
    useProdutos();
  const { data: estoquesApi = [], isLoading: carregandoEstoques } = useQuery({
    queryKey: ["estoque"],
    queryFn: getEstoques,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
  const lojas = useMemo(() => {
    const todas = Array.isArray(lojasQuery) ? lojasQuery : [];

    if (isGerente) return todas;
    if (!lojaIdUsuario) return [];

    return todas.filter((loja) => loja.id === lojaIdUsuario);
  }, [isGerente, lojaIdUsuario, lojasQuery]);
  const produtos = useMemo(
    () => (Array.isArray(produtosQuery) ? produtosQuery : []),
    [produtosQuery],
  );
  const {
    estoque,
    historico,
    alterados,
    notificacoesExternas,
    ultimaAtualizacao,
    atualizarItem,
    desfazerUltimaAlteracao,
    limparBadge,
  } = useEstoque();

  const lojaAtiva = isGerente
    ? lojaSelecionada || "TODAS"
    : lojaIdUsuario || lojas[0]?.id || "";
  const lojaAtivaNome =
    lojaAtiva === "TODAS"
      ? "Todas as lojas"
      : lojas.find((loja) => loja.id === lojaAtiva)?.nome_loja ||
        "Selecione uma loja";

  const categorias = useMemo(() => {
    const agrupadas = new Map<string, Map<string, string>>();

    produtos
      .filter((produto) => produto.ativo !== false)
      .forEach((produto) => {
        const categoriaCodigo = normalizarCategoria(produto.categoria);
        const config =
          CATEGORIAS_VIEW[categoriaCodigo] || CATEGORIAS_VIEW.MERCADO;
        const produtosCategoria =
          agrupadas.get(config.label) || new Map<string, string>();
        produtosCategoria.set(produto.id, produto.nome_produto);
        agrupadas.set(config.label, produtosCategoria);
      });

    return Object.entries(CATEGORIAS_VIEW)
      .map(([, config]) => ({
        categoria: config.label,
        cor: config.cor,
        temEstado: config.temEstado,
        produtos: Array.from(agrupadas.get(config.label) || [])
          .map(([id, nome]) => ({ id, nome }))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [produtos]);

  const categoriaPorProduto = useMemo(() => {
    const mapa = new Map<string, string>();

    produtos.forEach((produto) => {
      const categoriaCodigo = normalizarCategoria(produto.categoria);
      const config =
        CATEGORIAS_VIEW[categoriaCodigo] || CATEGORIAS_VIEW.MERCADO;
      mapa.set(produto.id, config.label);
    });

    return mapa;
  }, [produtos]);

  const nomePorLoja = useMemo(() => {
    const mapa = new Map<string, string>();

    lojas.forEach((loja) => {
      mapa.set(loja.id, loja.nome_loja);
    });

    return mapa;
  }, [lojas]);

  const nomePorProduto = useMemo(() => {
    const mapa = new Map<string, string>();

    produtos.forEach((produto) => {
      mapa.set(produto.id, produto.nome_produto);
    });

    return mapa;
  }, [produtos]);

  const estoqueVisivel = useMemo(() => {
    const base: EstoqueLocal = { ...estoque };

    estoquesApi.forEach((item) => {
      const categoria = categoriaPorProduto.get(item.produto) || "MERCADO";

      base[item.loja] = {
        ...base[item.loja],
        [categoria]: {
          ...base[item.loja]?.[categoria],
          [item.produto]: {
            qtd: item.quantidade_atual,
            estado: normalizarEstado(item.estado),
            updatedAt: item.atualizado_em,
          },
        },
      };
    });

    return base;
  }, [categoriaPorProduto, estoque, estoquesApi]);

  const historicoVisivel = useMemo(() => {
    if (isGerente) return historico;
    if (!lojaAtiva) return [];

    return historico.filter((item) => item.loja === lojaAtiva);
  }, [historico, isGerente, lojaAtiva]);

  useEffect(() => {
    const timer = window.setInterval(() => setAgora(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const trocarLoja = (loja: string) => {
    if (!isGerente && loja !== lojaIdUsuario) return;

    setLojaSelecionada(loja);
    limparBadge();
  };

  const salvarEstoqueApi = useCallback(async (
    loja: string,
    produto: string,
    data: { qtd?: number; estado?: EstadoProduto },
  ) => {
    const itemAtual =
      estoqueVisivel[loja]?.[categoriaPorProduto.get(produto) || "MERCADO"]?.[
        produto
      ];
    const registro = estoquesApi.find(
      (item) => item.loja === loja && item.produto === produto,
    );
    const quantidadeAtual = data.qtd ?? itemAtual?.qtd ?? 0;
    const estadoAtual = estadoParaApi(data.estado ?? itemAtual?.estado);

    if (registro) {
      await patchEstoque(registro.id, {
        quantidade_atual: quantidadeAtual,
        estado: estadoAtual,
      });
    } else {
      await postEstoque({
        loja,
        produto,
        quantidade_atual: quantidadeAtual,
        quantidade_minima: 0,
        estado: estadoAtual,
      });
    }

    await queryClient.invalidateQueries({ queryKey: ["estoque"] });
  }, [categoriaPorProduto, estoqueVisivel, estoquesApi, queryClient]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const alvo = event.target as HTMLElement | null;
      const tagName = alvo?.tagName;
      const digitando =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        Boolean(alvo?.isContentEditable);

      if (
        digitando ||
        event.shiftKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "z"
      ) {
        return;
      }

      event.preventDefault();

      const lojaFiltro =
        isGerente && lojaAtiva === "TODAS" ? undefined : lojaAtiva;
      const alteracao = desfazerUltimaAlteracao(lojaFiltro);

      if (!alteracao) return;

      salvarEstoqueApi(alteracao.loja, alteracao.produto, {
        qtd: alteracao.qtd,
        estado: alteracao.estado,
      }).catch((error) => {
        alert(
          error instanceof Error
            ? error.message
            : "Erro ao desfazer alteracao.",
        );
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [desfazerUltimaAlteracao, isGerente, lojaAtiva, salvarEstoqueApi]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub">
      <Sidebar />

      <main className="min-w-0 pt-16 lg:ml-64 lg:pt-0">
        <header className="sticky top-0 z-20 border-b border-theme-border bg-theme-base/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-2 block text-xs font-black uppercase tracking-[3px] text-blue-500">
                Controle por loja
              </span>
              <h1 className="break-words text-2xl font-black uppercase tracking-tight text-theme-text-title sm:text-3xl md:text-4xl">
                {lojaAtivaNome.toUpperCase() === "ZILDA"
                  ? "ZILDA / CASA VERDE"
                  : lojaAtivaNome}
              </h1>
              <p className="mt-1 text-sm font-medium text-theme-text-sub sm:text-base">
                {produtos.length} produto(s) carregado(s) · Ultima atualizacao:{" "}
                {formatarData(ultimaAtualizacao)}
              </p>
            </div>
          </div>

          <BarraLojas
            lojaAtiva={lojaAtiva}
            lojas={lojas}
            onChange={trocarLoja}
            notificacoesExternas={notificacoesExternas}
            mostrarTodas={isGerente}
          />
        </header>

        <div className="space-y-5 px-5 py-6 md:px-8">
          {carregandoLojas || carregandoProdutos || carregandoEstoques ? (
            <div className="rounded-lg border border-theme-border bg-theme-card p-10 text-center text-base font-black uppercase tracking-[2px] text-theme-text-sub">
              Carregando lojas, produtos e estoque...
            </div>
          ) : lojas.length === 0 ? (
            <div className="rounded-lg border border-theme-border bg-theme-card p-10 text-center text-base font-black uppercase tracking-[2px] text-theme-text-sub">
              Nenhuma loja cadastrada.
            </div>
          ) : categorias.length === 0 ? (
            <div className="rounded-lg border border-theme-border bg-theme-card p-10 text-center text-base font-black uppercase tracking-[2px] text-theme-text-sub">
              Nenhum produto cadastrado.
            </div>
          ) : lojaAtiva === "TODAS" ? (
            <TotalGeral
              estoque={estoqueVisivel}
              lojas={lojas}
              categorias={categorias}
            />
          ) : (
            categorias.map((config) => (
              <CategoriaEstoque
                key={config.categoria}
                loja={lojaAtiva}
                categoria={config.categoria}
                cor={config.cor}
                produtos={config.produtos}
                temEstado={config.temEstado}
                itens={estoqueVisivel[lojaAtiva]?.[config.categoria] || {}}
                alterados={alterados}
                agora={agora}
                onUpdate={(loja, categoria, produto, data) => {
                  atualizarItem(loja, categoria, produto, data);
                  salvarEstoqueApi(loja, produto, data).catch((error) => {
                    alert(
                      error instanceof Error
                        ? error.message
                        : "Erro ao salvar estoque.",
                    );
                  });
                }}
              />
            ))
          )}

          <section className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-black uppercase tracking-[2px] text-theme-text-title">
                Historico recente
              </h2>
              <span className="text-sm font-medium text-theme-text-sub">
                Ultimas {Math.min(historicoVisivel.length, 8)} alteracoes
              </span>
            </div>
            <div className="space-y-2">
              {historicoVisivel.slice(0, 8).map((item, index) => (
                <div
                  key={`${item.updatedAt}-${index}`}
                  className="flex flex-col justify-between gap-1 rounded-lg bg-theme-header px-3 py-2 text-sm md:flex-row md:items-center"
                >
                  <span className="font-bold text-theme-text-title">
                    {nomePorLoja.get(item.loja) || item.loja} / {item.categoria}{" "}
                    / {nomePorProduto.get(item.produto) || item.produto}
                  </span>
                  <span className="text-theme-text-sub">
                    {item.anterior ?? "-"} para {item.novo ?? item.qtd ?? "-"}{" "}
                    por {item.usuario || "Usuario"} em{" "}
                    {formatarData(item.updatedAt)}
                  </span>
                </div>
              ))}
              {historicoVisivel.length === 0 && (
                <p className="text-base font-medium text-theme-text-sub">
                  Nenhuma alteracao registrada ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
