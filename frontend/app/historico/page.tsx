"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  History,
  Settings2,
  ShoppingCart,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { getMovimentacoes, type MovimentacaoEstoque } from "@/services/uni";

/**
 * Historico de movimentacoes de estoque, direto do banco (auditavel).
 * O backend ja restringe: responsavel ve so as lojas dele; gerente ve tudo.
 */

const TIPOS: Record<
  MovimentacaoEstoque["tipo"],
  { rotulo: string; icone: React.ReactNode; classe: string }
> = {
  ENTRADA: {
    rotulo: "Entrada",
    icone: <ArrowDownToLine size={16} />,
    classe: "bg-emerald-500/10 text-emerald-600",
  },
  SAIDA: {
    rotulo: "Saída",
    icone: <ArrowUpFromLine size={16} />,
    classe: "bg-red-500/10 text-red-600",
  },
  TRANSFERENCIA: {
    rotulo: "Transferência",
    icone: <ArrowRightLeft size={16} />,
    classe: "bg-blue-500/10 text-blue-600",
  },
  AJUSTE: {
    rotulo: "Ajuste",
    icone: <Settings2 size={16} />,
    classe: "bg-amber-500/10 text-amber-600",
  },
  VENDA_PDV: {
    rotulo: "Venda PDV",
    icone: <ShoppingCart size={16} />,
    classe: "bg-purple-500/10 text-purple-600",
  },
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

function descreverLojas(mov: MovimentacaoEstoque) {
  if (mov.tipo === "TRANSFERENCIA") {
    return `${mov.loja_origem_nome ?? "—"} → ${mov.loja_destino_nome ?? "—"}`;
  }
  return mov.loja_destino_nome ?? mov.loja_origem_nome ?? "—";
}

export default function HistoricoPage() {
  const {
    data: movimentacoes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movimentacoes"],
    queryFn: getMovimentacoes,
    refetchInterval: 60 * 1000,
  });

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
            Movimentações de estoque registradas no sistema.
          </p>
        </header>

        <div className="px-5 py-6 md:px-8">
          <section className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card shadow-sm">
            <header className="flex items-center gap-3 border-b border-theme-border px-5 py-4 md:px-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <History size={20} />
              </span>
              <div>
                <h2 className="text-base font-black uppercase tracking-[2px] text-theme-text-title">
                  Movimentações
                </h2>
                <p className="text-sm font-medium text-theme-text-sub">
                  Últimas {movimentacoes.length} movimentações
                </p>
              </div>
            </header>

            {isLoading ? (
              <p className="px-6 py-10 text-sm font-medium">Carregando historico...</p>
            ) : error ? (
              <p className="px-6 py-10 text-sm font-medium text-red-500">
                Erro ao carregar o historico. Tente novamente.
              </p>
            ) : movimentacoes.length === 0 ? (
              <p className="px-6 py-10 text-sm font-medium">
                Nenhuma movimentação registrada ainda.
              </p>
            ) : (
              <div className="divide-y divide-theme-border">
                {movimentacoes.map((mov) => {
                  const tipo = TIPOS[mov.tipo] ?? TIPOS.AJUSTE;
                  return (
                    <div
                      key={mov.id}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tipo.classe}`}
                        >
                          {tipo.icone}
                        </span>
                        <div>
                          <p className="font-bold text-theme-text-title">
                            {mov.quantidade}x {mov.produto_nome}
                          </p>
                          <p className="text-xs font-medium text-theme-text-sub">
                            {tipo.rotulo} · {descreverLojas(mov)}
                            {mov.usuario_nome ? ` · por ${mov.usuario_nome}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-theme-text-sub">
                        {formatarData(mov.data)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
