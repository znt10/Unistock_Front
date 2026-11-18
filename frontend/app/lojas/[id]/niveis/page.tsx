"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NiveisDaLoja from "@/features/estoque/components/NiveisDaLoja";
import { useLojas } from "@/features/lojas/hooks/useLoja";

/**
 * Minimo e maximo de cada produto numa loja, numa tela so dela.
 *
 * Antes isto ficava no fim de "Editar loja", onde ninguem achava. Chega-se
 * aqui pelo botao "Mínimo e máximo" na lista de lojas ou pelo atalho no
 * Controle Estoque com a loja escolhida. So a gerencia (o proxy so libera
 * /lojas para o gerente).
 */
export default function NiveisDaLojaPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { data: lojas = [], isLoading } = useLojas();
  const loja = lojas.find((item) => item.id === id);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/lojas"
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub transition hover:text-orange-500"
          >
            ← Lojas
          </Link>

          <header className="mb-8">
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-orange-500">
              Mínimo e máximo
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              {loja?.nome_loja ?? (isLoading ? "Carregando..." : "Loja")}
            </h1>
          </header>

          {!isLoading && !loja ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
              Loja não encontrada.
            </div>
          ) : (
            loja && <NiveisDaLoja lojaId={loja.id} nomeLoja={loja.nome_loja} />
          )}
        </div>
      </main>
    </div>
  );
}
