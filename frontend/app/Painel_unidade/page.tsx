"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useLojas, type Loja } from "@/hooks/useLoja";
import { getRelatorio } from "@/services/uni";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

const PERIODOS = [
  { valor: "dia", label: "Hoje", descricao: "Pedidos do dia atual" },
  { valor: "semana", label: "Esta semana", descricao: "Segunda a domingo" },
  { valor: "mes", label: "Este mês", descricao: "Do dia 1 até hoje" },
] as const;

type Periodo = (typeof PERIODOS)[number]["valor"];

// ─── Ícones ───────────────────────────────────────────────────────────────────

const Icons = {
  Building: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  ),
  Pdf: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Chevron: ({ open }: { open: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.2s",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Dia: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Semana: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Mes: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="8" y2="18" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  ),
};

const ICONE_PERIODO = { dia: Icons.Dia, semana: Icons.Semana, mes: Icons.Mes };

// ─── Botão de Relatório com Dropdown ─────────────────────────────────────────

function BotaoRelatorio() {
  const [aberto, setAberto] = useState(false);
  const [gerando, setGerando] = useState<Periodo | null>(null);

  async function abrirRelatorio(periodo: Periodo) {
    setAberto(false);
    setGerando(periodo);
    try {
      const blob = await getRelatorio(periodo);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao gerar PDF");
    } finally {
      setGerando(null);
    }
  }

  const isGerando = gerando !== null;

  return (
    <div className="relative">
      {/* botão principal */}
      <button
        type="button"
        disabled={isGerando}
        onClick={() => setAberto((v) => !v)}
        className={`
          flex items-center gap-2.5 rounded-xl border border-theme-border
          bg-theme-card px-5 py-2.5 text-sm font-bold text-theme-text-title
          transition-all hover:bg-theme-hover active:scale-95
          ${isGerando ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        {isGerando ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            Gerando PDF...
          </>
        ) : (
          <>
            <Icons.Pdf />
            Relatório PDF
            <Icons.Chevron open={aberto} />
          </>
        )}
      </button>

      {/* dropdown */}
      {aberto && (
        <>
          {/* overlay pra fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setAberto(false)}
          />

          <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-theme-border bg-theme-card shadow-lg">
            <div className="border-b border-theme-border px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[1.5px] text-theme-text-sub">
                Escolha o período
              </p>
            </div>

            {PERIODOS.map((p) => {
              const Icone = ICONE_PERIODO[p.valor];
              return (
                <button
                  key={p.valor}
                  type="button"
                  onClick={() => abrirRelatorio(p.valor)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-theme-hover"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icone />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-theme-text-title">
                      {p.label}
                    </span>
                    <span className="block text-[11px] text-theme-text-sub">
                      {p.descricao}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GerenciaPedidos() {
  const { data: lojas = [], isLoading, isError } = useLojas();
  const [busca, setBusca] = useState("");

  const lojasFiltradas = Array.isArray(lojas)
    ? lojas.filter((l: Loja) =>
        l.nome_loja.toLowerCase().includes(busca.toLowerCase()),
      )
    : [];

  return (
    <div className="flex min-h-screen bg-theme-base font-sans text-theme-text-sub transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 transition-all lg:ml-64 md:p-10">
        {/* ── Cabeçalho ── */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[2px] text-blue-500">
              Administração
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title">
              Minhas Lojas
            </h1>
            <p className="mt-1 text-sm text-theme-text-sub/80">
              Visão geral das unidades e solicitações pendentes.
            </p>
          </div>

          {/* ← botão com dropdown de período */}
          <BotaoRelatorio />
        </div>

        {/* ── Busca ── */}
        <div className="relative mb-10 max-w-lg group">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Localizar unidade..."
            className="w-full rounded-2xl border border-theme-border bg-theme-card py-4 pl-12 pr-4 text-sm text-theme-text-title outline-none transition-all placeholder:text-theme-text-sub/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub transition-colors group-focus-within:text-blue-500">
            <Icons.Search />
          </div>
        </div>

        {/* ── Grid de lojas ── */}
        {isLoading ? (
          <p className="text-sm text-theme-text-sub">Carregando...</p>
        ) : isError ? (
          <p className="text-sm text-red-500">Erro ao carregar lojas.</p>
        ) : lojasFiltradas.length === 0 ? (
          <p className="text-sm text-theme-text-sub">
            Nenhuma loja encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {lojasFiltradas.map((loja: Loja) => (
              <div
                key={loja.id}
                className="group relative overflow-hidden rounded-[32px] border border-theme-border bg-theme-card p-8 shadow-2xl transition-all hover:border-blue-500/30"
              >
                {/* cabeçalho do card */}
                <div className="relative z-10 mb-8 flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="rounded-2xl border border-blue-500/10 bg-blue-600/10 p-4 transition-transform group-hover:scale-110">
                      <Icons.Building />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-theme-text-title">
                        {loja.nome_loja}
                      </h2>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        Sistema Online
                      </span>
                    </div>
                  </div>
                </div>

                {/* botões */}
                <div className="relative z-10 grid gap-3">
                  <Link
                    href={`/meuspedidos?loja=${loja.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-theme-text-title py-4 text-xs font-black uppercase tracking-[2px] text-theme-base shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Ver todos os pedidos
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/meuspedidos?loja=${loja.id}&data=${hojeISO()}`}
                      className="rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-center text-[10px] font-black uppercase tracking-[1px] text-theme-text-title transition hover:border-blue-500/40 hover:text-blue-500"
                    >
                      Pedidos de hoje
                    </Link>
                    <Link
                      href={`/meuspedidos?loja=${loja.id}&status=PENDENTE`}
                      className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[1px] text-orange-500 transition hover:bg-orange-500/10"
                    >
                      Pendentes
                    </Link>
                  </div>
                </div>

                {/* detalhe decorativo */}
                <div className="absolute -mr-16 -mt-16 right-0 top-0 h-48 w-48 rounded-full bg-blue-600/5 blur-3xl transition-colors group-hover:bg-blue-600/10" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
