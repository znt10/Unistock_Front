"use client";

import { useState } from "react";
import {
  ESTADOS_PRODUTO,
  type EstadoProduto,
  type ItemEstoqueData,
} from "@/features/estoque/data/estruturaEstoque";

type ProdutoLinha = {
  id: string;
  nome: string;
  unidade_medida?: string;
  quantidade_por_embalagem?: number | null;
  estoque_minimo_sugerido?: number;
};

type Props = {
  produto: ProdutoLinha;
  item: ItemEstoqueData;
  quantidadeMinima: number;
  temEstado?: boolean;
  podeEditarProduto?: boolean;
  alterado: boolean;
  recente: boolean;
  onUpdate: (data: { qtd?: number; minimo?: number; estado?: EstadoProduto }) => void;
  onProdutoUpdate?: (data: {
    unidade_medida?: string;
    quantidade_por_embalagem?: number | null;
  }) => void;
};

function formatarHora(data?: string) {
  if (!data) return "Sem atualizacao";
  const diff = Date.now() - new Date(data).getTime();
  const minutos = Math.max(1, Math.floor(diff / 60000));

  if (minutos < 60) return `ha ${minutos} min`;
  if (minutos < 24 * 60) return `ha ${Math.floor(minutos / 60)} h`;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(data));
}

function desativarScrollNumero(event: React.WheelEvent<HTMLInputElement>) {
  event.currentTarget.blur();
}

export default function ItemEstoque({
  produto,
  item,
  quantidadeMinima,
  temEstado,
  alterado,
  recente,
  onUpdate,
}: Props) {
  const [valorQtd, setValorQtd] = useState(String(item.qtd));
  const estoqueBaixo = item.qtd <= quantidadeMinima;
  const semEstoque = item.qtd <= 0;
  const nivelMaximo = Math.max(quantidadeMinima * 3, item.qtd, 1);
  const nivel = Math.min(100, Math.round((item.qtd / nivelMaximo) * 100));
  const situacao = semEstoque
    ? {
        label: "Em falta",
        className: "border-red-500/50 bg-red-500/15 text-red-300",
        dot: "bg-red-400",
      }
    : estoqueBaixo
      ? {
          label: "Repor",
          className: "border-amber-500/50 bg-amber-500/15 text-amber-300",
          dot: "bg-amber-400",
        }
      : {
          label: "Em dia",
          className: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
          dot: "bg-emerald-400",
        };

  const valorAlterado = Number(valorQtd || 0) !== item.qtd;

  const salvarQtd = () => {
    const qtd = Math.max(0, Number(valorQtd || 0));
    setValorQtd(String(qtd));
    if (qtd === item.qtd) return;
    onUpdate({ qtd });
  };

  const cancelarQtd = () => {
    setValorQtd(String(item.qtd));
  };

  return (
    <tr
      className={`border-b border-theme-border transition ${
        alterado ? "bg-emerald-100" : estoqueBaixo ? "bg-amber-500/10" : ""
      }`}
    >
      <td className="px-5 py-4 text-lg font-black text-theme-text-title">
        <div className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            {produto.nome}
            {recente && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-700">
                recente
              </span>
            )}
            {estoqueBaixo && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                Estoque baixo
              </span>
            )}
          </span>

          <div className="text-xs font-bold text-theme-text-sub">
            min. {quantidadeMinima}
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase ${situacao.className}`}
        >
          <span className={`h-2 w-2 rounded-full ${situacao.dot}`} />
          {situacao.label}
        </span>
      </td>

      <td className="px-3 py-4 text-left">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={valorQtd}
            onChange={(e) => setValorQtd(e.target.value)}
            onWheel={desativarScrollNumero}
            onKeyDown={(e) => {
              if (e.key === "Enter") { salvarQtd(); e.currentTarget.blur(); }
              if (e.key === "Escape") { cancelarQtd(); e.currentTarget.blur(); }
            }}
            className="h-10 w-24 rounded-lg border border-theme-border bg-theme-card px-3 text-center text-base font-black text-theme-text-title outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          {valorAlterado && (
            <div className="flex gap-1">
              <button
                onClick={salvarQtd}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"
                title="Confirmar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={cancelarQtd}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Cancelar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="h-1.5 w-full rounded-full bg-blue-950/70">
          <div
            className={`h-full rounded-full ${
              semEstoque
                ? "bg-blue-900"
                : estoqueBaixo
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
            style={{ width: `${nivel}%` }}
          />
        </div>
      </td>

      {temEstado && (
        <td className="px-5 py-4">
          <select
            value={item.estado || "Normal"}
            onChange={(e) =>
              onUpdate({ estado: e.target.value as EstadoProduto })
            }
            className="h-9 w-full rounded-lg border border-theme-border bg-theme-card px-3 text-xs font-black text-theme-text-title outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            {ESTADOS_PRODUTO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </td>
      )}

      <td className="px-4 py-4 text-left text-xs font-medium text-theme-text-sub">
        {formatarHora(item.updatedAt)}
      </td>
    </tr>
  );
}
