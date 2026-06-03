"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import {
  PRODUTOS_QUERY_KEY,
  useProdutos,
  type Produto,
} from "@/hooks/useProduto";
import { patchProduto, deleteProduto } from "@/services/uni";

// ─── Mapa de categorias ───────────────────────────────────────────────────────

const CATEGORIAS_INFO: Record<
  string,
  { label: string; grupo: string; cor: string }
> = {
  SALGADOS_GDE:  { label: "Salgados Grande", grupo: "Salgados",  cor: "text-orange-500"  },
  SALGADOS_MINI: { label: "Salgados Mini",   grupo: "Salgados",  cor: "text-orange-400"  },
  ESFIHAS_GDE:   { label: "Esfihas Grande",  grupo: "Esfihas",   cor: "text-red-500"     },
  ESFIHAS_MINI:  { label: "Esfihas Mini",    grupo: "Esfihas",   cor: "text-red-400"     },
  FOGAZZAS_GDE:  { label: "Fogazzas Grande", grupo: "Fogazzas",  cor: "text-emerald-500" },
  FOGAZZAS_MINI: { label: "Fogazzas Mini",   grupo: "Fogazzas",  cor: "text-emerald-400" },
  RECHEIOS:      { label: "Recheios",         grupo: "Outros",    cor: "text-blue-400"    },
  MERCADO:       { label: "Mercado",          grupo: "Outros",    cor: "text-violet-400"  },
};

// ─── Ícones ───────────────────────────────────────────────────────────────────

const IconePlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconeChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconeBusca = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const IconeEditar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconeLixo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconeCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconeX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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
          <input
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
          <input
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
              <IconeCheck />
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub transition hover:bg-theme-hover active:scale-95"
              aria-label="Cancelar"
            >
              <IconeX />
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
              <IconeCheck />
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoDelete(false)}
              className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub transition hover:bg-theme-hover active:scale-95"
              aria-label="Cancelar"
            >
              <IconeX />
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
      <td className="px-5 py-5 text-sm font-semibold text-theme-text-sub">
        {produto.unidade_medida ?? "—"}
      </td>
      <td className="px-5 py-5 text-sm font-semibold text-theme-text-sub">
        {produto.estoque_minimo_sugerido ?? "—"}
      </td>
      <td className="px-5 py-5">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub opacity-0 transition group-hover:opacity-100 hover:border-blue-500/40 hover:text-blue-400"
            aria-label={`Editar ${produto.nome_produto}`}
          >
            <IconeEditar />
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoDelete(true)}
            className="rounded-lg border border-theme-border bg-theme-header p-2.5 text-theme-text-sub opacity-0 transition group-hover:opacity-100 hover:border-red-500/40 hover:text-red-400"
            aria-label={`Remover ${produto.nome_produto}`}
          >
            <IconeLixo />
          </button>
        </div>
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
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {/* Botão Voltar */}
            <Link
              href="/produtos"
              className="mb-4 inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500 group"
            >
              <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
                <IconeChevronLeft />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">
                Voltar para Produtos
              </span>
            </Link>

            <span className={`mb-3 block text-xs font-black uppercase tracking-[3px] sm:text-sm sm:tracking-[4px] ${info.cor}`}>
              {info.grupo}
            </span>
            <h1 className="max-w-full wrap-break-word text-3xl font-black uppercase leading-tight text-theme-text-title sm:text-5xl sm:leading-none sm:tracking-tighter">
              {info.label}
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-theme-text-sub">
              {isLoading
                ? "Carregando..."
                : `${produtosDaCategoria.length} produto${produtosDaCategoria.length !== 1 ? "s" : ""} nesta categoria.`}
            </p>
          </div>

          <Link
            href="/produtos/novo"
            className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-xs font-black uppercase tracking-[1px] text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95 sm:w-auto sm:gap-3 sm:px-6 sm:text-sm sm:tracking-[2px]"
          >
            <span className="shrink-0"><IconePlus /></span>
            <span className="truncate">Novo produto</span>
          </Link>
        </div>

        {/* ── Busca ── */}
        <div className="mb-6 rounded-2xl border border-theme-border bg-theme-card p-4 shadow-sm">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub">
              <IconeBusca />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-xl border border-theme-border bg-theme-header py-4 pl-12 pr-4 text-base font-bold text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* ── Tabela de produtos ── */}
        {isLoading ? (
          <p className="text-base font-bold text-theme-text-sub">Carregando...</p>
        ) : isError ? (
          <p className="text-base font-bold text-red-500">Erro ao carregar produtos.</p>
        ) : produtosDaCategoria.length === 0 ? (
          <div className="rounded-2xl border border-theme-border bg-theme-card p-12 text-center shadow-sm">
            <p className="text-base font-bold text-theme-text-sub">
              Nenhum produto cadastrado nesta categoria.
            </p>
            <Link
              href="/produtos/novo"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-[1px] text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95"
            >
              <IconePlus />
              Cadastrar primeiro produto
            </Link>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <p className="text-base font-bold text-theme-text-sub">
            Nenhum produto encontrado para &ldquo;{busca}&rdquo;.
          </p>
        ) : (
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
                  {produtosFiltrados.map((produto) => (
                    <LinhaProduto key={produto.id} produto={produto} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
