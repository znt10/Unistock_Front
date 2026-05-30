"use client";

import { useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import HistoricoEstoque from "@/components/estoque/HistoricoEstoque";
import { useEstoque } from "@/hooks/useEstoque";
import { useLojas } from "@/hooks/useLoja";
import { useProdutos } from "@/hooks/useProduto";
import { selectIsGerente, useAuthStore } from "@/stores/authStore";

/**
 * Tela dedicada de Historico de estoque.
 * Reaproveita os mesmos hooks da pagina /estoque para resolver
 * nomes de loja e produto, e respeita o cargo do usuario.
 */
export default function HistoricoPage() {
  const { historico } = useEstoque();
  const { data: lojasQuery = [] } = useLojas();
  const { data: produtosQuery = [] } = useProdutos();
  const usuario = useAuthStore((state) => state.user);
  const isGerente = useAuthStore(selectIsGerente);
  const lojaIdUsuario = usuario?.loja_id;

  const nomePorLoja = useMemo(() => {
    const mapa = new Map<string, string>();
    (Array.isArray(lojasQuery) ? lojasQuery : []).forEach((loja) =>
      mapa.set(loja.id, loja.nome_loja),
    );
    return mapa;
  }, [lojasQuery]);

  const nomePorProduto = useMemo(() => {
    const mapa = new Map<string, string>();
    (Array.isArray(produtosQuery) ? produtosQuery : []).forEach((produto) =>
      mapa.set(produto.id, produto.nome_produto),
    );
    return mapa;
  }, [produtosQuery]);

  const historicoVisivel = useMemo(() => {
    if (isGerente) return historico;
    if (!lojaIdUsuario) return [];
    return historico.filter((item) => item.loja === lojaIdUsuario);
  }, [historico, isGerente, lojaIdUsuario]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub">
      <Sidebar />

      <main className="min-w-0 pt-16 lg:ml-64 lg:pt-0">
        <header className="sticky top-0 z-20 border-b border-theme-border bg-theme-base/95 px-5 py-4 backdrop-blur md:px-8">
          <span className="mb-2 block text-xs font-black uppercase tracking-[3px] text-blue-500">
            Auditoria
          </span>
          <h1 className="break-words text-2xl font-black uppercase tracking-tight text-theme-text-title sm:text-3xl md:text-4xl">
            Historico
          </h1>
          <p className="mt-1 text-sm font-medium text-theme-text-sub sm:text-base">
            Todas as alteracoes de contagem registradas no dispositivo.
          </p>
        </header>

        <div className="px-5 py-6 md:px-8">
          <HistoricoEstoque
            historico={historicoVisivel}
            nomePorLoja={nomePorLoja}
            nomePorProduto={nomePorProduto}
            limite={50}
          />
        </div>
      </main>
    </div>
  );
}
