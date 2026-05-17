"use client";

import { useState } from "react";
import { type EstoqueLocal } from "@/data/estruturaEstoque";

type Props = {
  estoque: EstoqueLocal;
  lojas: { id: string; nome_loja: string }[];
  categorias: {
    categoria: string;
    cor?: "orange" | "red" | "blue" | "green";
    produtos: readonly { id: string; nome: string }[];
  }[];
};

const COR = {
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function statusClasses(qtd: number) {
  if (qtd <= 0) return "text-red-700";
  if (qtd <= 2) return "text-amber-700";
  return "text-emerald-700";
}

export default function TotalGeral({ estoque, lojas, categorias }: Props) {
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});

  const secoes = categorias.map((config) => ({
    ...config,
    linhas: config.produtos.map((produto) => {
      const quantidades = lojas.map((loja) => ({
        lojaId: loja.id,
        loja: loja.nome_loja,
        qtd: estoque[loja.id]?.[config.categoria]?.[produto.id]?.qtd || 0,
      }));
      const total = quantidades.reduce((sum, item) => sum + item.qtd, 0);
      return { produto, quantidades, total };
    }),
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-theme-border bg-theme-card px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-theme-text-title">
            Todas as lojas
          </h2>
          <p className="text-sm text-theme-text-sub">
            Totais separados por categoria e unidade.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {secoes.map((secao) => {
          const aberta = abertas[secao.categoria] ?? true;
          const totalCategoria = secao.linhas.reduce(
            (total, linha) => total + linha.total,
            0,
          );

          return (
            <div
              key={secao.categoria}
              className="overflow-hidden rounded-lg border border-theme-border bg-theme-card shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setAbertas((atual) => ({
                    ...atual,
                    [secao.categoria]: !aberta,
                  }))
                }
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-black ${
                      COR[secao.cor || "blue"]
                    }`}
                  >
                    {secao.categoria}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[1px] text-theme-text-sub">
                    {secao.produtos.length} itens
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-theme-header px-3 py-1 text-xs font-black text-theme-text-title">
                    Total {totalCategoria}
                  </span>
                  <span className="text-theme-text-sub">
                    {aberta ? "-" : "+"}
                  </span>
                </div>
              </button>

              {aberta && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left">
                    <thead className="bg-theme-header text-[11px] uppercase tracking-[1px] text-theme-text-sub">
                      <tr>
                        <th className="px-4 py-2">Produto</th>
                        {lojas.map((loja) => (
                          <th key={loja.id} className="px-4 py-2 text-center">
                            {loja.nome_loja}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr:nth-child(even)]:bg-theme-hover/60">
                      {secao.linhas.map((linha) => (
                        <tr
                          key={`${secao.categoria}-${linha.produto.id}`}
                          className="border-b border-theme-border"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-theme-text-title">
                            {linha.produto.nome}
                          </td>
                          {linha.quantidades.map((item) => (
                            <td
                              key={item.lojaId}
                              className="px-4 py-3 text-center"
                            >
                              <span
                                className={`text-sm font-black ${statusClasses(
                                  item.qtd,
                                )}`}
                              >
                                {item.qtd || ""}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex min-w-14 justify-center rounded-lg px-3 py-1.5 text-sm font-black ring-1 ${
                                linha.total <= 0
                                  ? "bg-red-50 text-red-700 ring-red-200"
                                  : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              }`}
                            >
                              {linha.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
