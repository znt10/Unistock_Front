"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import CadastroUsuarioForm from "@/components/usuarios/CadastroUsuarioForm";
import { selectIsGerente, useAuthStore } from "@/stores/authStore";

const Icons = {
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Bell: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Package: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  UserPlus: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  X: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
};

type Secao =
  | {
      titulo: string;
      subtitulo: string;
      icon: React.ReactNode;
      tag: string;
      href: string;
      adminOnly?: boolean;
      action?: never;
    }
  | {
      titulo: string;
      subtitulo: string;
      icon: React.ReactNode;
      tag: string;
      action: "createResponsible";
      adminOnly?: boolean;
      href?: never;
    };

function CardConteudo({ secao }: { secao: Secao }) {
  return (
    <>
      <div className="flex items-center gap-8">
        <div className="shrink-0 rounded-[22px] border border-theme-border bg-theme-header p-5 text-blue-500 shadow-inner transition-all group-hover:scale-105 group-hover:border-blue-500/30">
          {secao.icon}
        </div>

        <div>
          <div className="mb-1 flex items-center gap-3">
            <h3 className="text-xl font-black tracking-tight text-theme-text-title transition-colors group-hover:text-blue-500">
              {secao.titulo}
            </h3>
            <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-blue-500">
              {secao.tag}
            </span>
          </div>
          <p className="text-[15px] font-medium leading-relaxed text-theme-text-sub">
            {secao.subtitulo}
          </p>
        </div>
      </div>

      <div className="shrink-0 rounded-full border border-theme-border bg-theme-header p-3 text-theme-text-sub shadow-inner transition-all group-hover:translate-x-1 group-hover:border-blue-500/30 group-hover:text-blue-500">
        <Icons.ChevronRight />
      </div>
    </>
  );
}

export default function Configuracoes() {
  const podeGerenciarAcessos = useAuthStore(selectIsGerente);
  const [responsavelAberto, setResponsavelAberto] = useState(false);

  const secoes: Secao[] = [
    {
      titulo: "Gerenciar conta UniStock",
      subtitulo: "Informacoes de acesso e seguranca da conta.",
      icon: <Icons.User />,
      tag: "CONTA",
      href: "/configuracoes/conta",
    },
    {
      titulo: "Privacidade e Seguranca",
      subtitulo: "Controle seus dados e configuracoes de protecao.",
      icon: <Icons.Lock />,
      tag: "PROTECAO",
      href: "/configuracoes/privacidade",
    },
    {
      titulo: "Personalizacao do Perfil",
      subtitulo: "Preferencias de visualizacao e interface.",
      icon: <Icons.Shield />,
      tag: "SISTEMA",
      href: "/configuracoes/personalizacao",
    },
    {
      titulo: "Notificacoes e Alertas",
      subtitulo: "Configuracoes de avisos de estoque e pedidos.",
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
      adminOnly: true,
    },
    {
      titulo: "Criar gerente",
      subtitulo: "Abra a tela de registro para cadastrar outro gerente.",
      icon: <Icons.UserPlus />,
      tag: "ACESSO",
      href: "/registrar",
      adminOnly: true,
    },
    {
      titulo: "Criar responsavel",
      subtitulo: "Cadastre um responsavel e vincule a uma loja.",
      icon: <Icons.UserPlus />,
      tag: "ACESSO",
      action: "createResponsible",
      adminOnly: true,
    },
  ];

  const secoesVisiveis = secoes.filter(
    (secao) => !secao.adminOnly || podeGerenciarAcessos,
  );
  const cardClass =
    "group flex w-full cursor-pointer items-center justify-between rounded-[28px] border border-theme-border bg-theme-card p-7 text-left shadow-sm transition-all hover:border-blue-500/40 hover:bg-theme-hover active:scale-[0.985]";

  return (
    <div className="flex min-h-screen bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-8 transition-all duration-300 md:p-12 lg:ml-64">
        <div className="mb-14">
          <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
            Painel Administrativo
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-theme-text-title">
            Configuracoes
          </h1>
          <p className="mt-1 text-sm text-theme-text-sub">
            Ajuste os parametros do sistema e gerencie suas preferencias.
          </p>
        </div>

        <div className="group relative mb-16 max-w-2xl">
          <input
            type="text"
            placeholder="O QUE VOCE ESTA PROCURANDO?"
            className="w-full rounded-2xl border border-theme-border bg-theme-card py-5 pl-14 pr-6 text-[13px] font-black text-theme-text-title shadow-sm outline-none transition-all placeholder:text-theme-text-sub/50 placeholder:tracking-[2px] focus:border-blue-600"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-text-sub transition-colors group-focus-within:text-blue-600">
            <Icons.Search />
          </div>
        </div>

        <div className="max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-[3px] text-theme-text-sub">
              Preferencias Gerais
            </span>
            <div className="h-[1px] flex-1 bg-theme-border" />
          </div>

          <div className="grid gap-5">
            {secoesVisiveis.map((secao, index) =>
              "action" in secao ? (
                <button
                  type="button"
                  key={`${secao.action}-${index}`}
                  onClick={() => setResponsavelAberto(true)}
                  className={cardClass}
                >
                  <CardConteudo secao={secao} />
                </button>
              ) : (
                <Link
                  key={`${secao.href}-${index}`}
                  href={secao.href}
                  className={cardClass}
                >
                  <CardConteudo secao={secao} />
                </Link>
              ),
            )}
          </div>
        </div>
      </main>

      {responsavelAberto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-card p-6 text-theme-text-title shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-header/60 p-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[3px] text-blue-500">
                  Gestao de usuarios
                </span>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Criar responsavel
                </h2>
                <p className="mt-1 text-sm leading-6 text-theme-text-sub">
                  Cadastre o responsavel e vincule a uma loja.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResponsavelAberto(false)}
                className="rounded-lg border border-theme-border bg-theme-header p-2 text-theme-text-sub transition hover:text-theme-text-title"
                aria-label="Fechar formulario"
              >
                <Icons.X />
              </button>
            </div>

            <CadastroUsuarioForm
              tipo="responsavel"
              showCancel
              onCancel={() => setResponsavelAberto(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
