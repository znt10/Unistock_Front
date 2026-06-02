"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Package } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  PRODUTOS_QUERY_KEY,
  type Produto,
  useProdutos,
} from "@/hooks/useProduto";
import { postProduto } from "@/services/uni";

const CATEGORIAS = [
  { valor: "SALGADOS_GDE", label: "Salgados grande", dot: "bg-orange-500" },
  { valor: "SALGADOS_MINI", label: "Salgados mini", dot: "bg-orange-500" },
  { valor: "ESFIHAS_GDE", label: "Esfihas grande", dot: "bg-red-500" },
  { valor: "ESFIHAS_MINI", label: "Esfihas mini", dot: "bg-red-500" },
  { valor: "FOGAZZAS_GDE", label: "Fogazzas grande", dot: "bg-emerald-500" },
  { valor: "FOGAZZAS_MINI", label: "Fogazzas mini", dot: "bg-emerald-500" },
  { valor: "RECHEIOS", label: "Recheios", dot: "bg-blue-500" },
  { valor: "MERCADO", label: "Mercado", dot: "bg-emerald-500" },
] as const;

const CATEGORIA_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.valor, c.label]),
);

function normalizarTexto(valor?: string) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function NovoProduto() {
  const queryClient = useQueryClient();
  const { data: produtosExistentes = [] } = useProdutos();

  const [nomeProduto, setNomeProduto] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("1");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const produtosComNomeParecido = useMemo(() => {
    const nomeNormalizado = normalizarTexto(nomeProduto);
    if (!nomeNormalizado) return [];
    return produtosExistentes.filter(
      (produto) => normalizarTexto(produto.nome_produto) === nomeNormalizado,
    );
  }, [nomeProduto, produtosExistentes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nomeProduto.trim()) return setError("Informe o nome do produto.");
    if (!categoria) return setError("Selecione a categoria do produto.");
    if (!estoqueMinimo || Number(estoqueMinimo) < 0)
      return setError("Informe o estoque minimo sugerido.");

    try {
      setLoading(true);
      const produtoCriado = await postProduto(
        nomeProduto.trim(),
        categoria,
        null,
        Number(estoqueMinimo),
      );
      queryClient.setQueryData<Produto[] | undefined>(
        PRODUTOS_QUERY_KEY,
        (produtosAtuais) => {
          if (!produtosAtuais) return [produtoCriado];
          if (produtosAtuais.some((p) => p.id === produtoCriado.id))
            return produtosAtuais;
          return [...produtosAtuais, produtoCriado].sort((a, b) =>
            a.nome_produto.localeCompare(b.nome_produto),
          );
        },
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUTOS_QUERY_KEY,
        refetchType: "inactive",
      });
      setSuccess("Produto cadastrado com sucesso.");
      setNomeProduto("");
      setEstoqueMinimo("1");
      setCategoria("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao cadastrar produto.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-theme-border bg-theme-header py-4 px-5 text-sm font-bold uppercase text-theme-text-title placeholder:text-theme-text-sub/25 transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5";
  const labelClass =
    "ml-1 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50";

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex min-w-0 flex-1 items-center justify-center p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:min-h-screen lg:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <Link
            href="/produtos"
            className="mb-8 inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500 group"
          >
            <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </span>
            <span className="text-[11px] font-black uppercase tracking-[2px]">
              Voltar para Produtos
            </span>
          </Link>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              Cadastrar Produto
            </h1>
            <p className="mt-3 font-medium text-theme-text-sub/60">
              Registre um novo item para uso nos pedidos e no estoque.
            </p>
          </div>

          <div className="w-full">
            {/* ---------- Formulario ---------- */}
            <div className="rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-xl sm:p-8">
              <form className="space-y-7" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="nome-produto" className={labelClass}>
                    Nome do produto
                  </label>
                  <div className="group relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-theme-text-sub/40 transition-colors group-focus-within:text-blue-500">
                      <Package size={18} />
                    </span>
                    <input
                      id="nome-produto"
                      type="text"
                      value={nomeProduto}
                      onChange={(e) => setNomeProduto(e.target.value)}
                      placeholder="EX: COXINHA"
                      className={`${inputClass} pl-14`}
                      required
                    />
                  </div>
                </div>

                {produtosComNomeParecido.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-500">
                    <p className="font-black uppercase tracking-[1px]">
                      Ja existem produtos com esse nome
                    </p>
                    <div className="mt-3 space-y-2">
                      {produtosComNomeParecido.map((produto) => (
                        <div
                          key={produto.id}
                          className="rounded-xl bg-theme-header px-4 py-3"
                        >
                          <span className="font-black text-theme-text-title">
                            {produto.nome_produto}
                          </span>
                          <span className="font-bold text-theme-text-sub">
                            {" "}
                            -{" "}
                            {CATEGORIA_LABELS[produto.categoria || ""] ||
                              produto.categoria ||
                              "Sem categoria"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="estoque-minimo" className={labelClass}>
                    Estoque minimo sugerido
                  </label>
                  <input
                    id="estoque-minimo"
                    type="number"
                    min={0}
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder="EX: 2"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Categoria em chips */}
                <div className="space-y-2">
                  <span className={labelClass}>Categoria</span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((c) => (
                      <button
                        type="button"
                        key={c.valor}
                        onClick={() => setCategoria(c.valor)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-[1px] transition ${
                          categoria === c.valor
                            ? "border-blue-600 bg-blue-600/10 text-blue-500"
                            : "border-theme-border bg-theme-header text-theme-text-sub hover:text-theme-text-title"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-sm ${c.dot}`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <Check size={16} /> {success}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNomeProduto("");
                      setEstoqueMinimo("1");
                      setCategoria("");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="flex items-center justify-center rounded-2xl border border-red-500/20 py-4 text-[12px] font-black uppercase tracking-widest text-red-500/70 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
                  >
                    Limpar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl border-none bg-blue-600 py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Salvar produto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
