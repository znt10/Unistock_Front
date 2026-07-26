"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useProdutos } from "@/features/produtos/hooks/useProduto";

// ─── Categorias ───────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { valor: "SALGADOS_GDE",  label: "Salgados Grande", grupo: "Salgados",  cor: "text-orange-500",  borda: "border-orange-500/30",  bg: "bg-orange-500/10",  acento: "bg-orange-500"  },
  { valor: "SALGADOS_MINI", label: "Salgados Mini",   grupo: "Salgados",  cor: "text-orange-400",  borda: "border-orange-400/30",  bg: "bg-orange-400/10",  acento: "bg-orange-400"  },
  { valor: "ESFIHAS_GDE",   label: "Esfihas Grande",  grupo: "Esfihas",   cor: "text-red-500",     borda: "border-red-500/30",     bg: "bg-red-500/10",     acento: "bg-red-500"     },
  { valor: "ESFIHAS_MINI",  label: "Esfihas Mini",    grupo: "Esfihas",   cor: "text-red-400",     borda: "border-red-400/30",     bg: "bg-red-400/10",     acento: "bg-red-400"     },
  { valor: "FOGAZZAS_GDE",  label: "Fogazzas Grande", grupo: "Fogazzas",  cor: "text-emerald-500", borda: "border-emerald-500/30", bg: "bg-emerald-500/10", acento: "bg-emerald-500" },
  { valor: "FOGAZZAS_MINI", label: "Fogazzas Mini",   grupo: "Fogazzas",  cor: "text-emerald-400", borda: "border-emerald-400/30", bg: "bg-emerald-400/10", acento: "bg-emerald-400" },
  { valor: "RECHEIOS",      label: "Recheios",         grupo: "Outros",    cor: "text-blue-400",    borda: "border-blue-400/30",    bg: "bg-blue-400/10",    acento: "bg-blue-400"    },
  { valor: "MERCADO",       label: "Mercado",          grupo: "Outros",    cor: "text-violet-400",  borda: "border-violet-400/30",  bg: "bg-violet-400/10",  acento: "bg-violet-400"  },
] as const;

// ─── Ícones ───────────────────────────────────────────────────────────────────

const IconePlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconeBusca = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const IconeSeta = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const { data: produtos = [], isLoading, isError } = useProdutos();
  const [busca, setBusca] = useState("");

  const contagemPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of produtos) {
      if (p.categoria) map[p.categoria] = (map[p.categoria] || 0) + 1;
    }
    return map;
  }, [produtos]);

  const categoriasFiltradas = CATEGORIAS.filter((c) =>
    c.label.toLowerCase().includes(busca.toLowerCase()) ||
    c.grupo.toLowerCase().includes(busca.toLowerCase()),
  );

  const totalProdutos = produtos.length;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased transition-colors duration-300">
      <Sidebar />

      <main className="w-full min-w-0 max-w-full flex-1 p-4 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">

        {/* ── Cabeçalho ── */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <span className="mb-3 block text-xs font-black uppercase tracking-[3px] text-blue-500 sm:text-sm sm:tracking-[4px]">
              Gestão de Produtos
            </span>
            <h1 className="max-w-full wrap-break-word text-3xl font-black uppercase leading-tight text-theme-text-title sm:text-5xl sm:leading-none sm:tracking-tighter">
              Produtos
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-theme-text-sub">
              Consulte e gerencie os produtos organizados por categoria.
            </p>

            {/* ── Stats inline ── */}
            <div className="mt-5 flex items-center gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                  Produtos
                </span>
                <p className="text-2xl font-black text-theme-text-title">
                  {isLoading ? "—" : totalProdutos}
                </p>
              </div>
              <div className="h-8 w-px bg-theme-border" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                  Categorias
                </span>
                <p className="text-2xl font-black text-theme-text-title">
                  {CATEGORIAS.length}
                </p>
              </div>
            </div>
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
              placeholder="Filtrar categoria..."
              className="w-full rounded-xl border border-theme-border bg-theme-header py-4 pl-12 pr-4 text-base font-bold text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* ── Grid de categorias ── */}
        {isError ? (
          <p className="text-sm text-red-500">Erro ao carregar produtos.</p>
        ) : categoriasFiltradas.length === 0 ? (
          <p className="text-base font-bold text-theme-text-sub">Nenhuma categoria encontrada.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoriasFiltradas.map((cat) => {
              const count = contagemPorCategoria[cat.valor] ?? 0;
              return (
                <Link
                  key={cat.valor}
                  href={`/produtos/${cat.valor}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-theme-border bg-theme-card shadow-sm transition hover:border-blue-500/40 hover:shadow-md"
                >
                  {/* barra colorida no topo */}
                  <div className={`h-1 w-full ${cat.acento} opacity-70`} />

                  <div className="p-5">
                    <p className={`mb-1 text-[10px] font-black uppercase tracking-[2px] ${cat.cor}`}>
                      {cat.grupo}
                    </p>
                    <h2 className="text-base font-black uppercase text-theme-text-title">
                      {cat.label}
                    </h2>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <strong className={`block text-3xl font-black ${isLoading ? "text-theme-text-sub/30" : cat.cor}`}>
                          {isLoading ? "—" : count}
                        </strong>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-theme-text-sub/50">
                          {count === 1 ? "produto" : "produtos"}
                        </span>
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-theme-border bg-theme-header text-theme-text-sub transition group-hover:border-blue-500/40 group-hover:text-blue-500">
                        <IconeSeta />
                      </span>
                    </div>
                  </div>

                  {/* brilho decorativo */}
                  <div className={`pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full ${cat.bg} blur-2xl`} />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
