"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { getRelatorio } from "@/services/uni";
import { useLojas, type Loja } from "@/hooks/useLoja";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

const Icons = {
  Building: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  ),
  Files: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-theme-text-sub"
    >
      <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
      <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
      <path d="M15 2v5h5" />
    </svg>
  ),
  Clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-theme-text-sub"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export default function GerenciaPedidos() {
  const { data: lojas = [], isLoading, isError } = useLojas();
  const [isExporting, setIsExporting] = useState(false);

  // Função para buscar o PDF e abrir em nova aba
  const handleVerRelatorio = async () => {
    setIsExporting(true);
    try {
      const blob = await getRelatorio();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error: unknown) {
      console.error("Erro detalhado:", error);

      alert(error instanceof Error ? error.message : "Erro ao gerar PDF");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub font-sans transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 md:p-10 transition-all">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[2px] mb-1 block">
              Administração
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-theme-text-title">
              Minhas Lojas
            </h1>
            <p className="text-theme-text-sub/80 text-sm mt-1">
              Visão geral das unidades e solicitações pendentes.
            </p>
          </div>

          <button
            onClick={handleVerRelatorio}
            disabled={isExporting}
            className={`
              bg-theme-card border border-theme-border px-5 py-2.5 rounded-xl text-sm font-bold text-theme-text-title 
              hover:bg-theme-hover transition-all flex items-center gap-3 active:scale-95
              ${isExporting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Gerando PDF...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Visualizar Hoje
              </>
            )}
          </button>
        </div>

        {/* Busca */}
        <div className="relative max-w-lg mb-10 group">
          <input
            type="text"
            placeholder="Localizar unidade..."
            className="w-full bg-theme-card border border-theme-border rounded-2xl py-4 pl-12 pr-4 text-sm text-theme-text-title focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-theme-text-sub/50"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-sub group-focus-within:text-blue-500 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* Grid de Unidades */}
        {isLoading ? (
          <p>Carregando...</p>
        ) : isError ? (
          <p>Erro ao carregar lojas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(lojas) &&
              lojas.map((loja: Loja) => (
                <div
                  key={loja.id}
                  className="bg-theme-card border border-theme-border rounded-[32px] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/10 group-hover:scale-110 transition-transform">
                        <Icons.Building />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-theme-text-title">
                          {loja.nome_loja}
                        </h2>
                        <span className="text-green-500 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
                          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                          Sistema Online
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="grid gap-3 relative z-10">
                    <Link
                      href={`/meuspedidos?loja=${loja.id}`}
                      className="w-full bg-theme-text-title hover:opacity-90 text-theme-base font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-[2px] shadow-lg active:scale-[0.98]"
                    >
                      Ver todos os pedidos
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/meuspedidos?loja=${loja.id}&data=${hojeISO()}`}
                        className="rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-center text-[10px] font-black uppercase tracking-[1px] text-theme-text-title transition hover:border-blue-500/40 hover:text-blue-500"
                      >
                        Pedidos de hoje
                      </Link>
                      <Link
                        href={`/meuspedidos?loja=${loja.id}&status=PENDENTE`}
                        className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[1px] text-orange-500 transition hover:bg-orange-500/10"
                      >
                        Pendentes
                      </Link>
                    </div>
                  </div>

                  {/* Detalhe de fundo decorativo */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
