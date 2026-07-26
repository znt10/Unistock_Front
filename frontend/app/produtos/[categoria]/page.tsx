"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  Package,
  PackageSearch,
  SearchX,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  PRODUTOS_QUERY_KEY,
  useProdutos,
  type Produto,
} from "@/features/produtos/hooks/useProduto";
import { patchProduto, deleteProduto } from "@/features/produtos/services/produtos";

// ─── Mapa de categorias ───────────────────────────────────────────────────────

const CATEGORIAS_INFO: Record<
  string,
  { label: string; grupo: string; cor: string; borda: string; bg: string; acento: string }
> = {
  SALGADOS_GDE:  { label: "Salgados Grande", grupo: "Salgados", cor: "text-orange-500",  borda: "border-orange-500/30",  bg: "bg-orange-500/10",  acento: "bg-orange-500"  },
  SALGADOS_MINI: { label: "Salgados Mini",   grupo: "Salgados", cor: "text-orange-400",  borda: "border-orange-400/30",  bg: "bg-orange-400/10",  acento: "bg-orange-400"  },
  ESFIHAS_GDE:   { label: "Esfihas Grande",  grupo: "Esfihas",  cor: "text-red-500",     borda: "border-red-500/30",     bg: "bg-red-500/10",     acento: "bg-red-500"     },
  ESFIHAS_MINI:  { label: "Esfihas Mini",    grupo: "Esfihas",  cor: "text-red-400",     borda: "border-red-400/30",     bg: "bg-red-400/10",     acento: "bg-red-400"     },
  FOGAZZAS_GDE:  { label: "Fogazzas Grande", grupo: "Fogazzas", cor: "text-emerald-500", borda: "border-emerald-500/30", bg: "bg-emerald-500/10", acento: "bg-emerald-500" },
  FOGAZZAS_MINI: { label: "Fogazzas Mini",   grupo: "Fogazzas", cor: "text-emerald-400", borda: "border-emerald-400/30", bg: "bg-emerald-400/10", acento: "bg-emerald-400" },
  RECHEIOS:      { label: "Recheios",         grupo: "Outros",  cor: "text-blue-400",    borda: "border-blue-400/30",    bg: "bg-blue-400/10",    acento: "bg-blue-400"    },
  MERCADO:       { label: "Mercado",          grupo: "Outros",  cor: "text-violet-400",  borda: "border-violet-400/30",  bg: "bg-violet-400/10",  acento: "bg-violet-400"  },
};

// ─── Linha de produto ─────────────────────────────────────────────────────────

