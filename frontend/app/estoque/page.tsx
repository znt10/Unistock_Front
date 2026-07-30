"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Boxes, CheckCircle2, Plus, TrendingDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BarraLojas from "@/features/estoque/components/BarraLojas";
import CategoriaEstoque from "@/features/estoque/components/CategoriaEstoque";
import HistoricoEstoque from "@/features/estoque/components/HistoricoEstoque";
import TotalGeral from "@/features/estoque/components/TotalGeral";
import { useEstoque } from "@/features/estoque/hooks/useEstoque";
import { useLojas } from "@/features/lojas/hooks/useLoja";
import { PRODUTOS_QUERY_KEY, type Produto, useProdutos } from "@/features/produtos/hooks/useProduto";
import { useCategorias } from "@/features/produtos/hooks/useCategorias";
import NovaCategoriaModal from "@/features/produtos/components/NovaCategoriaModal";
import { getEstoques, patchEstoque, postEstoque } from "@/features/estoque/services/estoque";
import { patchProduto } from "@/features/produtos/services/produtos";
import { selectIsGerente, useAuthStore } from "@/shared/stores/authStore";
import type { EstadoProduto, EstoqueLocal } from "@/features/estoque/data/estruturaEstoque";

const SEM_CATEGORIA = "Sem categoria";

// Sem cor cadastrada no backend: cicla uma paleta fixa na ordem das
// categorias (config.ordem), assim a mesma tela sempre re-gera as mesmas
// cores enquanto a lista de categorias nao mudar.
const PALETA_CORES: readonly ("orange" | "red" | "blue" | "green")[] = [
  "orange",
  "red",
  "green",
  "blue",
];

function normalizarEstado(estado?: string): EstadoProduto {
  if (estado === "CONGELADO") return "Congelado";
  return "Normal";
}

