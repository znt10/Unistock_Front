"use client";

import { useState } from "react";
import { ESTADOS_PRODUTO, type EstadoProduto, type ItemEstoqueData } from "@/data/estruturaEstoque";

type Props = {
  produto: string;
  item: ItemEstoqueData;
  temEstado?: boolean;
  alterado: boolean;
  recente: boolean;
  onUpdate: (data: { qtd?: number; estado?: EstadoProduto }) => void;
};

function statusClasses(qtd: number) {
  if (qtd <= 0) return "bg-red-50 text-red-700 ring-red-200";
  if (qtd <= 2) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function formatarHora(data?: string) {
  if (!data) return "Sem atualizacao";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(data));
}

export default function ItemEstoque({
  produto,
  item,
  temEstado,
  alterado,
  recente,
  onUpdate,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(String(item.qtd));

  const salvar = () => {
    const qtd = Math.max(0, Number(valor || 0));
    setEditando(false);
    onUpdate({ qtd });
  };

  return (
    <tr className={`border-b border-theme-border transition ${alterado ? "bg-emerald-100" : ""}`}>
      <td className="px-4 py-3 text-sm font-semibold text-theme-text-title">
        <span className="flex items-center gap-2">
          {produto}
          {recente && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-700">
              recente
            </span>
          )}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {editando ? (
          <input
            autoFocus
            type="number"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onBlur={salvar}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvar();
              if (e.key === "Escape") setEditando(false);
            }}
            className="h-9 w-24 rounded-lg border border-blue-400 bg-white px-3 text-center text-sm font-bold text-slate-950 outline-none ring-2 ring-blue-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setValor(String(item.qtd));
              setEditando(true);
            }}
            className={`inline-flex min-w-16 justify-center rounded-lg px-3 py-1.5 text-sm font-black ring-1 transition hover:scale-105 ${statusClasses(item.qtd)}`}
          >
            {item.qtd}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {temEstado ? (
          <select
            value={item.estado || "Normal"}
            onChange={(e) => onUpdate({ estado: e.target.value as EstadoProduto })}
            className="rounded-lg border border-theme-border bg-theme-card px-3 py-2 text-xs font-bold text-theme-text-title outline-none"
          >
            {ESTADOS_PRODUTO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-medium text-theme-text-sub">Normal</span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-xs font-medium text-theme-text-sub">
        {formatarHora(item.updatedAt)}
      </td>
    </tr>
  );
}
