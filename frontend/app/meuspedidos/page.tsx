"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { usePedidos } from "@/hooks/usePedidos";

const Icons = {
  Filter: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export default function MeusPedidosPage() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");

  const { data: pedidosData = [], isLoading } = usePedidos({ status, data });

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 md:p-12 transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-10">
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Histórico de Requisições
            </span>
            <h1 className="text-4xl font-black tracking-tighter text-theme-text-title uppercase leading-none">
              Meus Pedidos
            </h1>
            <p className="text-theme-text-sub/60 font-medium mt-3">
              Acompanhe o status das suas solicitações de estoque em tempo real.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* TABELA */}
            <div className="lg:col-span-3 bg-theme-card border border-theme-border rounded-[32px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-theme-border bg-theme-header/50">
                      <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                        Data
                      </th>
                      <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                        Produto
                      </th>
                      <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] text-center">
                        Qtd
                      </th>
                      <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                        Observação
                      </th>
                      <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] text-center">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-theme-border">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-10 text-center text-theme-text-sub/40 text-sm"
                        >
                          Carregando...
                        </td>
                      </tr>
                    ) : pedidosData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-10 text-center text-theme-text-sub/40 text-sm"
                        >
                          Nenhum pedido encontrado.
                        </td>
                      </tr>
                    ) : (
                      pedidosData.map((item: any) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-theme-hover transition-all cursor-default"
                        >
                          <td className="p-6 text-sm font-bold text-theme-text-sub/80">
                            {item.data
                              ? item.data.split("-").reverse().join("/")
                              : "—"}
                          </td>

                          <td className="p-6">
                            <span className="text-[15px] font-black text-theme-text-title group-hover:text-blue-500 transition-colors uppercase">
                              {item.itens?.[0]?.produto_nome ?? "—"}
                            </span>
                          </td>

                          <td className="p-6 text-center">
                            <span className="font-mono text-lg font-black text-blue-500">
                              {item.itens?.[0]?.quantidade ?? "—"}
                            </span>
                          </td>

                          <td className="p-6">
                            <p className="text-xs text-theme-text italic max-w-[200px]">
                              {item.descricao || "Sem observações."}
                            </p>
                          </td>

                          <td className="p-6">
                            <div className="flex justify-center">
                              <span
                                className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px]
                                font-black uppercase tracking-widest
                                ${
                                  item.status === "ENTREGUE"
                                    ? "bg-green-500/5 text-green-500 border-green-500/20"
                                    : item.status === "CANCELADO"
                                      ? "bg-red-500/5 text-red-500 border-red-500/20"
                                      : "bg-orange-500/5 text-orange-500 border-orange-500/20"
                                }
                              `}
                              >
                                <Icons.Clock />
                                {item.status || "Pendente"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FILTROS */}
            <aside className="bg-theme-card border border-theme-border rounded-[32px] p-8 shadow-2xl sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                  <Icons.Filter />
                </div>
                <h2 className="text-lg font-black text-theme-text-title uppercase tracking-tighter">
                  Filtrar Busca
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-text-sub/30 uppercase tracking-[2px] ml-1">
                    Situação
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-theme-header border border-theme-border text-theme-text-title rounded-2xl py-4 px-5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none cursor-pointer uppercase"
                  >
                    <option value="">Todos os Status</option>
                    <option value="ENTREGUE">ENTREGUE</option>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-text-sub/30 uppercase tracking-[2px] ml-1">
                    Período
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full bg-theme-header border border-theme-border text-theme-text-title rounded-2xl py-4 px-5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all uppercase"
                  />
                </div>

                <button
                  onClick={() => {
                    setStatus("");
                    setData("");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl text-white text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 mt-4"
                >
                  Limpar Filtros
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
