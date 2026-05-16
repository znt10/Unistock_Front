"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/Cards/StatsCards";
import OrdersTable from "@/components/Cards/OrdersTable";
import FiltersBar from "@/components/Cards/FiltersBar";
import { getDashboard, type DashboardFilters } from "@/services/uni";

const initialFilters: Required<DashboardFilters> = {
  periodo: "week",
  status: "",
  search: "",
};

export default function DashboardPage() {
  const [filters, setFilters] = React.useState(initialFilters);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => getDashboard(filters),
  });

  const metricas = data?.metricas ?? {
    pedidos_hoje: 0,
    pendentes: 0,
    entregues_semana: 0,
    total_filtrado: 0,
  };

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-title font-sans antialiased transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 lg:ml-64 transition-all duration-300">
        <div className="flex justify-between items-start mb-10 mt-12 lg:mt-0">
          <header>
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Visao Geral
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
              Painel de Controle
            </h1>
            <p className="text-theme-text-sub text-sm mt-1 transition-colors">
              Bem-vindo de volta, aqui esta o resumo de hoje.
            </p>
          </header>
        </div>

        <section className="mb-10">
          <StatsCards
            pedidosHoje={metricas.pedidos_hoje}
            pendentes={metricas.pendentes}
            entreguesSemana={metricas.entregues_semana}
            isLoading={isLoading}
          />
        </section>

        <div className="mb-6">
          <FiltersBar filters={filters} onChange={setFilters} />
        </div>

        {isError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
            Nao foi possivel carregar o dashboard:{" "}
            {error instanceof Error ? error.message : "erro desconhecido"}
          </div>
        )}

        <OrdersTable
          pedidos={data?.pedidos_recentes ?? []}
          total={metricas.total_filtrado}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