function LinhaProduto({ produto }: { produto: Produto }) {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);
  const [nome, setNome] = useState(produto.nome_produto);
  const [estoqueMin, setEstoqueMin] = useState(
    String(produto.estoque_minimo_sugerido ?? 1),
  );
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  function cancelarEdicao() {
    setNome(produto.nome_produto);
    setEstoqueMin(String(produto.estoque_minimo_sugerido ?? 1));
    setEditando(false);
  }

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      const atualizado = await patchProduto(produto.id, {
        nome_produto: nome.trim(),
        estoque_minimo_sugerido: Number(estoqueMin),
      });
      queryClient.setQueryData<Produto[]>(PRODUTOS_QUERY_KEY, (prev = []) =>
        prev.map((p) => (p.id === produto.id ? { ...p, ...atualizado } : p)),
      );
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    setRemovendo(true);
    try {
      await deleteProduto(produto.id);
      queryClient.setQueryData<Produto[]>(PRODUTOS_QUERY_KEY, (prev = []) =>
        prev.filter((p) => p.id !== produto.id),
      );
    } finally {
      setRemovendo(false);
      setConfirmandoDelete(false);
    }
  }

  const acento = editando
    ? { boxShadow: "inset 3px 0 0 #3b82f6", background: "color-mix(in srgb, #3b82f6 6%, var(--card))" }
    : confirmandoDelete
    ? { boxShadow: "inset 3px 0 0 #ef4444", background: "color-mix(in srgb, #ef4444 5%, var(--card))" }
    : {};

  if (editando) {
    return (
      <tr style={acento}>
        <td className="px-5 py-4">
          <label htmlFor={`nome-${produto.id}`} className="sr-only">
            Nome do produto
          </label>
          <input
            id={`nome-${produto.id}`}
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-blue-500/40 bg-theme-base px-3 py-2 text-sm font-bold text-theme-text-title outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </td>
        <td className="px-5 py-4 text-sm font-semibold text-theme-text-sub">
          {produto.unidade_medida ?? "—"}
        </td>
        <td className="px-5 py-4">
          <label htmlFor={`estoque-${produto.id}`} className="sr-only">
            Estoque mínimo sugerido
          </label>
          <input
            id={`estoque-${produto.id}`}
            type="number"
            min={0}
            value={estoqueMin}
            onChange={(e) => setEstoqueMin(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-24 rounded-lg border border-blue-500/40 bg-theme-base px-3 py-2 text-sm font-bold text-theme-text-title outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="rounded-lg bg-blue-600 p-2.5 text-white shadow-md shadow-blue-900/30 transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              aria-label="Salvar"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub transition hover:bg-theme-hover active:scale-95"
              aria-label="Cancelar"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  if (confirmandoDelete) {
    return (
      <tr style={acento}>
        <td className="px-5 py-4" colSpan={3}>
          <span className="text-sm font-bold text-theme-text-sub">
            Remover{" "}
            <span className="font-black text-theme-text-title">
              {produto.nome_produto}
            </span>
            ?
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={remover}
              disabled={removendo}
              className="rounded-lg bg-red-600 p-2.5 text-white shadow-md shadow-red-900/30 transition hover:bg-red-500 active:scale-95 disabled:opacity-50"
              aria-label="Confirmar remoção"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoDelete(false)}
              className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub transition hover:bg-theme-hover active:scale-95"
              aria-label="Cancelar"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group transition-colors hover:bg-theme-hover">
      <td className="px-5 py-5">
        <span className="text-sm font-black uppercase tracking-wide text-theme-text-title">
          {produto.nome_produto}
        </span>
      </td>
      <td className="px-5 py-5">
        <span className="inline-flex items-center rounded-full border border-theme-border bg-theme-header px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-theme-text-sub">
          {produto.unidade_medida ?? "—"}
        </span>
      </td>
      <td className="px-5 py-5">
        <span className="text-sm font-black text-theme-text-title">
          {produto.estoque_minimo_sugerido ?? "—"}
        </span>
      </td>
      <td className="px-5 py-5">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub/70 transition hover:border-blue-500/40 hover:text-blue-400 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Editar ${produto.nome_produto}`}
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoDelete(true)}
            className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub/70 transition hover:border-red-500/40 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Remover ${produto.nome_produto}`}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Linha de esqueleto (carregamento) ────────────────────────────────────────

function LinhaEsqueleto() {
  return (
    <tr>
      <td className="px-5 py-5">
        <div className="h-4 w-36 animate-pulse rounded-full bg-theme-header" />
      </td>
      <td className="px-5 py-5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-theme-header" />
      </td>
      <td className="px-5 py-5">
        <div className="h-4 w-8 animate-pulse rounded-full bg-theme-header" />
      </td>
      <td className="px-5 py-5">
        <div className="mx-auto h-8 w-20 animate-pulse rounded-lg bg-theme-header" />
      </td>
    </tr>
  );
}

// ─── Página de categoria ──────────────────────────────────────────────────────

export default function CategoriaProdutos() {
  const { categoria } = useParams<{ categoria: string }>();
  const { data: produtos = [], isLoading, isError } = useProdutos();
  const [busca, setBusca] = useState("");

  const info = CATEGORIAS_INFO[categoria] ?? {
    label: categoria,
    grupo: "Categoria",
    cor: "text-blue-500",
    borda: "border-blue-500/30",
    bg: "bg-blue-500/10",
    acento: "bg-blue-500",
  };

  const produtosDaCategoria = produtos.filter((p) => p.categoria === categoria);

  const produtosFiltrados = produtosDaCategoria.filter((p) =>
    p.nome_produto.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased transition-colors duration-300">
      <Sidebar />

      <main className="w-full min-w-0 max-w-full flex-1 p-4 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">

        {/* ── Cabeçalho ── */}
        <div className="relative mb-10 flex flex-col gap-6 overflow-hidden md:flex-row md:items-end md:justify-between">
          {/* brilho decorativo, ecoa a cor da categoria vinda da grade */}
          <div
            className={`pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full ${info.bg} blur-3xl`}
            aria-hidden
          />

          <div className="relative min-w-0">
            {/* Botão Voltar */}
            <Link
              href="/produtos"
              className="mb-4 inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500 group"
            >
              <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
                <ArrowLeft size={14} strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">
                Voltar para Produtos
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span
                className={`hidden shrink-0 items-center justify-center rounded-2xl border ${info.borda} ${info.bg} p-4 sm:flex`}
              >
                <Package className={info.cor} size={28} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <span className={`mb-3 block text-xs font-black uppercase tracking-[3px] sm:text-sm sm:tracking-[4px] ${info.cor}`}>
                  {info.grupo}
                </span>
                <h1 className="max-w-full wrap-break-word text-3xl font-black uppercase leading-tight text-theme-text-title sm:text-5xl sm:leading-none sm:tracking-tighter">
                  {info.label}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-base font-medium leading-7 text-theme-text-sub">
              {isLoading
                ? "Carregando..."
                : `${produtosDaCategoria.length} produto${produtosDaCategoria.length !== 1 ? "s" : ""} nesta categoria.`}
            </p>
          </div>

          <Link
            href="/produtos/novo"
            className="relative inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-xs font-black uppercase tracking-[1px] text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95 sm:w-auto sm:gap-3 sm:px-6 sm:text-sm sm:tracking-[2px]"
          >
            <span className="shrink-0"><Plus size={20} strokeWidth={3} /></span>
            <span className="truncate">Novo produto</span>
          </Link>
        </div>

        {/* ── Busca ── */}
        <div className="mb-6 rounded-2xl border border-theme-border bg-theme-card p-4 shadow-sm">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub">
              <Search size={20} strokeWidth={3} />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-xl border border-theme-border bg-theme-header py-4 pl-12 pr-12 text-base font-bold text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-sub transition hover:text-red-400"
                aria-label="Limpar busca"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {busca && !isLoading && (
            <p className="ml-1 mt-3 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
              {produtosFiltrados.length} resultado{produtosFiltrados.length !== 1 ? "s" : ""} para &ldquo;{busca}&rdquo;
            </p>
          )}
        </div>

        {/* ── Estado de erro ── */}
        {isError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400 shadow-sm">
            <AlertCircle size={22} strokeWidth={2.5} />
            <p className="text-sm font-bold">Erro ao carregar produtos.</p>
          </div>
        ) : !isLoading && produtosDaCategoria.length === 0 ? (
          /* ── Categoria vazia ── */
          <div className="rounded-2xl border border-theme-border bg-theme-card p-12 text-center shadow-sm">
            <span className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${info.borda} ${info.bg}`}>
              <PackageSearch className={info.cor} size={26} strokeWidth={2.5} />
            </span>
            <p className="text-base font-bold text-theme-text-sub">
              Nenhum produto cadastrado nesta categoria.
            </p>
            <Link
              href="/produtos/novo"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-[1px] text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Cadastrar primeiro produto
            </Link>
          </div>
        ) : (
          /* ── Tabela de produtos ── */
          <section className="overflow-hidden rounded-[28px] border border-theme-border bg-theme-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left">
                <thead className="bg-theme-header text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub">
                  <tr>
                    <th className="px-5 py-4 text-left">Produto</th>
                    <th className="px-5 py-4 text-left">Unidade</th>
                    <th className="px-5 py-4 text-left">Estoque mínimo</th>
                    <th className="px-5 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {isLoading ? (
                    <>
                      <LinhaEsqueleto />
                      <LinhaEsqueleto />
                      <LinhaEsqueleto />
                    </>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-theme-border bg-theme-header">
                          <SearchX size={20} strokeWidth={2.5} className="text-theme-text-sub" />
                        </span>
                        <p className="text-sm font-bold text-theme-text-sub">
                          Nenhum produto encontrado para &ldquo;{busca}&rdquo;.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((produto) => (
                      <LinhaProduto key={produto.id} produto={produto} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
