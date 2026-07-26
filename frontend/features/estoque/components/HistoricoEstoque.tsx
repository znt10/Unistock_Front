"use client";

import { AlertTriangle, ArrowRight, History, TrendingDown, TrendingUp } from "lucide-react";
import type { HistoricoEstoque as HistoricoEstoqueData } from "@/hooks/useEstoque";

type Props = {
  historico: HistoricoEstoqueData[];
  nomePorLoja: Map<string, string>;
  nomePorProduto: Map<string, string>;
  limite?: number;
};

function nomeLoja(nome: string) {
  return nome.toUpperCase() === "ZILDA" ? "Zilda / Casa Verde" : nome;
}

function formatarData(data?: string) {
  if (!data) return "Sem registro";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

/**
 * Linha do tempo das ultimas alteracoes de estoque.
 * Drop-in: substitui o bloco "Historico recente" da pagina /estoque,
 * ou use na pagina dedicada /historico.
 */
export default function HistoricoEstoque({
  historico,
  nomePorLoja,
  nomePorProduto,
  limite = 30,
}: Props) {
  const itens = historico.slice(0, limite);

  return (
    <section className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-theme-border px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
            <History size={20} />
          </span>
          <div>
            <h2 className="text-base font-black uppercase tracking-[2px] text-theme-text-title">
              Historico
            </h2>
            <p className="text-sm font-medium text-theme-text-sub">
              Ultimas {itens.length} alteracoes de contagem
            </p>
          </div>
        </div>
      </header>

      <div className="divide-y divide-theme-border">
        {itens.map((item, index) => {
          const de = item.anterior ?? null;
          const para = item.novo ?? item.qtd ?? null;
          const zerou = (para ?? 0) <= 0;
          const subiu = de === null || (para ?? 0) >= de;
          const tone = zerou ? "danger" : subiu ? "ok" : "warn";

          const toneText =
            tone === "ok"
              ? "text-emerald-500"
              : tone === "warn"
                ? "text-amber-500"
                : "text-red-500";
          const toneBg =
            tone === "ok"
              ? "bg-emerald-500/10 text-emerald-500"
              : tone === "warn"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-red-500/10 text-red-500";

          return (
            <div
              key={`${item.updatedAt}-${index}`}
              className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 transition hover:bg-theme-hover/60 md:grid-cols-[40px_minmax(0,1fr)_auto_auto] md:px-6"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneBg}`}>
                {zerou ? (
                  <AlertTriangle size={16} />
                ) : subiu ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-theme-text-title">
                  {nomePorProduto.get(item.produto) || item.produto}
                </p>
                <p className="truncate text-xs font-medium text-theme-text-sub">
                  {nomeLoja(nomePorLoja.get(item.loja) || item.loja)} · {item.categoria}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-self-end text-theme-text-sub">
                <span className="text-sm font-bold tabular-nums">{de ?? "-"}</span>
                <ArrowRight size={14} />
                <span className={`text-base font-black tabular-nums ${toneText}`}>
                  {para ?? "-"}
                </span>
              </div>

              <div className="hidden min-w-[88px] text-right md:block">
                <span className="block text-sm font-bold text-theme-text-title">
                  {item.usuario || "Usuario"}
                </span>
                <span className="text-[11px] font-medium text-theme-text-sub">
                  {formatarData(item.updatedAt)}
                </span>
              </div>
            </div>
          );
        })}

        {itens.length === 0 && (
          <p className="px-6 py-10 text-center text-base font-medium text-theme-text-sub">
            Nenhuma alteracao registrada ainda.
          </p>
        )}
      </div>
    </section>
  );
}
