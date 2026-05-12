"use client";

import React from "react";

type StatsCardsProps = {
  pedidosHoje: number;
  pendentes: number;
  entreguesSemana: number;
  isLoading?: boolean;
};

const icons = [
  <svg
    key="pedidos"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="text-blue-500 opacity-15"
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>,
  <svg
    key="pendentes"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="text-blue-500 opacity-15"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>,
  <svg
    key="entregues"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="text-blue-500 opacity-15"
  >
    <path d="m9 12 2 2 4-4" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
  </svg>,
];

export default function StatsCards({
  pedidosHoje,
  pendentes,
  entreguesSemana,
  isLoading = false,
}: StatsCardsProps) {
  const stats = [
    { label: "Pedidos Hoje", value: pedidosHoje, icon: icons[0] },
    { label: "Pendentes", value: pendentes, icon: icons[1] },
    { label: "Entregues (semana)", value: entreguesSemana, icon: icons[2] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-theme-card border border-theme-border rounded-[22px] p-8 flex justify-between items-center relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 shadow-sm"
        >
          <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="z-10">
            <p className="text-theme-text-sub text-[11px] font-black uppercase tracking-[2px] mb-2 transition-colors">
              {stat.label}
            </p>
            <h3 className="text-4xl font-black text-theme-text-title tracking-tight transition-colors">
              {isLoading ? "..." : stat.value}
            </h3>
          </div>

          <div className="z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
            {stat.icon}
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-blue-500 group-hover:w-full transition-all duration-500 ease-in-out" />
        </div>
      ))}
    </div>
  );
}
