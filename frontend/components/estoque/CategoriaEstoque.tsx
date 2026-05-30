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
  produtos: readonly {
    id: string;
    nome: string;
    unidade_medida?: string;
    quantidade_por_embalagem?: number | null;
    estoque_minimo_sugerido?: number;
  }[];
  temEstado?: boolean;
  itens: Record<string, ItemEstoqueData>;
  minimos: Record<string, number>;
  alterados: Record<string, number>;
  agora: number;
  podeEditarProduto?: boolean;
  onUpdate: (
    loja: string,
    categoria: string,
    produto: string,
    data: { qtd?: number; minimo?: number; estado?: EstadoProduto },
  ) => void;
  onProdutoUpdate?: (
    produto: string,
    data: {
      unidade_medida?: string;
      quantidade_por_embalagem?: number | null;
    },
  ) => void;
};

export default function CategoriaEstoque({
  loja,
  categoria,
  cor,
  produtos,
  temEstado,
  itens,
  minimos,
  alterados,
  agora,
  podeEditarProduto,
  onUpdate,
  onProdutoUpdate,
}: Props) {
  const [aberta, setAberta] = useState(true);
  const total = produtos.reduce((sum, produto) => sum + (itens[produto.id]?.qtd || 0), 0);
  const baixos = produtos.filter((produto) => {
    const qtd = itens[produto.id]?.qtd || 0;
    const minimo = minimos[produto.id] ?? produto.estoque_minimo_sugerido ?? 1;
    return qtd > 0 && qtd <= minimo;
  }).length;
  const faltando = produtos.filter((produto) => (itens[produto.id]?.qtd || 0) === 0).length;
  const alerta = baixos + faltando;

  return (
    <section className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card shadow-sm">
      <button
        type="button"
        onClick={() => setAberta((valor) => !valor)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={`rounded-lg border px-4 py-2 text-lg font-black uppercase tracking-[1px] ${COR[cor]}`}>
            {categoria}
          </span>
          <span className="text-sm font-black uppercase tracking-[1px] text-theme-text-sub">
            {produtos.length} itens
          </span>
          {alerta > 0 && (
            <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-400">
              {alerta} p/ repor
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-theme-header px-4 py-2 text-sm font-black text-theme-text-title">
            Total {total}
          </span>
          <span className="text-xl font-black leading-none text-theme-text-sub">
            {aberta ? "^" : "+"}
          </span>
        </div>
      </button>

      {aberta && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-left">
            {temEstado ? (
              <colgroup>
                <col className="w-[31%]" />
                <col className="w-[17%]" />
                <col className="w-[13%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-[37%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[11%]" />
              </colgroup>
            )}
            <thead className="bg-theme-header text-xs uppercase tracking-[1px] text-theme-text-sub">
              <tr>
                <th className="px-5 py-3">Produto</th>
                <th className="px-5 py-3">Situacao</th>
                <th className="px-3 py-3 text-left">Qtd</th>
                <th className="px-5 py-3">Nivel</th>
                {temEstado && <th className="px-5 py-3">Estado</th>}
                <th className="px-4 py-3 text-left">Atualizado</th>
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
                    produto={produto}
                    item={item}
                    quantidadeMinima={
                      minimos[produto.id] ?? produto.estoque_minimo_sugerido ?? 1
                    }
                    temEstado={temEstado}
                    podeEditarProduto={podeEditarProduto}
                    alterado={Boolean(alterados[chave])}
                    recente={recente}
                    onUpdate={(data) => onUpdate(loja, categoria, produto.id, data)}
                    onProdutoUpdate={(data) => onProdutoUpdate?.(produto.id, data)}
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
