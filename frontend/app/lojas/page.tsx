"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { type Loja, useLojas } from "@/features/lojas/hooks/useLoja";

const Icons = {
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Store: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
};

function nomeResponsavel(loja: Loja) {
  if (loja.first_name) return loja.first_name;
  if (loja.responsavel_nome) return loja.responsavel_nome;
  if (loja.responsavel && typeof loja.responsavel === "object") {
    return loja.responsavel.first_name || loja.responsavel.email || "";
  }
  return "";
}

export default function LojasGerencia() {
  const [busca, setBusca] = useState("");
  const { data: lojas = [], isLoading, isError, refetch } = useLojas();

  const lojasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lojas;

    return lojas.filter((loja) =>
      [
        loja.nome_loja,
        loja.tipo,
        loja.cidade,
        loja.endereco,
        nomeResponsavel(loja),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [busca, lojas]);

  const totalAtivas = lojas.filter((loja) => loja.ativo !== false).length;
  const totalInativas = lojas.length - totalAtivas;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="w-full min-w-0 max-w-full flex-1 p-4 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <span className="mb-3 block text-xs font-black uppercase tracking-[3px] text-blue-500 sm:text-sm sm:tracking-[4px]">
              Gestao de unidades
            </span>
            <h1 className="max-w-full break-words text-3xl font-black uppercase leading-tight text-theme-text-title sm:text-5xl sm:leading-none sm:tracking-tighter">
              Gerenciar Lojas
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-theme-text-sub">
              Consulte, cadastre e edite as unidades usadas nos pedidos e no
              controle de estoque.
            </p>

            {/* ── Stats inline ── */}
            <div className="mt-5 flex items-center gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                  Total
                </span>
                <p className="text-2xl font-black text-theme-text-title">
                  {lojas.length}
                </p>
              </div>
              <div className="h-8 w-px bg-theme-border" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                  Ativas
                </span>
                <p className="text-2xl font-black text-emerald-500">
                  {totalAtivas}
                </p>
              </div>
              <div className="h-8 w-px bg-theme-border" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                  Inativas
                </span>
                <p className="text-2xl font-black text-red-500">
                  {totalInativas}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/lojas/novaloja"
            className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-xs font-black uppercase tracking-[1px] text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95 sm:w-auto sm:gap-3 sm:px-6 sm:text-sm sm:tracking-[2px]"
          >
            <span className="shrink-0">
              <Icons.Plus />
            </span>
            <span className="truncate">Nova unidade</span>
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border border-theme-border bg-theme-card p-4 shadow-sm">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub">
              <Icons.Search />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por loja, cidade, endereco ou responsavel..."
              className="w-full rounded-xl border border-theme-border bg-theme-header py-4 pl-12 pr-4 text-base font-bold text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-theme-border bg-theme-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-theme-header text-sm uppercase tracking-[1px] text-theme-text-sub">
                <tr>
                  <th className="px-6 py-4">Unidade</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4">Endereco</th>
                  <th className="px-6 py-4">Responsavel</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-base font-bold text-theme-text-sub"
                    >
                      Carregando lojas...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="mb-4 text-base font-bold text-red-600">
                        Erro ao carregar lojas.
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-xl border border-theme-border bg-theme-header px-4 py-2 text-base font-black text-theme-text-title transition hover:bg-theme-hover"
                      >
                        Tentar novamente
                      </button>
                    </td>
                  </tr>
                ) : lojasFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-base font-bold text-theme-text-sub"
                    >
                      Nenhuma loja encontrada.
                    </td>
                  </tr>
                ) : (
                  lojasFiltradas.map((loja) => (
                    <tr
                      key={loja.id}
                      className="transition hover:bg-theme-hover"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-theme-header text-blue-500">
                            <Icons.Store />
                          </div>
                          <span className="text-lg font-black uppercase text-theme-text-title">
                            {loja.nome_loja}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-base font-bold text-theme-text-sub">
                        {loja.tipo || "-"}
                      </td>
                      <td className="px-6 py-5 text-base font-bold text-theme-text-sub">
                        {loja.cidade || "-"}
                      </td>
                      <td className="px-6 py-5 text-base font-bold text-theme-text-sub">
                        {loja.endereco || "-"}
                      </td>
                      <td className="px-6 py-5 text-base font-bold text-theme-text-sub">
                        {nomeResponsavel(loja) || "Sem responsavel"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-xl border px-3 py-1.5 text-sm font-black uppercase ${
                            loja.ativo !== false
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                              : "border-red-500/20 bg-red-500/10 text-red-600"
                          }`}
                        >
                          {loja.ativo !== false ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/lojas/detalhes/${loja.id}`}
                            className="rounded-xl border border-theme-border bg-theme-header p-3 text-theme-text-sub transition hover:border-blue-500/40 hover:text-blue-500"
                            aria-label={`Ver ${loja.nome_loja}`}
                          >
                            <Icons.Eye />
                          </Link>
                          <Link
                            href={`/lojas/editar/${loja.id}`}
                            className="rounded-xl border border-theme-border bg-theme-header p-3 text-theme-text-sub transition hover:border-blue-500/40 hover:text-blue-500"
                            aria-label={`Editar ${loja.nome_loja}`}
                          >
                            <Icons.Edit />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