function estadoParaApi(estado?: EstadoProduto) {
  if (estado === "Congelado") return "CONGELADO";
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
  const { data: categoriasApi = [] } = useCategorias();
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const { data: estoquesApi = [], isLoading: carregandoEstoques } = useQuery({
    queryKey: ["estoque"],
    queryFn: getEstoques,
    // Substitui o antigo WebSocket: atualiza sozinho a cada 30s.
    refetchInterval: 30 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
    const agrupadas = new Map<
      string,
      Map<
        string,
        {
          id: string;
          nome: string;
          unidade_medida?: string;
          quantidade_por_embalagem?: number | null;
          estoque_minimo_sugerido?: number;
        }
      >
    >();

    produtos.forEach((produto) => {
      const nomeCategoria = produto.categoria_nome || SEM_CATEGORIA;
      const produtosCategoria = agrupadas.get(nomeCategoria) || new Map();
      produtosCategoria.set(produto.id, {
        id: produto.id,
        nome: produto.nome_produto,
        unidade_medida: produto.unidade_medida,
        quantidade_por_embalagem: produto.quantidade_por_embalagem,
        estoque_minimo_sugerido: produto.estoque_minimo_sugerido,
      });
      agrupadas.set(nomeCategoria, produtosCategoria);
    });

    const ordemPorNome = new Map(categoriasApi.map((c) => [c.nome, c.ordem]));

    return Array.from(agrupadas.entries())
      .sort(([nomeA], [nomeB]) => {
        const ordemA = ordemPorNome.get(nomeA) ?? 999;
        const ordemB = ordemPorNome.get(nomeB) ?? 999;
        if (ordemA !== ordemB) return ordemA - ordemB;
        return nomeA.localeCompare(nomeB);
      })
      .map(([nomeCategoria, produtosCategoria], indice) => ({
        categoria: nomeCategoria,
        cor: PALETA_CORES[indice % PALETA_CORES.length],
        // Estoque.estado (Normal/Congelado) e um campo generico do backend,
        // nao restrito a categoria — mostra o controle pra todas.
        temEstado: true,
        produtos: Array.from(produtosCategoria.values())
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      }));
  }, [produtos, categoriasApi]);

  const categoriaPorProduto = useMemo(() => {
    const mapa = new Map<string, string>();

    produtos.forEach((produto) => {
      mapa.set(produto.id, produto.categoria_nome || SEM_CATEGORIA);
    });

    return mapa;
  }, [produtos]);

  const produtoPorId = useMemo(() => {
    const mapa = new Map<string, Produto>();

    produtos.forEach((produto) => {
      mapa.set(produto.id, produto);
    });

    return mapa;
  }, [produtos]);

  const minimoPorEstoque = useMemo(() => {
    const mapa: Record<string, Record<string, number>> = {};

    estoquesApi.forEach((item) => {
      mapa[item.loja] = {
        ...mapa[item.loja],
        [item.produto]: item.quantidade_minima,
      };
    });

    return mapa;
  }, [estoquesApi]);

  const estoqueVisivel = useMemo(() => {
    const base: EstoqueLocal = { ...estoque };

    estoquesApi.forEach((item) => {
      const categoria = categoriaPorProduto.get(item.produto) || SEM_CATEGORIA;

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

  const resumoEstoqueLoja = useMemo(() => {
    if (!lojaAtiva || lojaAtiva === "TODAS") {
      return {
        total: 0,
        emDia: 0,
        estoqueBaixo: 0,
        emFalta: 0,
      };
    }

    return categorias.reduce(
      (resumo, config) => {
        config.produtos.forEach((produto) => {
          const item = estoqueVisivel[lojaAtiva]?.[config.categoria]?.[produto.id];
          const qtd = item?.qtd ?? 0;
          const minimo =
            minimoPorEstoque[lojaAtiva]?.[produto.id] ??
            produto.estoque_minimo_sugerido ??
            1;

          resumo.total += qtd;

          if (qtd <= 0) {
            resumo.emFalta += 1;
          } else if (qtd <= minimo) {
            resumo.estoqueBaixo += 1;
          } else {
            resumo.emDia += 1;
          }
        });

        return resumo;
      },
      {
        total: 0,
        emDia: 0,
        estoqueBaixo: 0,
        emFalta: 0,
      },
    );
  }, [categorias, estoqueVisivel, lojaAtiva, minimoPorEstoque]);

  const nomePorLoja = useMemo(() => {
    const mapa = new Map<string, string>();
    lojas.forEach((loja) => mapa.set(loja.id, loja.nome_loja));
    return mapa;
  }, [lojas]);

  const nomePorProduto = useMemo(() => {
    const mapa = new Map<string, string>();
    produtos.forEach((produto) => mapa.set(produto.id, produto.nome_produto));
    return mapa;
  }, [produtos]);

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
    data: { qtd?: number; minimo?: number; estado?: EstadoProduto },
  ) => {
    const produtoDados = produtoPorId.get(produto);
    const itemAtual =
      estoqueVisivel[loja]?.[categoriaPorProduto.get(produto) || SEM_CATEGORIA]?.[
        produto
      ];
    const registro = estoquesApi.find(
      (item) => item.loja === loja && item.produto === produto,
    );
    const quantidadeAtual = data.qtd ?? itemAtual?.qtd ?? 0;
    const quantidadeMinima =
      data.minimo ??
      registro?.quantidade_minima ??
      produtoDados?.estoque_minimo_sugerido ??
      1;
    const estadoAtual = estadoParaApi(data.estado ?? itemAtual?.estado);

    if (registro) {
      await patchEstoque(registro.id, {
        quantidade_atual: quantidadeAtual,
        quantidade_minima: quantidadeMinima,
        estado: estadoAtual,
      });
    } else {
      await postEstoque({
        loja,
        produto,
        quantidade_atual: quantidadeAtual,
        quantidade_minima: quantidadeMinima,
        estado: estadoAtual,
      });
    }

    await queryClient.invalidateQueries({ queryKey: ["estoque"] });
    await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
  }, [categoriaPorProduto, estoqueVisivel, estoquesApi, produtoPorId, queryClient]);

  const salvarProdutoApi = useCallback(async (
    produto: string,
    data: {
      unidade_medida?: string;
      quantidade_por_embalagem?: number | null;
    },
  ) => {
    const produtoAtual = produtoPorId.get(produto);
    if (!produtoAtual) return;

    const produtoAtualizado = await patchProduto(produto, data);

    queryClient.setQueryData<Produto[] | undefined>(
      PRODUTOS_QUERY_KEY,
      (produtosAtuais) =>
        produtosAtuais?.map((item) =>
          item.id === produto ? { ...item, ...produtoAtualizado } : item,
        ),
    );

    await queryClient.invalidateQueries({
      queryKey: PRODUTOS_QUERY_KEY,
      refetchType: "inactive",
    });
  }, [produtoPorId, queryClient]);

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
        toast.error(
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
                {produtos.length} produto(s) carregado(s) - Ultima atualizacao:{" "}
                {formatarData(ultimaAtualizacao)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalCategoriaAberto(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-xs font-black uppercase tracking-[1px] text-theme-text-sub transition hover:border-blue-500/40 hover:text-blue-500 active:scale-95 md:w-auto"
            >
              <Plus size={16} strokeWidth={3} />
              Nova categoria
            </button>
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
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Itens em estoque",
                    valor: resumoEstoqueLoja.total,
                    icon: Boxes,
                    className: "bg-blue-500/10 text-blue-400",
                  },
                  {
                    label: "Em dia",
                    valor: resumoEstoqueLoja.emDia,
                    icon: CheckCircle2,
                    className: "bg-emerald-500/10 text-emerald-400",
                  },
                  {
                    label: "Estoque baixo",
                    valor: resumoEstoqueLoja.estoqueBaixo,
                    icon: TrendingDown,
                    className: "bg-amber-500/10 text-amber-400",
                  },
                  {
                    label: "Em falta",
                    valor: resumoEstoqueLoja.emFalta,
                    icon: AlertTriangle,
                    className: "bg-red-500/10 text-red-400",
                  },
                ].map((card) => {
                  const Icone = card.icon;

                  return (
                    <article
                      key={card.label}
                      className="flex min-h-24 items-center gap-4 rounded-2xl border border-theme-border bg-theme-card px-5 py-4 shadow-sm"
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${card.className}`}
                      >
                        <Icone size={22} />
                      </span>
                      <div>
                        <strong className="block text-3xl font-black leading-none text-theme-text-title">
                          {card.valor}
                        </strong>
                        <span className="mt-2 block text-xs font-black uppercase tracking-[1px] text-theme-text-sub">
                          {card.label}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </section>

              {categorias.map((config) => (
                <CategoriaEstoque
                  key={config.categoria}
                  loja={lojaAtiva}
                  categoria={config.categoria}
                  cor={config.cor}
                  produtos={config.produtos}
                  temEstado={config.temEstado}
                  itens={estoqueVisivel[lojaAtiva]?.[config.categoria] || {}}
                  minimos={minimoPorEstoque[lojaAtiva] || {}}
                  alterados={alterados}
                  agora={agora}
                  podeEditarProduto={isGerente}
                  onUpdate={(loja, categoria, produto, data) => {
                    salvarEstoqueApi(loja, produto, data)
                      .then(() => {
                        if (data.qtd !== undefined || data.estado !== undefined) {
                          atualizarItem(loja, categoria, produto, data);
                        }
                      })
                      .catch((error) => {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Erro ao salvar estoque.",
                        );
                      });
                  }}
                  onProdutoUpdate={(produto, data) => {
                    salvarProdutoApi(produto, data).catch((error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Erro ao atualizar produto.",
                      );
                    });
                  }}
                />
              ))}
            </>
          )}
          <HistoricoEstoque
            historico={historicoVisivel}
            nomePorLoja={nomePorLoja}
            nomePorProduto={nomePorProduto}
            limite={8}
          />
        </div>
      </main>

      {modalCategoriaAberto && (
        <NovaCategoriaModal
          onClose={() => setModalCategoriaAberto(false)}
          onCriada={() => {}}
        />
      )}
    </div>
  );
}
