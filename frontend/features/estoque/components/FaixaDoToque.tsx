"use client";

import { useEffect } from "react";

export type FaixaDoToqueDados = {
  tipo: "ok" | "erro" | "aviso";
  texto: string;
  toque: string | null;
};

// Mesmo tempo da faixa da leitura. O servidor aceita desfazer por ate 10 minutos.
const DURACAO_MS = 8000;

const CORES: Record<FaixaDoToqueDados["tipo"], string> = {
  ok: "bg-emerald-600",
  aviso: "bg-amber-600",
  erro: "bg-red-600",
};

export default function FaixaDoToque({
  faixa,
  onDesfazer,
  onFechar,
}: {
  faixa: FaixaDoToqueDados | null;
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
      <p className="min-w-0 flex-1 break-words text-lg font-black leading-tight">{faixa.texto}</p>
      {faixa.toque && (
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
