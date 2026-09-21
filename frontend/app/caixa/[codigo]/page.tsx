"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { ConfirmarPasso } from "@/features/leitura/components/ConfirmarPasso";
import { FaixaDaLeitura } from "@/features/leitura/components/FaixaDaLeitura";
import { useLeituraDeCaixa } from "@/features/leitura/hooks/useLeituraDeCaixa";
import { getCaixa } from "@/features/leitura/services/leitura";

/**
 * Reserva para quando a etiqueta e lida pela camera comum do celular.
 *
 * NAO avanca a caixa ao abrir: recarregar a pagina, ou o navegador
 * pre-carregar o link, avancaria sem ninguem ver. So o botao le.
 */
export default function CaixaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const queryClient = useQueryClient();
  const chave = ["caixa", codigo];

  const { data: caixa, error, isLoading } = useQuery({
    queryKey: chave,
    queryFn: () => getCaixa(codigo),
    retry: false,
  });

  const onMudou = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["caixa", codigo] });
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  }, [queryClient, codigo]);

  const leitura = useLeituraDeCaixa({ onMudou });

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-xl space-y-5">
          <header>
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
              Caixa da fábrica
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              {caixa ? caixa.produto_nome : "Caixa"}
            </h1>
          </header>

          {isLoading && <p>Carregando...</p>}

          {error && (
            <p className="rounded-[20px] bg-red-600 p-5 font-black text-white">
              {error instanceof Error ? error.message : "Erro ao carregar a caixa."}
            </p>
          )}

          {caixa && (
            <section className="space-y-3 rounded-[24px] border border-theme-border bg-theme-card p-5">
              <p className="text-xl font-black uppercase text-theme-text-title">{caixa.loja_nome}</p>
              <p>
                Caixa {caixa.numero}/{caixa.total} · pedido #{caixa.pedido_numero}
              </p>
              <p>
                Situação: <strong className="text-theme-text-title">{caixa.situacao.replace("_", " ")}</strong>
              </p>
              {caixa.proximo ? (
                <button
                  type="button"
                  disabled={leitura.ocupado}
                  onClick={() => void leitura.ler(codigo)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-4 font-black uppercase text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Marcar como {caixa.proximo}
                </button>
              ) : (
                <p className="font-bold">Essa caixa já acabou.</p>
              )}
            </section>
          )}

          <FaixaDaLeitura
            faixa={leitura.faixa}
            onDesfazer={() => void leitura.desfazer()}
            onFechar={leitura.fecharFaixa}
          />

          <Link href="/caixa/ler" className="block text-center font-black uppercase text-blue-500">
            Ler outras caixas
          </Link>
        </div>
      </main>

      {leitura.confirmacao && (
        <ConfirmarPasso
          mensagem={leitura.confirmacao.mensagem}
          onSim={leitura.confirmar}
          onNao={leitura.cancelarConfirmacao}
        />
      )}
    </div>
  );
}
