"use client";

import { useMemo, useState } from "react";

type Props = {
  lojaAtiva: string;
  lojas: { id: string; nome_loja: string }[];
  onChange: (loja: string) => void;
  notificacoesExternas: number;
  mostrarTodas?: boolean;
};

export default function BarraLojas({
  lojaAtiva,
  lojas,
  onChange,
  notificacoesExternas,
  mostrarTodas = true,
}: Props) {
  const [busca, setBusca] = useState("");

  const nomeLoja = (nome: string) =>
    nome.toUpperCase() === "ZILDA" ? "ZILDA / CASA VERDE" : nome;

  const lojasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return lojas;

    return lojas.filter((loja) =>
      nomeLoja(loja.nome_loja).toLowerCase().includes(termo),
    );
  }, [busca, lojas]);

  if (!mostrarTodas) return null;

  return (
    <div className="rounded-lg border border-theme-border bg-theme-card p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar loja..."
            className="h-11 w-full rounded-lg border border-theme-border bg-theme-header px-4 text-sm font-bold text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <button
          type="button"
          onClick={() => onChange("TODAS")}
          className={`relative h-11 shrink-0 rounded-lg border px-4 text-sm font-black uppercase tracking-[1px] transition ${
            lojaAtiva === "TODAS"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-theme-border bg-theme-header text-theme-text-sub hover:text-theme-text-title"
          }`}
        >
          Todas as lojas
          {notificacoesExternas > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
              {notificacoesExternas}
            </span>
          )}
        </button>
      </div>

      <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lojasFiltradas.map((loja) => (
          <button
            type="button"
            key={loja.id}
            onClick={() => onChange(loja.id)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-left text-xs font-black uppercase tracking-[1px] transition ${
              lojaAtiva === loja.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-theme-border bg-theme-header text-theme-text-sub hover:text-theme-text-title"
            }`}
          >
            <span className="block max-h-8 overflow-hidden break-words">
              {nomeLoja(loja.nome_loja)}
            </span>
          </button>
        ))}

        {lojasFiltradas.length === 0 && (
          <div className="rounded-lg border border-theme-border bg-theme-header px-4 py-3 text-sm font-bold text-theme-text-sub">
            Nenhuma loja encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
