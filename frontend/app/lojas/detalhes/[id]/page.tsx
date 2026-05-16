"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getLojaById, deleteLoja } from "@/services/uni"; // Ajuste o caminho do import

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

export default function DetalheLoja() {
  const params = useParams();
  const router = useRouter();
  const [loja, setLoja] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchLoja();
    }
  }, [params.id]);

  const fetchLoja = async () => {
    try {
      const data = await getLojaById(params.id as string);
      setLoja(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar loja.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm("Tem certeza que deseja remover esta unidade?")) {
      const ok = await deleteLoja(params.id as string);
      if (ok) router.push("/lojas");
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
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 md:p-12 transition-all duration-300 relative overflow-hidden">
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

              <div className="flex items-center gap-4">
                <h1 className="text-[44px] font-black tracking-tighter text-theme-text-title leading-none uppercase">
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 border-none"
            >
              <Icons.Edit /> Editar Unidade
            </Link>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 bg-theme-card border border-theme-border rounded-[32px] p-8 shadow-sm relative overflow-hidden group transition-all">
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

            <div className="bg-theme-header border border-theme-border rounded-[32px] p-8 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-600 transition-all hover:bg-theme-hover group">
              <span className="text-theme-text-sub/50 text-[10px] font-black uppercase tracking-[3px] mb-4 block">
                Responsável
              </span>
              <div>
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  <Icons.User />
                </div>
                {/* Se o seu back-end retornar o objeto do responsável, use loja.responsavel_nome */}
                <h3 className="text-2xl font-black text-theme-text-title tracking-tighter mb-1 uppercase">
                  {loja.responsavel || "Não definido"}
                </h3>
                <p className="text-blue-500/70 text-[11px] font-black uppercase tracking-widest italic">
                  Gerente de Unidade
                </p>
              </div>
            </div>
          </div>

          {/* Contatos (Se o seu back-end tiver esses campos, senão pode omitir ou mockar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-theme-card border border-theme-border rounded-[24px] p-6 flex items-center gap-6 hover:border-blue-500/40 hover:bg-theme-hover transition-all group cursor-default shadow-sm">
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

            <div className="bg-theme-card border border-theme-border rounded-[24px] p-6 flex items-center gap-6 hover:border-blue-500/40 hover:bg-theme-hover transition-all group cursor-default shadow-sm">
              <div className="p-4 bg-theme-header border border-theme-border rounded-2xl text-theme-text-sub group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                <Icons.Mail />
              </div>
              <div>
                <label className="text-theme-text-sub/50 text-[10px] font-black uppercase tracking-widest block mb-1">
                  E-mail Corporativo
                </label>
                <p className="text-lg font-black text-theme-text-title lowercase">
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
