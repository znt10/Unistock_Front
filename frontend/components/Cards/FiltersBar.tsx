"use client";

import React from "react";
import type { DashboardFilters } from "@/services/uni";

type FiltersBarProps = {
  filters: Required<DashboardFilters>;
  onChange: (filters: Required<DashboardFilters>) => void;
};

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filters.periodo}
          onChange={(e) =>
            onChange({
              ...filters,
              periodo: e.target.value as Required<DashboardFilters>["periodo"],
            })
          }
          className="bg-theme-card border border-theme-border text-theme-text-title px-4 py-2.5 rounded-xl text-[13px] font-bold outline-none focus:border-blue-500/50 hover:bg-theme-hover transition-all cursor-pointer shadow-sm min-w-[180px]"
        >
          <option value="week">Ultimos 7 dias</option>
          <option value="today">Hoje</option>
          <option value="month">Este mes</option>
          <option value="all">Todos</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="bg-theme-card border border-theme-border text-theme-text-title px-4 py-2.5 rounded-xl text-[13px] font-bold outline-none focus:border-blue-500/50 hover:bg-theme-hover transition-all cursor-pointer shadow-sm min-w-[170px]"
        >
          <option value="">Todos status</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="ENTREGUE">Entregues</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </div>

      <div className="relative flex-1 md:max-w-md md:ml-auto group">
        <input
          type="text"
          value={filters.search}
          placeholder="BUSCAR POR LOJA, RESPONSAVEL OU DESCRICAO"
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-theme-header border border-theme-border text-theme-text-title pl-12 pr-4 py-2.5 rounded-xl text-[12px] font-black tracking-widest outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-theme-text-sub/40 shadow-inner uppercase"
        />

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub group-focus-within:text-blue-500 transition-colors">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
