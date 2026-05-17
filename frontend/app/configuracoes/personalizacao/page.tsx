"use client";

import React, { useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useTheme } from "next-themes";

const Icons = {
  Palette: () => (
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
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Layout: () => (
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  Languages: () => (
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
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  ),
  Eye: () => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

export default function PersonalizacaoPerfil() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null; //

  const opcoesPersonalizacao = [
    {
      titulo: "Tema da Interface",
      subtitulo: "Alternar entre modo claro ou dark blue.",
      icon: <Icons.Palette />,
    },
    {
      titulo: "Layout do Painel",
      subtitulo: "Personalize a disposição dos cards e tabelas.",
      icon: <Icons.Layout />,
    },
    {
      titulo: "Idioma e Região",
      subtitulo: "Português (Brasil) - UTC-3",
      icon: <Icons.Languages />,
    },
    {
      titulo: "Modo de Visualização",
      subtitulo: "Ajuste a densidade das informações na tela.",
      icon: <Icons.Eye />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-theme-base font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 md:p-12 transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-14">
          <div>
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
              Interface do Sistema
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title">
              Personalização do Perfil
            </h1>
          </div>

          <Link
            href="/configuracoes"
            className="group bg-theme-card border border-theme-border px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-theme-text-sub hover:bg-theme-hover transition-all flex items-center gap-2 shadow-sm"
          >
            <Icons.ChevronLeft /> Voltar
          </Link>
        </div>

        {/* Tema */}
        <div className="max-w-4xl mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[3px] text-theme-text-sub">
              Aparência Atual
            </span>
            <div className="h-[1px] flex-1 border-t border-theme-border"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-lg gap-4">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center ${
                  resolvedTheme === t
                    ? "bg-theme-card border-blue-500 scale-[1.02] ring-4 ring-blue-500/10"
                    : "bg-theme-card border-theme-border hover:border-blue-500/50"
                }`}
              >
                <div
                  className={`w-full h-20 rounded-lg mb-4 border ${
                    t === "light"
                      ? "bg-white border-gray-200"
                      : "bg-[#0a0f1c] border-[#1f2a44]"
                  }`}
                />
                <span
                  className={`text-sm font-black uppercase tracking-wider ${
                    resolvedTheme === t
                      ? "text-blue-500"
                      : "text-theme-text-title"
                  }`}
                >
                  {t === "dark" ? "Dark Blue" : "Claro"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Opções */}
        <div className="max-w-4xl space-y-4">
          {opcoesPersonalizacao.map((item, index) => (
            <button
              key={index}
              className="w-full bg-theme-card border border-theme-border rounded-[24px] p-6 flex items-center justify-between hover:border-blue-500/40 hover:bg-theme-hover transition-all group shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-4 md:gap-7">
                <div className="bg-theme-header p-4 rounded-[20px] text-blue-500 border border-theme-border group-hover:border-blue-500/30 transition-all">
                  {item.icon}
                </div>

                <div className="text-left">
                  <h3 className="text-[17px] md:text-[19px] font-black tracking-tight text-theme-text-title group-hover:text-blue-500">
                    {item.titulo}
                  </h3>
                  <p className="text-xs md:text-sm font-medium mt-1 text-theme-text-sub">
                    {item.subtitulo}
                  </p>
                </div>
              </div>

              <div className="bg-theme-header p-2 rounded-full border border-theme-border text-blue-500/50 group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:translate-x-1 transition-all">
                <Icons.ChevronRight />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
