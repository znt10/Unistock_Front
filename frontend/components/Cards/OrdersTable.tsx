"use client";

import React, { useState } from "react";
import type { DashboardPedido } from "@/services/uni";

type OrdersTableProps = {
  pedidos: DashboardPedido[];
  total: number;
  isLoading?: boolean;
};

const statusClasses: Record<string, string> = {
  PENDENTE: "bg-orange-500/10 text-orange-500/90 border-orange-500/20",
  CANCELADO: "bg-red-500/10 text-red-500/90 border-red-500/20",
  ENTREGUE: "bg-green-500/10 text-green-500/90 border-green-500/20",
};

export default function OrdersTable({
  pedidos,
  total,
  isLoading = false,
}: OrdersTableProps) {
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(pedidos.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pedidosExibidos = pedidos.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="bg-theme-card rounded-[24px] border border-theme-border shadow-2xl overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-theme-border bg-theme-header/30 flex justify-between items-center">
        <h2 className="text-lg font-bold text-theme-text-title flex items-center gap-2">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
          Pedidos Recentes
        </h2>
        <span className="text-[10px] text-theme-text-sub font-black uppercase tracking-widest opacity-70">
          Total: {isLoading ? "..." : total}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-theme-header/20 text-theme-text-sub text-[10px] font-black uppercase tracking-[2px]">
              <th className="px-6 py-5">Codigo</th>
              <th className="px-6 py-5">Unidade</th>
              <th className="px-6 py-5 text-center">Qtd</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Data</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-theme-border/30">
            {isLoading ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-theme-text-sub"
                  colSpan={5}
                >
                  Carregando pedidos...
                </td>
              </tr>
            ) : pedidosExibidos.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-theme-text-sub"
                  colSpan={5}
                >
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              pedidosExibidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="hover:bg-theme-hover/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-bold text-blue-400/90 font-mono">
                    #{pedido.id}
                  </td>

                  <td className="px-6 py-4 text-sm text-theme-text-title font-medium">
                    <div>{pedido.loja}</div>
                    <div className="text-[10px] text-theme-text-sub/60">
                      {pedido.responsavel}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-center text-blue-500 font-black">
                    {pedido.quantidade_total}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-tighter border ${
                        statusClasses[pedido.status] ??
                        "bg-blue-500/10 text-blue-500/90 border-blue-500/20"
                      }`}
                    >
                      {pedido.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-right text-theme-text-sub/60 font-medium">
                    {pedido.data} as {pedido.hora}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-theme-border bg-theme-header/10 flex justify-center items-center gap-4">
        <button
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          disabled={paginaAtual === 1 || isLoading}
          className="text-[10px] font-black text-theme-text-sub hover:text-blue-500 disabled:opacity-20 transition-all tracking-widest"
        >
          ANTERIOR
        </button>

        <div className="flex items-center gap-2">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPagina(i + 1)}
              disabled={isLoading}
              className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                paginaAtual === i + 1
                  ? "bg-blue-600 text-theme-card shadow-lg shadow-blue-900/20"
                  : "bg-theme-header text-theme-text-sub hover:text-theme-text-title border border-theme-border"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          disabled={paginaAtual === totalPaginas || isLoading}
          className="text-[10px] font-black text-theme-text-sub hover:text-blue-500 disabled:opacity-20 transition-all tracking-widest"
        >
          PROXIMO
        </button>
      </div>
    </div>
  );
}
