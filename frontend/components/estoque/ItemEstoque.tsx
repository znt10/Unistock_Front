"use client";

import { useState } from "react";
import {
  ESTADOS_PRODUTO,
  type EstadoProduto,
  type ItemEstoqueData,
} from "@/data/estruturaEstoque";

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

const UNIDADES_MEDIDA = [
  { valor: "UNIDADE", label: "Unidade" },
  { valor: "CAIXA", label: "Caixa" },
  { valor: "PACOTE", label: "Pacote" },
  { valor: "QUILO", label: "Quilo" },
  { valor: "LITRO", label: "Litro" },
] as const;

const UNIDADE_LABELS = Object.fromEntries(
  UNIDADES_MEDIDA.map((unidade) => [unidade.valor, unidade.label]),
);

function unidadeLabel(unidade?: string) {
  return UNIDADE_LABELS[unidade || ""] || unidade || "Unidade";
}

function usaEmbalagem(unidade?: string) {
  return unidade === "CAIXA" || unidade === "PACOTE";
}

function statusClasses(qtd: number, minimo: number) {
  if (qtd <= 0) return "bg-red-50 text-red-700 ring-red-200";
  if (qtd <= minimo) return "bg-amber-50 text-amber-700 ring-amber-200";
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
  quantidadeMinima,
  temEstado,
  podeEditarProduto,
  alterado,
  recente,
  onUpdate,
  onProdutoUpdate,
}: Props) {
  const [editandoQtd, setEditandoQtd] = useState(false);
  const [editandoMinimo, setEditandoMinimo] = useState(false);
  const [editandoEmbalagem, setEditandoEmbalagem] = useState(false);
  const [valorQtd, setValorQtd] = useState(String(item.qtd));
  const [valorMinimo, setValorMinimo] = useState(String(quantidadeMinima));
  const [valorEmbalagem, setValorEmbalagem] = useState(
    String(produto.quantidade_por_embalagem || ""),
  );
  const estoqueBaixo = item.qtd <= quantidadeMinima;

  const salvarQtd = () => {
    const qtd = Math.max(0, Number(valorQtd || 0));
    setEditandoQtd(false);
    onUpdate({ qtd });
  };

  const salvarMinimo = () => {
    const minimo = Math.max(0, Number(valorMinimo || 0));
    setEditandoMinimo(false);
    onUpdate({ minimo });
  };

  const salvarEmbalagem = () => {
    const quantidade = valorEmbalagem
      ? Math.max(1, Number(valorEmbalagem))
      : null;

    setEditandoEmbalagem(false);
    onProdutoUpdate?.({ quantidade_por_embalagem: quantidade });
  };

  return (
    <tr
      className={`border-b border-theme-border transition ${
        alterado ? "bg-emerald-100" : estoqueBaixo ? "bg-amber-500/10" : ""
      }`}
    >
      <td className="px-4 py-3 text-sm font-semibold text-theme-text-title">
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

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-theme-text-sub">
            {podeEditarProduto ? (
              <select
                value={produto.unidade_medida || "UNIDADE"}
                onChange={(e) => {
                  const unidade = e.target.value;
                  onProdutoUpdate?.({
                    unidade_medida: unidade,
                    quantidade_por_embalagem: usaEmbalagem(unidade)
                      ? produto.quantidade_por_embalagem || null
                      : null,
                  });
                }}
                className="rounded-lg border border-theme-border bg-theme-card px-2 py-1 text-xs font-black text-theme-text-title outline-none"
              >
                {UNIDADES_MEDIDA.map((unidade) => (
                  <option key={unidade.valor} value={unidade.valor}>
                    {unidade.label}
                  </option>
                ))}
              </select>
            ) : (
              <span>Unidade: {unidadeLabel(produto.unidade_medida)}</span>
            )}

            {usaEmbalagem(produto.unidade_medida) && (
              <span>
                {unidadeLabel(produto.unidade_medida)} com{" "}
                {editandoEmbalagem && podeEditarProduto ? (
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    value={valorEmbalagem}
                    onChange={(e) => setValorEmbalagem(e.target.value)}
                    onBlur={salvarEmbalagem}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") salvarEmbalagem();
                      if (e.key === "Escape") setEditandoEmbalagem(false);
                    }}
                    className="mx-1 h-7 w-16 rounded border border-blue-400 bg-white px-2 text-center text-xs font-bold text-slate-950 outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    disabled={!podeEditarProduto}
                    onClick={() => {
                      setValorEmbalagem(
                        String(produto.quantidade_por_embalagem || ""),
                      );
                      setEditandoEmbalagem(true);
                    }}
                    className="font-black text-theme-text-title disabled:cursor-default"
                  >
                    {produto.quantidade_por_embalagem || "-"}
                  </button>
                )}{" "}
                unidades
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-center">
        {editandoMinimo ? (
          <input
            autoFocus
            type="number"
            min="0"
            value={valorMinimo}
            onChange={(e) => setValorMinimo(e.target.value)}
            onBlur={salvarMinimo}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvarMinimo();
              if (e.key === "Escape") setEditandoMinimo(false);
            }}
            className="h-9 w-24 rounded-lg border border-blue-400 bg-white px-3 text-center text-sm font-bold text-slate-950 outline-none ring-2 ring-blue-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setValorMinimo(String(quantidadeMinima));
              setEditandoMinimo(true);
            }}
            className="inline-flex min-w-16 justify-center rounded-lg bg-theme-header px-3 py-1.5 text-sm font-black text-theme-text-title ring-1 ring-theme-border transition hover:scale-105"
          >
            {quantidadeMinima}
          </button>
        )}
      </td>

      <td className="px-4 py-3 text-center">
        {editandoQtd ? (
          <input
            autoFocus
            type="number"
            min="0"
            value={valorQtd}
            onChange={(e) => setValorQtd(e.target.value)}
            onBlur={salvarQtd}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvarQtd();
              if (e.key === "Escape") setEditandoQtd(false);
            }}
            className="h-9 w-24 rounded-lg border border-blue-400 bg-white px-3 text-center text-sm font-bold text-slate-950 outline-none ring-2 ring-blue-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setValorQtd(String(item.qtd));
              setEditandoQtd(true);
            }}
            className={`inline-flex min-w-16 justify-center rounded-lg px-3 py-1.5 text-sm font-black ring-1 transition hover:scale-105 ${statusClasses(
              item.qtd,
              quantidadeMinima,
            )}`}
          >
            {item.qtd}
          </button>
        )}
      </td>

      <td className="px-4 py-3 text-center">
        {temEstado ? (
          <select
            value={item.estado || "Normal"}
            onChange={(e) =>
              onUpdate({ estado: e.target.value as EstadoProduto })
            }
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
