"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/Cards/StatsCards";
import OrdersTable from "@/components/Cards/OrdersTable";
import FiltersBar from "@/components/Cards/FiltersBar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-title font-sans antialiased transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 lg:ml-64 transition-all duration-300">
        {/* Header Superior */}
        <div className="flex justify-between items-start mb-10 mt-12 lg:mt-0">
          <header>
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Visão Geral
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
              Painel de Controle
            </h1>
            <p className="text-theme-text-sub text-sm mt-1 transition-colors">
              Bem-vindo de volta, aqui está o resumo de hoje.
            </p>
          </header>
        </div>

        {/* Cards de Métricas */}
        <section className="mb-10">
          {/* Certifique-se de que dentro de <StatsCards /> você também use bg-theme-card */}
          <StatsCards />
        </section>

        {/* Filtros e Busca Padronizados */}
        <div className="mb-6">
          <FiltersBar />
        </div>

        {/* Tabela de Pedidos Recentes */}
        <div className="bg-theme-card rounded-[24px] border border-theme-border shadow-sm overflow-hidden transition-all">
          {/* Nota: Para a OrdersTable ficar perfeita, lembre-se de atualizar 
             os <th> e <td> dela para usarem text-theme-text-title e text-theme-text-sub 
          */}
          <OrdersTable />
        </div>
      </main>
    </div>
  );
}
