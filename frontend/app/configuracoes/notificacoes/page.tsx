"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const Icons = {
  Bell: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Smartphone: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="18"
      height="18"
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
  ChevronRight: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

export default function NotificacoesAlertas() {
  // 👇 Transformei em estado para que você possa clicar e ligar/desligar as opções na tela
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Alertas de Estoque Baixo",
      subtitulo: "Receber avisos quando produtos atingirem o limite mínimo.",
      icon: <Icons.AlertTriangle />,
      active: true,
    },
    {
      id: 2,
      titulo: "Notificacoes por E-mail",
      subtitulo: "Enviar e-mail quando o estoque de um produto estiver baixo.",
      icon: <Icons.Mail />,
      active: true,
    },
    {
      id: 4,
      titulo: "Mensagens WhatsApp",
      subtitulo: "Enviar mensagem no WhatsApp quando o estoque estiver baixo.",
      icon: <Icons.Smartphone />,
      active: false,
    },
  ]);

  // Função para alternar o status do toggle
  const toggleNotificacao = (id: number) => {
    setNotificacoes((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, active: !notif.active } : notif,
      ),
    );
  };

  return (
    // 👇 Fundo principal dinâmico
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        {/* Cabeçalho */}
        <Link
          href="/configuracoes"
          className="mb-6 inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500 group"
        >
          <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
            <Icons.ChevronLeft />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[2px]">Voltar</span>
        </Link>

        <div className="mb-14 flex flex-col items-start gap-6">
          <div>
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Comunicações do Sistema
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
              Notificações
            </h1>
          </div>
        </div>

        {/* Lista de Opções */}
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-black text-theme-text-sub uppercase tracking-[3px] transition-colors">
              Configurações de Avisos
            </span>
            <div className="h-[1px] flex-1 bg-theme-border transition-colors"></div>
          </div>

          {notificacoes.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleNotificacao(item.id)}
              // 👇 Card adaptado com classes semânticas e transformado em botão para clique
              className="group flex w-full cursor-pointer flex-col items-start justify-between gap-5 rounded-[24px] border border-theme-border bg-theme-card p-5 transition-all hover:border-blue-500/40 hover:bg-theme-hover shadow-sm active:scale-[0.99] sm:flex-row sm:items-center sm:p-6"
            >
              <div className="flex items-center gap-4 md:gap-7">
                {/* Ícone Container */}
                <div className="bg-theme-header p-4 rounded-[20px] text-blue-500 border border-theme-border group-hover:border-blue-500/30 transition-all">
                  {item.icon}
                </div>

                <div className="text-left">
                  <h3 className="text-[17px] md:text-[19px] font-black text-theme-text-title tracking-tight group-hover:text-blue-500 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-theme-text-sub text-xs md:text-sm font-medium mt-1 transition-colors">
                    {item.subtitulo}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                  item.active ? "bg-blue-600" : "bg-theme-border"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transition-all duration-300 ${
                    item.active ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
