"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LOJAS_QUERY_KEY, type Loja } from "@/features/lojas/hooks/useLoja";
import { postLoja } from "@/features/lojas/services/lojas";

const Icons = {
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
  Store: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  ),
  Map: () => (
    <svg
      width="18"
      height="18"
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
      width="18"
      height="18"
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
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

export default function NovaLoja() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tipo, setTipo] = useState<"Loja" | "Fabrica">("Loja");
  const [nomeLoja, setNomeLoja] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeLoja.trim()) {
      toast.error("Informe o nome da unidade");
      return;
    }
    if (!cidade.trim()) {
      toast.error("Informe a cidade");
      return;
    }
    if (!endereco.trim()) {
      toast.error("Informe o endereço");
      return;
    }

    try {
      setLoading(true);
      const lojaCriada = await postLoja(
        nomeLoja.trim(),
        tipo,
        cidade.trim(),
        endereco.trim(),
        email.trim(),
        telefone.trim(),
      );
      queryClient.setQueryData<Loja[] | undefined>(LOJAS_QUERY_KEY, (lojasAtuais) => {
        if (!lojasAtuais) return lojasAtuais;
        return [...lojasAtuais, lojaCriada];
      });
      toast.success("Unidade salva com sucesso!");
      router.push("/lojas");
    } catch (error: unknown) {
      toast.error("Erro ao salvar unidade. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/lojas"
              className="inline-flex items-center gap-2 text-theme-text-sub hover:text-blue-500 mb-6 transition-all group"
            >
              <span className="p-1.5 bg-theme-header rounded-lg group-hover:bg-theme-hover transition-all border border-theme-border shadow-sm">
                <Icons.ChevronLeft />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">
                Cancelar e Voltar
              </span>
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-theme-text-title uppercase leading-none sm:text-4xl">
              Adicionar Unidade
            </h1>
            <p className="text-theme-text-sub/60 font-medium mt-3">
              Configure os parâmetros básicos para o registro da nova unidade.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-2xl sm:p-8 md:rounded-[40px] md:p-10">
            {/* Toggle Fábrica / Loja */}
            <div className="mb-10 grid w-full grid-cols-2 rounded-2xl border border-theme-border bg-theme-header p-1.5 sm:w-fit">
              {(["Fabrica", "Loja"] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setTipo(opcao)}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 sm:px-8 ${
                    tipo === opcao
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-theme-text-sub/50 hover:text-theme-text-title"
                  }`}
                >
                  {opcao === "Fabrica" ? "Fábrica" : "Loja"}
                </button>
              ))}
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Nome */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                  Identificação da Unidade
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                    <Icons.Store />
                  </div>
                  <input
                    type="text"
                    value={nomeLoja}
                    onChange={(e) => setNomeLoja(e.target.value)}
                    placeholder="EX: UNIDADE CENTRAL PATOS"
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm tracking-tight"
                  />
                </div>
              </div>

              {/* Cidade + Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                    Cidade
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Map />
                    </div>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="CIDADE"
                      className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="RUA, NÚMERO, BAIRRO"
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                  />
                </div>
              </div>

              {/* Contato: Email + WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                    E-mail
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Mail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@unidade.com"
                      className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                    WhatsApp
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Phone />
                    </div>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(83) 99999-8888"
                      className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-6">
                <Link
                  href="/lojas"
                  className="flex justify-center items-center py-4 rounded-2xl border border-red-500/20 text-red-500/70 font-black text-[12px] uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95"
                >
                  Descartar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-4 rounded-2xl bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 border-none ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Salvando..." : "Salvar Unidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
