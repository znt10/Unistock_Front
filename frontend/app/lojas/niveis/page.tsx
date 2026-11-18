"use client";

import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NiveisDaLoja from "@/features/estoque/components/NiveisDaLoja";
import { useLojas } from "@/features/lojas/hooks/useLoja";
import { useProdutos } from "@/features/produtos/hooks/useProduto";
import { getEstoques } from "@/features/estoque/services/estoque";
import BotaoVoltar from "@/shared/components/BotaoVoltar";

/**
 * Minimo e maximo por loja, no jeito do Painel unidade: sem ?loja= mostra um
 * cartao por loja; tocando num cartao (ou chegando por um atalho com ?loja=)
 * abre o editor daquela loja, com o botao "Lojas" para voltar aos cartoes.
 */
function Conteudo() {
  const lojaId = useSearchParams().get("loja") ?? "";
  const { data: lojas = [], isLoading } = useLojas();
  const loja = lojas.find((item) => item.id === lojaId);
  const { data: produtos = [] } = useProdutos();
  const { data: estoques = [] } = useQuery({
    queryKey: ["estoque"],
    queryFn: getEstoques,
  });

  // Quantos produtos cada loja ainda nao tem no estoque (o "?" do cartao),
  // mesma conta que o editor faz por produto.
  const faltandoPorLoja = useMemo(() => {
    const temPorLoja = new Map<string, Set<string>>();
    for (const item of estoques) {
      if (!temPorLoja.has(item.loja)) temPorLoja.set(item.loja, new Set());
      temPorLoja.get(item.loja)!.add(item.produto);
    }
    const mapa = new Map<string, number>();
    for (const item of lojas) {
      const tem = temPorLoja.get(item.id) ?? new Set<string>();
      mapa.set(item.id, produtos.filter((produto) => !tem.has(produto.id)).length);
    }
    return mapa;
  }, [estoques, lojas, produtos]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-28 sm:p-8 sm:pt-28 md:p-12 md:pt-28 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-5xl">
          {lojaId && (
            <BotaoVoltar href="/lojas/niveis" rotulo="Lojas" className="mb-6" />
          )}

          <header className="mb-8">
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-orange-500">
              Mínimo e máximo
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              {lojaId ? loja?.nome_loja ?? (isLoading ? "Carregando..." : "Loja") : "Escolha a loja"}
            </h1>
            {!lojaId && (
              <p className="mt-3 font-medium text-theme-text-sub/60">
                Toque numa loja para ajustar quanto cada produto precisa ter.
              </p>
            )}
          </header>

          {isLoading ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
              Carregando lojas...
            </div>
          ) : lojaId ? (
            loja ? (
              <NiveisDaLoja key={loja.id} lojaId={loja.id} nomeLoja={loja.nome_loja} />
            ) : (
              <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
                Loja não encontrada.
              </div>
            )
          ) : lojas.length === 0 ? (
            <div className="rounded-[24px] border border-theme-border bg-theme-card p-8 text-center text-sm font-bold">
              Nenhuma loja encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lojas.map((item) => (
                <Link
                  key={item.id}
                  href={`/lojas/niveis?loja=${item.id}`}
                  className="group flex items-center justify-between rounded-[24px] border border-theme-border bg-theme-card p-6 transition hover:border-orange-500/40"
                >
                  <span className="flex min-w-0 items-center gap-2 break-words text-lg font-black uppercase text-theme-text-title group-hover:text-orange-500">
                    {item.nome_loja}
                    {(faltandoPorLoja.get(item.id) ?? 0) > 0 && (
                      <span
                        title="Tem produto que ainda não está no estoque desta loja"
                        aria-label="Tem produto que ainda não está no estoque desta loja"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-black"
                      >
                        ?
                      </span>
                    )}
                  </span>
                  <span aria-hidden className="text-xl font-black text-theme-text-sub group-hover:text-orange-500">
                    →
                  </span>
                </Link>
              ))}
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
