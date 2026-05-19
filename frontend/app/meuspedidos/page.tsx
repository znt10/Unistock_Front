"use client";

import React, { Suspense, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { usePedidos } from "@/hooks/usePedidos";
import { usePedidoStatusActions } from "@/hooks/usePedidoStatusActions";
import {
  selectIsGerente,
  selectIsResponsavel,
  useAuthStore,
} from "@/stores/authStore";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const Icons = {
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
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
  Check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  ),
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function MeusPedidosContent() {
  const searchParams = useSearchParams();
  const lojaParam = searchParams.get("loja") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const dataParam = searchParams.get("data") ?? "";
  const isGerente = useAuthStore(selectIsGerente);
  const isResponsavel = useAuthStore(selectIsResponsavel);
  const podeAtualizarStatus = isGerente || isResponsavel;
  const hydrated = useAuthStore((state) => state.hydrated);

  const [status, setStatus] = useState(statusParam);
  const [data, setData] = useState(dataParam);

  const { data: pedidosData = [], isLoading } = usePedidos({
    status,
    data,
    loja: lojaParam || undefined,
  });

  const {
    pedidoAtualizando,
    atualizandoLista: entregandoTodos,
    atualizarStatusPedido,
    atualizarStatusPedidos,
  } = usePedidoStatusActions();

  const pedidosPendentesVisiveis = pedidosData.filter(
    (pedido) => pedido.status === "PENDENTE",
  );

  const marcarPedidosHoje = () => {
    setData(hojeISO());
    setStatus("PENDENTE");
  };

  const entregarTodosVisiveis = async () => {
    if (pedidosPendentesVisiveis.length === 0) return;

    const ok = window.confirm(
      `Marcar ${pedidosPendentesVisiveis.length} pedido(s) pendente(s) como ENTREGUE?`,
    );
    if (!ok) return;

    await atualizarStatusPedidos(
      pedidosPendentesVisiveis.map((pedido) => pedido.id),
      "ENTREGUE",
    );
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
        <Sidebar />
        <main className="min-w-0 flex-1 p-5 pt-20 transition-all sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
          Carregando...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden p-5 pt-20 transition-all sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href={isGerente ? "/painel_unidade" : "/novopedido"}
            className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-theme-border bg-theme-card px-6 py-3 text-[11px] font-black uppercase tracking-widest text-theme-text-sub shadow-sm transition-all hover:bg-theme-hover hover:text-theme-text-title"
          >
            <Icons.ChevronLeft /> Voltar
          </Link>

          <header className="mb-10">
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Histórico de Requisições
            </span>
            <h1 className="text-3xl font-black tracking-tighter text-theme-text-title uppercase leading-none sm:text-4xl">
              Meus Pedidos
            </h1>
            <p className="text-theme-text-sub/60 font-medium mt-3">
              {isGerente && lojaParam
                ? "Pedidos filtrados pela loja selecionada."
                : "Acompanhe o status das suas solicitacoes de estoque em tempo real."}
            </p>
          </header>

          {isGerente && (
            <div className="mb-6 grid grid-cols-1 gap-3 rounded-[24px] border border-theme-border bg-theme-card p-4 shadow-sm md:grid-cols-3">
              <button
                type="button"
                onClick={marcarPedidosHoje}
                className="rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-[11px] font-black uppercase tracking-[2px] text-theme-text-title transition hover:border-blue-500/40 hover:text-blue-500"
              >
                Pedidos de hoje
              </button>
              <button
                type="button"
                onClick={() => setStatus("PENDENTE")}
                className="rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-[11px] font-black uppercase tracking-[2px] text-theme-text-title transition hover:border-orange-500/40 hover:text-orange-500"
              >
                Ver pendentes
              </button>
              <button
                type="button"
                onClick={entregarTodosVisiveis}
                disabled={
                  entregandoTodos || pedidosPendentesVisiveis.length === 0
                }
                className="rounded-2xl bg-green-600 px-4 py-3 text-[11px] font-black uppercase tracking-[2px] text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entregandoTodos
                  ? "Entregando..."
                  : `Entregar todos (${pedidosPendentesVisiveis.length})`}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* TABELA */}
            <div className="lg:col-span-3 bg-theme-card border border-theme-border rounded-[32px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
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
                      {podeAtualizarStatus && (
                        <th className="p-6 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] text-center">
                          Ação
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-theme-border">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={podeAtualizarStatus ? 6 : 5}
                          className="p-10 text-center text-theme-text-sub/40 text-sm"
                        >
                          Carregando...
                        </td>
                      </tr>
                    ) : pedidosData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={podeAtualizarStatus ? 6 : 5}
                          className="p-10 text-center text-theme-text-sub/40 text-sm"
                        >
                          Nenhum pedido encontrado.
                        </td>
                      </tr>
                    ) : (
                      pedidosData.map((item) => (
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
                          {podeAtualizarStatus && (
                            <td className="p-6">
                              <div className="flex justify-center gap-2">
                                {item.status !== "ENTREGUE" && (
                                  <button
                                    type="button"
                                    disabled={pedidoAtualizando === item.id}
                                    onClick={() =>
                                      atualizarStatusPedido(
                                        item.id,
                                        "ENTREGUE",
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-[10px] font-black uppercase tracking-[1px] text-white transition hover:bg-green-700 disabled:opacity-50"
                                  >
                                    <Icons.Check />
                                    Entregar
                                  </button>
                                )}
                                {item.status === "PENDENTE" && (
                                  <button
                                    type="button"
                                    disabled={pedidoAtualizando === item.id}
                                    onClick={() =>
                                      atualizarStatusPedido(
                                        item.id,
                                        "CANCELADO",
                                      )
                                    }
                                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-[1px] text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                                  >
                                    Cancelar
                                  </button>
                                )}
                                {item.status === "ENTREGUE" && (
                                  <span className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-[1px] text-green-500">
                                    Entregue
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FILTROS */}
            <aside className="rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-2xl lg:sticky lg:top-8 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                  <Icons.Filter />
                </div>
                <h2 className="text-lg font-black text-theme-text-title uppercase tracking-tighter">
                  Filtrar Busca
                </h2>
              </div>

              <div className="space-y-6">
                {/* Situação */}
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

                {/* Período */}
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

export default function MeusPedidosPage() {
  return (
    <Suspense fallback={null}>
      <MeusPedidosContent />
    </Suspense>
  );
}
