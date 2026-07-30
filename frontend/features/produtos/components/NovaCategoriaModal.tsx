"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CATEGORIAS_QUERY_KEY,
  type Categoria,
} from "@/features/produtos/hooks/useCategorias";
import { postCategoria } from "@/features/produtos/services/categorias";

type Props = {
  onClose: () => void;
  onCriada: (categoria: Categoria) => void;
};

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default function NovaCategoriaModal({ onClose, onCriada }: Props) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Informe um nome para a categoria.");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      const categoriaCriada: Categoria = await postCategoria(nome.trim());

      queryClient.setQueryData<Categoria[] | undefined>(
        CATEGORIAS_QUERY_KEY,
        (atuais) => {
          if (!atuais) return [categoriaCriada];
          if (atuais.some((c) => c.id === categoriaCriada.id)) return atuais;
          return [...atuais, categoriaCriada].sort(
            (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome),
          );
        },
      );
      await queryClient.invalidateQueries({
        queryKey: CATEGORIAS_QUERY_KEY,
        refetchType: "inactive",
      });

      onCriada(categoriaCriada);
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao criar categoria.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-theme-border bg-theme-card p-6 text-theme-text-title shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[3px] text-blue-500">
              Categorias
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight">
              Nova categoria
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-theme-border bg-theme-header p-2 text-theme-text-sub transition hover:text-theme-text-title"
            aria-label="Fechar"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nova-categoria-nome" className="ml-1 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
              Nome da categoria
            </label>
            <input
              id="nova-categoria-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="EX: BEBIDAS"
              autoFocus
              className="w-full rounded-2xl border border-theme-border bg-theme-header py-3.5 px-5 text-sm font-bold uppercase text-theme-text-title placeholder:text-theme-text-sub/25 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-2xl border border-theme-border py-3 text-[11px] font-black uppercase tracking-widest text-theme-text-sub transition hover:bg-theme-hover active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-2xl border-none bg-blue-600 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
