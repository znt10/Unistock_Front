"use client";

import { useState } from "react";
import ItemEstoque from "@/components/estoque/ItemEstoque";
import { type EstadoProduto, type ItemEstoqueData } from "@/data/estruturaEstoque";

const COR = {
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

type Props = {
  loja: string;
  categoria: string;
  cor: keyof typeof COR;
  produtos: readonly { id: string; nome: string }[];
  temEstado?: boolean;
  itens: Record<string, ItemEstoqueData>;
  alterados: Record<string, number>;
  agora: number;
  onUpdate: (
    loja: string,
    categoria: string,
    produto: string,
    data: { qtd?: number; estado?: EstadoProduto },
  ) => void;
};

export default function CategoriaEstoque({
  loja,
  categoria,
  cor,
  produtos,
  temEstado,
  itens,
  alterados,
  agora,
  onUpdate,
}: Props) {
  const [aberta, setAberta] = useState(true);
  const total = produtos.reduce((sum, produto) => sum + (itens[produto.id]?.qtd || 0), 0);

  return (
    <section className="overflow-hidden rounded-lg border border-theme-border bg-theme-card shadow-sm">
      <button
        type="button"
        onClick={() => setAberta((valor) => !valor)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${COR[cor]}`}>
            {categoria}
          </span>
          <span className="text-xs font-bold uppercase tracking-[1px] text-theme-text-sub">
            {produtos.length} itens
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-theme-header px-3 py-1 text-xs font-black text-theme-text-title">
            Total {total}
          </span>
          <span className="text-theme-text-sub">{aberta ? "-" : "+"}</span>
        </div>
      </button>

      {aberta && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[34%]" />
            </colgroup>
            <thead className="bg-theme-header text-[11px] uppercase tracking-[1px] text-theme-text-sub">
              <tr>
                <th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2 text-center">Qtd</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Ultima atualizacao</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-theme-hover/60">
              {produtos.map((produto) => {
                const chave = `${loja}|${categoria}|${produto.id}`;
                const item = itens[produto.id] || { qtd: 0, estado: "Normal" as EstadoProduto };
                const recente = item.updatedAt
                  ? agora - new Date(item.updatedAt).getTime() <= 10 * 60 * 1000
                  : false;

                return (
                  <ItemEstoque
                    key={produto.id}
                    produto={produto.nome}
                    item={item}
                    temEstado={temEstado}
                    alterado={Boolean(alterados[chave])}
                    recente={recente}
                    onUpdate={(data) => onUpdate(loja, categoria, produto.id, data)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
