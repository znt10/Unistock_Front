"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LOJAS_QUERY_KEY, type Loja } from "@/hooks/useLoja";
import { getLojaById, deleteLoja } from "@/features/lojas/services/lojas"; // Ajuste o caminho do import

// Ícones (Mantidos conforme seu código original)
const Icons = {
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
  MapPin: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
};

type LojaDetalhe = {
  id: string;
  nome_loja: string;
  cidade: string;
  endereco: string;
  responsavel?: string | number | null;
  responsavel_nome?: string | null;
  ativo: boolean;
};

export default function DetalheLoja() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const { data: loja, isLoading: loading } = useQuery<LojaDetalhe>({
    queryKey: ["lojas", id],
    queryFn: () => getLojaById(id),
    enabled: Boolean(id),
    staleTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleDeletar = async () => {
    if (confirm("Tem certeza que deseja remover esta unidade?")) {
      const ok = await deleteLoja(params.id as string);
      if (ok) {
        queryClient.setQueryData<Loja[] | undefined>(
          LOJAS_QUERY_KEY,
          (lojasAtuais) => {
            if (!lojasAtuais) return lojasAtuais;
            return lojasAtuais.filter((item) => item.id !== id);
          },
        );
        queryClient.removeQueries({ queryKey: ["lojas", id] });
        router.push("/lojas");
      }
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-theme-base text-white">
        Carregando...
      </div>
    );
  if (!loja)
    return (
      <div className="flex h-screen items-center justify-center bg-theme-base text-white">
        Loja não encontrada.
      </div>
    );

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden p-5 pt-20 transition-all duration-300 sm:p-6 md:p-12 lg:ml-64 lg:pt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <Link
                href="/lojas"
                className="inline-flex items-center gap-2 text-theme-text-sub hover:text-blue-500 mb-4 transition-all group"
              >
                <span className="p-1.5 bg-theme-header rounded-lg group-hover:bg-theme-hover transition-all border border-theme-border shadow-sm">
                  <Icons.ChevronLeft />
                </span>
                <span className="text-[11px] font-black uppercase tracking-[2px]">
                  Voltar para Lojas
                </span>
              </Link>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="break-words text-4xl font-black tracking-tighter text-theme-text-title leading-none uppercase sm:text-[44px]">
                  {loja.nome_loja}
                </h1>
                <span
                  className={`mt-2 px-3 py-1 ${loja.ativo ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"} border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all`}
                >
                  {loja.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>

            <Link
              href={`/lojas/editar/${loja.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-none bg-blue-600 px-8 py-3.5 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto"
            >
              <Icons.Edit /> Editar Unidade
            </Link>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="group relative overflow-hidden rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all sm:p-8 md:col-span-2">
              <div className="absolute top-0 right-0 p-8 text-blue-500 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all">
                <Icons.MapPin />
              </div>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[3px] mb-6 block">
                Localização
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="text-theme-text-sub/50 text-[11px] font-black uppercase tracking-wider block mb-2">
                    Cidade
                  </label>
                  <p className="text-xl font-black text-theme-text-title uppercase">
                    {loja.cidade}
                  </p>
                </div>
                <div>
                  <label className="text-theme-text-sub/50 text-[11px] font-black uppercase tracking-wider block mb-2">
                    Endereço Completo
                  </label>
                  <p className="text-xl font-black text-theme-text-title leading-tight uppercase">
                    {loja.endereco}
                  </p>
                </div>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-[32px] border border-l-4 border-theme-border border-l-blue-600 bg-theme-header p-5 shadow-sm transition-all hover:bg-theme-hover sm:p-8">
              <span className="text-theme-text-sub/50 text-[10px] font-black uppercase tracking-[3px] mb-4 block">
                Responsável
              </span>
              <div>
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  <Icons.User />
                </div>
                {/* Se o seu back-end retornar o objeto do responsável, use loja.responsavel_nome */}
                <h3 className="text-2xl font-black text-theme-text-title tracking-tighter mb-1 uppercase">
                  {loja.responsavel_nome || "Não definido"}
                </h3>
                <p className="text-blue-500/70 text-[11px] font-black uppercase tracking-widest italic">
                  Gerente de Unidade
                </p>
              </div>
            </div>
          </div>

          {/* Contatos (Se o seu back-end tiver esses campos, senão pode omitir ou mockar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group flex items-center gap-4 rounded-[24px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all hover:border-blue-500/40 hover:bg-theme-hover sm:gap-6 sm:p-6 cursor-default">
              <div className="p-4 bg-theme-header border border-theme-border rounded-2xl text-theme-text-sub group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                <Icons.Phone />
              </div>
              <div>
                <label className="text-theme-text-sub/50 text-[10px] font-black uppercase tracking-widest block mb-1">
                  Telefone de Contato
                </label>
                <p className="text-lg font-black text-theme-text-title font-mono tracking-tighter">
                  (83) 90000-0000
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-4 rounded-[24px] border border-theme-border bg-theme-card p-5 shadow-sm transition-all hover:border-blue-500/40 hover:bg-theme-hover sm:gap-6 sm:p-6 cursor-default">
              <div className="p-4 bg-theme-header border border-theme-border rounded-2xl text-theme-text-sub group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                <Icons.Mail />
              </div>
              <div>
                <label className="text-theme-text-sub/50 text-[10px] font-black uppercase tracking-widest block mb-1">
                  E-mail Corporativo
                </label>
                <p className="break-all text-lg font-black text-theme-text-title lowercase">
                  contato@{loja.nome_loja?.toLowerCase().replace(/\s/g, "")}.com
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-theme-border flex justify-center">
            <button
              onClick={handleDeletar}
              className="flex items-center gap-2 text-theme-text-sub hover:text-red-500 transition-all font-black text-[11px] uppercase tracking-[2px] group"
            >
              <span className="w-8 h-8 rounded-lg border border-theme-border flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500/10 transition-all text-lg leading-none">
                ×
              </span>
              Remover Unidade do Sistema
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
