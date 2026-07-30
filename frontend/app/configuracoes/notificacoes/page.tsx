"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { usePreferenciasNotificacao } from "@/features/notificacoes/hooks/usePreferenciasNotificacao";

const Icons = {
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
  Clock: () => (
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
};

function Toggle({
  ativo,
  onClick,
  disabled = false,
}: {
  ativo: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ativo}
      className={`h-6 w-12 rounded-full p-1 transition-all duration-300 ${
        ativo ? "bg-blue-600" : "bg-theme-border"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
          ativo ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function NotificacoesAlertas() {
  const { preferencias, carregando, salvar, salvando } =
    usePreferenciasNotificacao();
  const [telefone, setTelefone] = React.useState<string | null>(null);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <Link
          href="/configuracoes"
          className="group mb-6 inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500"
        >
          <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
            <Icons.ChevronLeft />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[2px]">Voltar</span>
        </Link>

        <div className="mb-14 flex flex-col items-start gap-6">
          <div>
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
              Comunicações do Sistema
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title transition-colors">
              Notificações
            </h1>
          </div>
        </div>

        <div className="max-w-4xl space-y-4">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[3px] text-theme-text-sub transition-colors">
              Configurações de Avisos
            </span>
            <div className="h-[1px] flex-1 bg-theme-border transition-colors"></div>
            {salvando && (
              <span className="text-[10px] font-black uppercase tracking-[2px] text-blue-500">
                Salvando...
              </span>
            )}
          </div>

          {carregando || !preferencias ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-6 text-sm font-medium text-theme-text-sub">
              Carregando preferências...
            </div>
          ) : (
            <>
              {/* Alertas por email */}
              <div className="flex w-full flex-col items-start justify-between gap-5 rounded-[24px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-center gap-4 md:gap-7">
                  <div className="rounded-[20px] border border-theme-border bg-theme-header p-4 text-blue-500 transition-all">
                    <Icons.Mail />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[17px] font-black tracking-tight text-theme-text-title md:text-[19px]">
                      Receber e-mails do Unistock
                    </h3>
                    <p className="mt-1 text-xs font-medium text-theme-text-sub md:text-sm">
                      Resumo diário e avisos do sistema no seu e-mail. Os alertas
                      de estoque baixo continuam aparecendo no sino.
                    </p>
                  </div>
                </div>
                <Toggle
                  ativo={preferencias.email_ativo}
                  onClick={() => salvar({ email_ativo: !preferencias.email_ativo })}
                />
              </div>

              {/* Resumo diario: por loja, horario fixo — informativo */}
              <div className="w-full rounded-[24px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all sm:p-6">
                <div className="flex items-center gap-4 md:gap-7">
                  <div className="rounded-[20px] border border-theme-border bg-theme-header p-4 text-blue-500 transition-all">
                    <Icons.Clock />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[17px] font-black tracking-tight text-theme-text-title md:text-[19px]">
                      Resumo diário às 7h
                    </h3>
                    <p className="mt-1 text-xs font-medium text-theme-text-sub md:text-sm">
                      Todo dia, no começo do expediente, cada loja recebe no
                      próprio e-mail um PDF com os produtos abaixo do mínimo.
                      Gerentes recebem um PDF com todas as lojas.
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp (fase 2) */}
              <div className="w-full rounded-[24px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all sm:p-6">
                <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4 md:gap-7">
                    <div className="rounded-[20px] border border-theme-border bg-theme-header p-4 text-blue-500 transition-all">
                      <Icons.Smartphone />
                    </div>
                    <div className="text-left">
                      <h3 className="flex items-center gap-3 text-[17px] font-black tracking-tight text-theme-text-title md:text-[19px]">
                        Mensagens WhatsApp
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                          Em breve
                        </span>
                      </h3>
                      <p className="mt-1 text-xs font-medium text-theme-text-sub md:text-sm">
                        Receber os avisos também no WhatsApp.
                      </p>
                    </div>
                  </div>
                  <Toggle ativo={false} disabled />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-theme-border pt-5">
                  <label
                    htmlFor="telefone-whatsapp"
                    className="text-xs font-black uppercase tracking-[2px] text-theme-text-sub"
                  >
                    Telefone
                  </label>
                  <input
                    id="telefone-whatsapp"
                    type="tel"
                    placeholder="+55 (83) 99999-9999"
                    value={telefone ?? preferencias.telefone_whatsapp}
                    onChange={(event) => setTelefone(event.target.value)}
                    onBlur={() => {
                      if (telefone !== null && telefone !== preferencias.telefone_whatsapp) {
                        salvar({ telefone_whatsapp: telefone });
                        setTelefone(null);
                      }
                    }}
                    className="w-full max-w-xs rounded-lg border border-theme-border bg-theme-base px-4 py-2 text-sm font-bold text-theme-text-title outline-none transition placeholder:font-medium placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
