"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { getEstoquesBaixos, type EstoqueBaixo } from "@/features/estoque/services/estoque";

const ESTOQUE_BAIXO_QUERY_KEY = ["estoque-baixo"];

const AlertIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const StoreIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M2 7h20" />
  </svg>
);

type GrupoLoja = {
  loja_id: string;
  loja_nome: string;
  itens: EstoqueBaixo[];
};

function agruparPorLoja(estoques: EstoqueBaixo[]): GrupoLoja[] {
  const mapa = new Map<string, GrupoLoja>();

  for (const item of estoques) {
    if (!mapa.has(item.loja_id)) {
      mapa.set(item.loja_id, {
        loja_id: item.loja_id,
        loja_nome: item.loja_nome,
        itens: [],
      });
    }
    mapa.get(item.loja_id)!.itens.push(item);
  }

  return Array.from(mapa.values()).sort((a, b) => b.itens.length - a.itens.length);
}

function LinhaProduto({ item }: { item: EstoqueBaixo }) {
  const repor = Math.max(item.quantidade_minima - item.quantidade_atual, 0);
  const zerado = item.quantidade_atual === 0;

  return (
    <div className="flex flex-col gap-3 border-t border-theme-border px-5 py-4 transition-colors first:border-t-0 hover:bg-theme-hover sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[15px] font-bold text-theme-text-title">
          {item.produto_nome}
        </h4>
        {zerado && (
          <span className="mt-1 inline-block rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-500">
            Esgotado
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-5 sm:gap-7">
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[1.5px] text-theme-text-sub">
            Tem
          </span>
          <span
            className={`block text-lg font-black tabular-nums ${
              zerado ? "text-red-500" : "text-amber-500"
            }`}
          >
            {item.quantidade_atual}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[1.5px] text-theme-text-sub">
            Mínimo
          </span>
          <span className="block text-lg font-black tabular-nums text-theme-text-sub">
            {item.quantidade_minima}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[1.5px] text-theme-text-sub">
            Repor
          </span>
          <span className="block text-lg font-black tabular-nums text-emerald-500">
            {repor}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EstoqueBaixoPage() {
  const {
    data: estoques = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ESTOQUE_BAIXO_QUERY_KEY,
    queryFn: getEstoquesBaixos,
    refetchOnWindowFocus: true,
  });

  const grupos = agruparPorLoja(estoques);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mb-10">
          <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-amber-500">
            Reposição
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
            Estoque baixo
          </h1>
          <p className="mt-2 text-sm font-medium text-theme-text-sub">
            Produtos no ou abaixo do estoque mínimo. Um resumo em PDF também é
            enviado por e-mail para cada loja às 7h.
          </p>
        </div>

        <div className="max-w-4xl">
          {isLoading ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-6 text-sm font-medium text-theme-text-sub">
              Carregando...
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-500/20 bg-red-500/5 p-6 text-sm font-medium text-red-500">
              Não foi possível carregar o estoque baixo.
            </div>
          ) : estoques.length === 0 ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <AlertIcon size={26} />
              </div>
              <h3 className="text-lg font-bold text-theme-text-title">
                Tudo em dia
              </h3>
              <p className="mt-1 text-sm font-medium text-theme-text-sub">
                Nenhum produto abaixo do estoque mínimo.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <span className="rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[2px] text-amber-500">
                  {estoques.length}{" "}
                  {estoques.length === 1 ? "produto" : "produtos"}
                </span>
                <div className="h-[1px] flex-1 bg-theme-border transition-colors" />
              </div>

              <div className="space-y-4">
                {grupos.map((grupo) => (
                  <section
                    key={grupo.loja_id}
                    className="overflow-hidden rounded-[24px] border border-theme-border bg-theme-card shadow-sm"
                  >
                    <header className="flex items-center justify-between gap-4 border-b border-theme-border bg-theme-header px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3 text-theme-text-title">
                        <span className="text-theme-text-sub">
                          <StoreIcon />
                        </span>
                        <h3 className="truncate text-[13px] font-black uppercase tracking-[1.5px]">
                          {grupo.loja_nome}
                        </h3>
                      </div>
                      <span className="shrink-0 text-[11px] font-black uppercase tracking-wide text-theme-text-sub">
                        {grupo.itens.length}{" "}
                        {grupo.itens.length === 1 ? "item" : "itens"}
                      </span>
                    </header>

                    <div>
                      {grupo.itens.map((item) => (
                        <LinhaProduto key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
