"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const Icons = {
  User: () => (
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Shield: () => (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
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
  Package: () => (
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
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  UserPlus: () => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
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
  Search: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
};

export default function Configuracoes() {
  const secoes = [
    {
      titulo: "Gerenciar conta UniStock",
      subtitulo: "Informações de acesso e segurança da conta.",
      icon: <Icons.User />,
      tag: "CONTA",
      href: "/configuracoes/conta",
    },
    {
      titulo: "Privacidade e Segurança",
      subtitulo: "Controle seus dados e configurações de proteção.",
      icon: <Icons.Lock />,
      tag: "PROTEÇÃO",
      href: "/configuracoes/privacidade",
    },
    {
      titulo: "Personalização do Perfil",
      subtitulo: "Preferências de visualização e interface.",
      icon: <Icons.Shield />,
      tag: "SISTEMA",
      href: "/configuracoes/personalizacao",
    },
    {
      titulo: "Notificações e Alertas",
      subtitulo: "Configurações de avisos de estoque e pedidos.",
      icon: <Icons.Bell />,
      tag: "AVISOS",
      href: "/configuracoes/notificacoes",
    },
    {
      titulo: "Cadastrar produto",
      subtitulo: "Inclua novos itens para pedidos e controle de estoque.",
      icon: <Icons.Package />,
      tag: "PRODUTO",
      href: "/produtos/novo",
    },
    {
      titulo: "Criar gerente",
      subtitulo: "Abra a tela de registro para cadastrar outro gerente.",
      icon: <Icons.UserPlus />,
      tag: "ACESSO",
      href: "/registrar",
    },
  ];

  return (
    <div className="flex min-h-screen bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 md:p-12 transition-all duration-300">
        {/* Header */}
        <div className="mb-14">
          <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
            Painel Administrativo
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
            Configurações
          </h1>
          <p className="text-theme-text-sub text-sm mt-1 transition-colors">
            Ajuste os parâmetros do sistema e gerencie suas preferências de
            segurança.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="relative max-w-2xl mb-16 group">
          <input
            type="text"
            placeholder="O QUE VOCÊ ESTÁ PROCURANDO?"
            className="w-full bg-theme-card border border-theme-border rounded-2xl py-5 pl-14 pr-6 text-[13px] font-black text-theme-text-title focus:border-blue-600 outline-none transition-all placeholder:text-theme-text-sub/50 placeholder:tracking-[2px] shadow-sm"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-text-sub group-focus-within:text-blue-600 transition-colors">
            <Icons.Search />
          </div>
        </div>

        {/* Seção de Opções */}
        <div className="max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-black text-theme-text-sub uppercase tracking-[3px] transition-colors">
              Preferências Gerais
            </span>
            <div className="h-[1px] flex-1 bg-theme-border transition-colors"></div>
          </div>

          <div className="grid gap-5">
            {secoes.map((secao, index) => (
              <Link
                href={secao.href}
                key={index}
                className="w-full bg-theme-card border border-theme-border rounded-[28px] p-7 flex items-center justify-between hover:border-blue-500/40 hover:bg-theme-hover transition-all group shadow-sm active:scale-[0.985] text-left cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  {/* Container de Ícone Interno */}
                  <div className="bg-theme-header p-5 rounded-[22px] text-blue-500 border border-theme-border group-hover:border-blue-500/30 group-hover:scale-105 transition-all shrink-0 shadow-inner">
                    {secao.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-theme-text-title tracking-tight group-hover:text-blue-500 transition-colors">
                        {secao.titulo}
                      </h3>
                      <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black px-2 py-0.5 rounded-md tracking-tighter uppercase transition-all">
                        {secao.tag}
                      </span>
                    </div>
                    <p className="text-theme-text-sub text-[15px] font-medium leading-relaxed transition-colors">
                      {secao.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Ícone de Chevron da Direita */}
                <div className="bg-theme-header p-3 rounded-full text-theme-text-sub border border-theme-border group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:translate-x-1 transition-all shrink-0 shadow-inner">
                  <Icons.ChevronRight />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
