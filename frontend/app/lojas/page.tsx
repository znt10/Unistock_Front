"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useLojas } from "@/hooks/useLoja";

const Icons = {
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="20"
      height="20"
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
      width="20"
      height="20"
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

export default function LojasGerencia() {
  const { data: lojas = [], isLoading } = useLojas();

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 md:p-12 transition-all duration-300 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <span className="text-blue-500 text-[11px] font-black uppercase tracking-[4px] mb-3 block">
                Gestão de Unidades
              </span>
              <h1 className="text-4xl font-black tracking-tighter text-theme-text-title uppercase leading-none">
                Lojas
              </h1>
            </div>

            <Link
              href="/lojas/novaloja"
              className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              <Icons.Plus /> Criar Nova Unidade
            </Link>
          </div>

          <div className="bg-theme-card border border-theme-border rounded-[32px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-header/50">
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                      Unidade
                    </th>
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                      Cidade
                    </th>
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                      Endereço
                    </th>
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                      Responsável
                    </th>
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px]">
                      Status
                    </th>
                    <th className="p-7 text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-10 text-center text-theme-text-sub/40 text-sm"
                      >
                        Carregando...
                      </td>
                    </tr>
                  ) : lojas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-10 text-center text-theme-text-sub/40 text-sm"
                      >
                        Nenhuma loja cadastrada.
                      </td>
                    </tr>
                  ) : (
                    lojas.map((loja) => (
                      <tr
                        key={loja.id}
                        className="group hover:bg-theme-hover transition-all cursor-default"
                      >
                        <td className="p-7">
                          <span className="text-[17px] font-black text-theme-text-title group-hover:text-blue-500 transition-colors tracking-tight uppercase">
                            {loja.nome_loja}
                          </span>
                        </td>
                        <td className="p-7 text-theme-text-sub/80 font-bold text-sm uppercase">
                          {loja.cidade}
                        </td>
                        <td className="p-7 text-theme-text-sub/80 font-bold text-sm">
                          {loja.endereco}
                        </td>
                        <td className="p-7 text-theme-text-sub/80 font-bold text-sm">
                          {loja.responsavel_nome}
                        </td>
                        <td className="p-7">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                              loja.ativo
                                ? "bg-green-500/5 text-green-500 border-green-500/20"
                                : "bg-red-500/5 text-red-500 border-red-500/20"
                            }`}
                          >
                            {loja.ativo ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="p-7">
                          <div className="flex justify-center">
                            <Link
                              href={`/lojas/${loja.id}`}
                              className="p-3 bg-theme-header border border-theme-border rounded-xl text-theme-text-sub/40 hover:text-blue-500 hover:border-blue-500/40 hover:bg-theme-hover transition-all active:scale-90"
                            >
                              <Icons.Edit />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-theme-border flex justify-center items-center gap-4 bg-theme-header/30">
              <button className="w-11 h-11 flex items-center justify-center bg-theme-header border border-theme-border rounded-xl text-theme-text-sub/40 hover:text-theme-text-title hover:bg-theme-hover transition-all active:scale-90">
                <Icons.ChevronLeft />
              </button>
              <span className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-900/40 border border-blue-500">
                1
              </span>
              <button className="w-11 h-11 flex items-center justify-center bg-theme-header border border-theme-border rounded-xl text-theme-text-sub/40 hover:text-theme-text-title hover:bg-theme-hover transition-all active:scale-90">
                <Icons.ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
