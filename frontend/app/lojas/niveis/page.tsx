"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BarraLojas from "@/features/estoque/components/BarraLojas";
import NiveisDaLoja from "@/features/estoque/components/NiveisDaLoja";
import { useLojas } from "@/features/lojas/hooks/useLoja";

/**
 * Minimo e maximo por loja, numa tela so: escolhe a loja na barra (a mesma
 * do Controle Estoque) e edita embaixo. Item proprio no menu do gerente; os
 * atalhos (lista de lojas, Controle Estoque, Editar loja) chegam com ?loja=.
 */
function Conteudo() {
  const lojaDaUrl = useSearchParams().get("loja") ?? "";
  const [escolhida, setEscolhida] = useState("");
  const { data: lojas = [], isLoading } = useLojas();

  const lojaId = escolhida || lojaDaUrl || lojas[0]?.id || "";
  const loja = lojas.find((item) => item.id === lojaId);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6">
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-orange-500">
              Gerência
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              Mínimo e máximo
            </h1>
            <p className="mt-3 font-medium text-theme-text-sub/60">
              Escolha a loja e ajuste quanto cada produto precisa ter.
            </p>
          </header>

          <div className="mb-6">
            <BarraLojas
              lojaAtiva={lojaId}
              lojas={lojas}
              onChange={setEscolhida}
              notificacoesExternas={0}
              mostrarTodas={false}
            />
          </div>

          {isLoading ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
              Carregando lojas...
            </div>
          ) : loja ? (
            <NiveisDaLoja key={loja.id} lojaId={loja.id} nomeLoja={loja.nome_loja} />
          ) : (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
              Nenhuma loja encontrada.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MinimoEMaximoPage() {
  return (
    <Suspense fallback={null}>
      <Conteudo />
    </Suspense>
  );
}
