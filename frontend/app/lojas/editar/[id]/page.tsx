"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LOJAS_QUERY_KEY, type Loja } from "@/hooks/useLoja";
import { getLojaById, getUsuarios, patchLoja, UsuarioResumo } from "@/services/uni";

const Icons = {
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Store: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
    </svg>
  ),
  Map: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Power: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
    </svg>
  ),
};

export default function EditarLoja() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [tipo, setTipo] = useState("Loja");
  const [nomeLoja, setNomeLoja] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [ativo, setAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const [loja, usuariosData] = await Promise.all([
          getLojaById(id),
          getUsuarios(),
        ]);

        setNomeLoja(loja.nome_loja ?? "");
        setTipo(loja.tipo ?? "Loja");
        setCidade(loja.cidade ?? "");
        setEndereco(loja.endereco ?? "");
        setResponsavel(loja.responsavel ? String(loja.responsavel) : "");
        setUsuarios(usuariosData);
        setAtivo(Boolean(loja.ativo));
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar unidade.");
        router.push("/lojas");
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      carregarLoja();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeLoja.trim()) {
      alert("Informe o nome da unidade");
      return;
    }
    if (!cidade.trim()) {
      alert("Informe a cidade");
      return;
    }
    if (!endereco.trim()) {
      alert("Informe o endereco");
      return;
    }

    try {
      setSalvando(true);
      const lojaAtualizada = await patchLoja(id, {
        nome_loja: nomeLoja.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        responsavel: responsavel ? Number(responsavel) : null,
        ativo,
      });
      queryClient.setQueryData<Loja[] | undefined>(LOJAS_QUERY_KEY, (lojasAtuais) => {
        if (!lojasAtuais) return lojasAtuais;
        return lojasAtuais.map((loja) => (loja.id === id ? lojaAtualizada : loja));
      });
      queryClient.setQueryData(["lojas", id], lojaAtualizada);
      alert("Unidade atualizada com sucesso!");
      router.push(`/lojas/detalhes/${id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar unidade. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme-base text-theme-text-title font-black uppercase tracking-[2px]">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-12">
            <Link href={`/lojas/detalhes/${id}`} className="inline-flex items-center gap-2 text-theme-text-sub hover:text-blue-500 mb-6 transition-all group">
              <span className="p-1.5 bg-theme-header rounded-lg group-hover:bg-theme-hover transition-all border border-theme-border shadow-sm">
                <Icons.ChevronLeft />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">
                Cancelar e Voltar
              </span>
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-theme-text-title uppercase leading-none sm:text-4xl">
              Editar Unidade
            </h1>
            <p className="text-theme-text-sub/60 font-medium mt-3">
              Atualize os dados cadastrais e o status da unidade selecionada.
            </p>
          </div>

          <div className="rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-2xl sm:p-8 md:rounded-[40px] md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                  Tipo da Unidade
                </span>
                <div className="px-8 py-3 rounded-2xl bg-theme-header border border-theme-border text-theme-text-title font-black text-[11px] uppercase tracking-wider">
                  {tipo === "Fabrica" ? "Fabrica" : "Loja"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAtivo((valor) => !valor)}
                className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 ${
                  ativo
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                <Icons.Power />
                {ativo ? "Ativa" : "Inativa"}
              </button>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                  Identificacao da Unidade
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
                    placeholder="RUA, NUMERO, BAIRRO"
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-6 text-theme-text-title placeholder:text-theme-text-sub/20 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-theme-text-sub/40 uppercase tracking-[2px] ml-1">
                  Responsavel
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Icons.User />
                  </div>
                  <select
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm appearance-none"
                  >
                    <option value="">Sem responsavel</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.first_name || usuario.email || `Usuario ${usuario.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-6">
                <Link href={`/lojas/detalhes/${id}`} className="flex justify-center items-center py-4 rounded-2xl border border-red-500/20 text-red-500/70 font-black text-[12px] uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95">
                  Descartar
                </Link>
                <button
                  type="submit"
                  disabled={salvando}
                  className={`py-4 rounded-2xl bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 border-none ${
                    salvando ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                >
                  {salvando ? "Salvando..." : "Salvar Alteracoes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
