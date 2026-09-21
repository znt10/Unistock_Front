"use client";

import { useEffect } from "react";
import type { Faixa } from "@/features/leitura/hooks/useLeituraDeCaixa";

// Tempo do botao Desfazer na tela. O servidor aceita ate 10 minutos.
const DURACAO_MS = 8000;

const CORES: Record<Faixa["tipo"], string> = {
  CHEGOU: "bg-emerald-600",
  ABERTA: "bg-blue-600",
  ACABOU: "bg-slate-600",
  aviso: "bg-amber-600",
  erro: "bg-red-600",
};

export function FaixaDaLeitura({
  faixa,
  onDesfazer,
  onFechar,
}: {
  faixa: Faixa | null;
  onDesfazer: () => void;
  onFechar: () => void;
}) {
  useEffect(() => {
    if (!faixa) return;
    const timer = setTimeout(onFechar, DURACAO_MS);
    return () => clearTimeout(timer);
  }, [faixa, onFechar]);

  if (!faixa) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`${CORES[faixa.tipo]} flex items-center gap-4 rounded-[20px] p-5 text-white shadow-lg`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-black uppercase leading-tight tracking-tight">{faixa.titulo}</p>
        {faixa.detalhe && <p className="mt-1 text-sm font-bold text-white/90">{faixa.detalhe}</p>}
      </div>
      {faixa.leitura && (
        <button
          type="button"
          onClick={onDesfazer}
          className="shrink-0 rounded-xl bg-white/20 px-4 py-3 text-sm font-black uppercase tracking-wide hover:bg-white/30"
        >
          Desfazer
        </button>
      )}
    </div>
  );
}
