"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  PackageSearch,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useLojas } from "@/hooks/useLoja";
import { useProdutos } from "@/hooks/useProduto";
import { getEstoques } from "@/services/uni";
import { finalizarVenda } from "@/services/pdv";
import { selectIsGerente, useAuthStore } from "@/stores/authStore";
import type { PdvCarrinhoItem, PdvProdutoDisponivel } from "@/types/pdv";

function formatarUnidade(unidade?: string) {
  return unidade?.replaceAll("_", " ").toLowerCase() || "unidade";
}

export default function CaixaPDV() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const isGerente = useAuthStore(selectIsGerente);
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">(1);
  const [carrinho, setCarrinho] = useState<PdvCarrinhoItem[]>([]);
  const [mensagem, setMensagem] = useState("");

  const { data: lojas = [], isLoading: carregandoLojas } = useLojas();
  const { data: produtos = [], isLoading: carregandoProdutos } = useProdutos();
  const { data: estoques = [], isLoading: carregandoEstoques } = useQuery({
    queryKey: ["estoque"],
    queryFn: getEstoques,
    staleTime: 2 * 60 * 1000,
  });

  const lojaIdUsuario = usuario?.loja_id;
  const lojasVisiveis = useMemo(() => {
    if (isGerente) return lojas.filter((loja) => loja.ativo !== false);
    if (!lojaIdUsuario) return [];

    return lojas.filter((loja) => loja.id === lojaIdUsuario);
  }, [isGerente, lojaIdUsuario, lojas]);

  const lojaAtiva = lojaSelecionada || lojasVisiveis[0]?.id || "";

  const trocarLoja = (lojaId: string) => {
    setLojaSelecionada(lojaId);
    setCarrinho([]);
    setProdutoSelecionado("");
    setQuantidade(1);
    setMensagem("");
  };

  const produtosDisponiveis = useMemo<PdvProdutoDisponivel[]>(() => {
    if (!lojaAtiva) return [];

    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    const disponiveisPorProduto = new Map<string, PdvProdutoDisponivel>();

    estoques
      .filter(
        (estoque) =>
          estoque.loja === lojaAtiva && estoque.quantidade_atual > 0,
      )
      .map((estoque) => {
        const produto = produtosPorId.get(estoque.produto);
        if (!produto) return null;

        return {
          ...produto,
          estoque_id: estoque.id,
          loja_id: estoque.loja,
          quantidade_atual: estoque.quantidade_atual,
          quantidade_minima: estoque.quantidade_minima,
        };
      })
      .filter((produto): produto is PdvProdutoDisponivel => Boolean(produto))
      .forEach((produto) => {
        const existente = disponiveisPorProduto.get(produto.id);

        if (!existente) {
          disponiveisPorProduto.set(produto.id, produto);
          return;
        }

        disponiveisPorProduto.set(produto.id, {
          ...existente,
          quantidade_atual:
            existente.quantidade_atual + produto.quantidade_atual,
          quantidade_minima: Math.max(
            existente.quantidade_minima,
            produto.quantidade_minima,
          ),
        });
      });

    return Array.from(disponiveisPorProduto.values())
      .sort((a, b) => a.nome_produto.localeCompare(b.nome_produto));
  }, [estoques, lojaAtiva, produtos]);

  const produtoAtual = produtosDisponiveis.find(
    (produto) => produto.id === produtoSelecionado,
  );

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  const carregando = carregandoLojas || carregandoProdutos || carregandoEstoques;

  const mutation = useMutation({
    mutationFn: finalizarVenda,
    onSuccess: async (data) => {
      setCarrinho([]);
      setProdutoSelecionado("");
      setQuantidade(1);
      setMensagem(data.detail || "Venda finalizada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
    onError: (error) => {
      setMensagem(
        error instanceof Error ? error.message : "Nao foi possivel finalizar a venda.",
      );
    },
  });

  const adicionarProduto = () => {
    setMensagem("");
    if (!produtoAtual) return;

    const quantidadeVenda = Number(quantidade);
    if (!quantidadeVenda || quantidadeVenda < 1) {
      setMensagem("Informe uma quantidade maior que zero.");
      return;
    }

    const quantidadeNoCarrinho =
      carrinho.find((item) => item.produto.id === produtoAtual.id)?.quantidade ?? 0;
    const novaQuantidade = quantidadeNoCarrinho + quantidadeVenda;

    if (novaQuantidade > produtoAtual.quantidade_atual) {
      setMensagem(
        `Estoque insuficiente para ${produtoAtual.nome_produto}. Disponivel: ${produtoAtual.quantidade_atual}.`,
      );
      return;
    }

    setCarrinho((itens) => {
      const itemExistente = itens.find(
        (item) => item.produto.id === produtoAtual.id,
      );

      if (itemExistente) {
        return itens.map((item) =>
          item.produto.id === produtoAtual.id
            ? { ...item, quantidade: item.quantidade + quantidadeVenda }
            : item,
        );
      }

      return [...itens, { produto: produtoAtual, quantidade: quantidadeVenda }];
    });
    setQuantidade(1);
  };

  const removerProduto = (produtoId: string) => {
    setCarrinho((itens) => itens.filter((item) => item.produto.id !== produtoId));
  };

  const finalizar = () => {
    if (carrinho.length === 0 || !lojaAtiva) return;

    mutation.mutate({
      loja_id: lojaAtiva,
      itens: carrinho.map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
      })),
    });
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-theme-base text-theme-text-sub">
        <Sidebar />
        <main className="p-6 pt-20 lg:ml-64">Carregando...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub">
      <Sidebar />

      <main className="min-w-0 p-5 pt-20 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col gap-4 border-b border-theme-border pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-2 block text-xs font-black uppercase tracking-[3px] text-blue-500">
                PDV fake
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight text-theme-text-title">
                Caixa
              </h1>
              <p className="mt-1 text-sm font-medium text-theme-text-sub">
                Simule uma venda e envie a baixa de estoque para a API.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-theme-border bg-theme-card px-4 py-3 text-sm font-black text-theme-text-title">
              <ShoppingCart size={18} />
              {totalItens} item(ns)
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <section className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-sm">
              <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr_140px_auto]">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-theme-text-sub">
                    <Store size={15} /> Loja
                  </span>
                  <select
                    value={lojaAtiva}
                    onChange={(event) => trocarLoja(event.target.value)}
                    disabled={!isGerente || lojasVisiveis.length <= 1}
                    className="h-11 w-full rounded-lg border border-theme-border bg-theme-header px-3 text-sm font-bold text-theme-text-title outline-none focus:border-blue-500"
                  >
                    {lojasVisiveis.map((loja) => (
                      <option key={loja.id} value={loja.id}>
                        {loja.nome_loja}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-theme-text-sub">
                    <PackageSearch size={15} /> Produto
                  </span>
                  <select
                    value={produtoSelecionado}
                    onChange={(event) => setProdutoSelecionado(event.target.value)}
                    className="h-11 w-full rounded-lg border border-theme-border bg-theme-header px-3 text-sm font-bold text-theme-text-title outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione</option>
                    {produtosDisponiveis.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome_produto} - {produto.quantidade_atual} em estoque
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[2px] text-theme-text-sub">
                    Quantidade
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={produtoAtual?.quantidade_atual ?? 9999}
                    value={quantidade}
                    onChange={(event) => {
                      const valor = event.target.value;
                      setQuantidade(valor === "" ? "" : Number(valor));
                    }}
                    onWheel={(event) => event.currentTarget.blur()}
                    className="h-11 w-full rounded-lg border border-theme-border bg-theme-header px-3 text-sm font-bold text-theme-text-title outline-none focus:border-blue-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={adicionarProduto}
                  disabled={!produtoAtual || !quantidade || Number(quantidade) < 1}
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black uppercase tracking-[1px] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} /> Adicionar
                </button>
              </div>

              {carregando ? (
                <div className="rounded-lg border border-theme-border bg-theme-header p-10 text-center text-sm font-black uppercase tracking-[2px]">
                  Carregando produtos...
                </div>
              ) : produtosDisponiveis.length === 0 ? (
                <div className="rounded-lg border border-theme-border bg-theme-header p-10 text-center text-sm font-black uppercase tracking-[2px]">
                  Nenhum produto disponivel para venda nesta loja.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {produtosDisponiveis.map((produto) => (
                    <button
                      key={produto.id}
                      type="button"
                      onClick={() => setProdutoSelecionado(produto.id)}
                      className={`rounded-lg border p-4 text-left transition hover:border-blue-500 ${
                        produtoSelecionado === produto.id
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-theme-border bg-theme-header"
                      }`}
                    >
                      <h3 className="font-black uppercase text-theme-text-title">
                        {produto.nome_produto}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-theme-text-sub">
                        {produto.quantidade_atual} {formatarUnidade(produto.unidade_medida)}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[1px] text-theme-text-sub/70">
                        Minimo: {produto.quantidade_minima}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <aside className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-sm lg:sticky lg:top-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase text-theme-text-title">
                  Carrinho
                </h2>
                <span className="rounded-lg bg-theme-header px-3 py-2 text-sm font-black text-blue-500">
                  {totalItens}
                </span>
              </div>

              <div className="space-y-3">
                {carrinho.map((item) => (
                  <div
                    key={item.produto.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-theme-border bg-theme-header p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-black uppercase text-theme-text-title">
                        {item.produto.nome_produto}
                      </p>
                      <p className="text-sm font-medium text-theme-text-sub">
                        Qtd: {item.quantidade}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerProduto(item.produto.id)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/30 text-red-500 transition hover:bg-red-500/10"
                      aria-label={`Remover ${item.produto.nome_produto}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}

                {carrinho.length === 0 && (
                  <div className="rounded-lg border border-dashed border-theme-border p-8 text-center text-sm font-bold text-theme-text-sub">
                    Adicione produtos para iniciar a venda.
                  </div>
                )}
              </div>

              {mensagem && (
                <div className="mt-4 rounded-lg border border-theme-border bg-theme-header p-3 text-sm font-bold text-theme-text-title">
                  {mensagem}
                </div>
              )}

              <button
                type="button"
                onClick={finalizar}
                disabled={carrinho.length === 0 || mutation.isPending}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-600 text-sm font-black uppercase tracking-[1px] text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Finalizar venda
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
