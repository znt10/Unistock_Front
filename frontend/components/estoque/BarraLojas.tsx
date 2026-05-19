"use client";

type Props = {
  lojaAtiva: string;
  lojas: { id: string; nome_loja: string }[];
  onChange: (loja: string) => void;
  notificacoesExternas: number;
  mostrarTodas?: boolean;
};

export default function BarraLojas({
  lojaAtiva,
  lojas,
  onChange,
  notificacoesExternas,
  mostrarTodas = true,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3">
      {mostrarTodas && (
        <button
          type="button"
          onClick={() => onChange("TODAS")}
          className={`relative shrink-0 rounded-lg border px-4 py-2 text-sm font-black uppercase tracking-[1px] transition ${
            lojaAtiva === "TODAS"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-theme-border bg-theme-card text-theme-text-sub hover:text-theme-text-title"
          }`}
        >
          TODAS AS LOJAS
          {notificacoesExternas > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
              {notificacoesExternas}
            </span>
          )}
        </button>
      )}

      {lojas.map((loja) => (
        <button
          type="button"
          key={loja.id}
          onClick={() => onChange(loja.id)}
          className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-black uppercase tracking-[1px] transition ${
            lojaAtiva === loja.id
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-theme-border bg-theme-card text-theme-text-sub hover:text-theme-text-title"
          }`}
        >
          {loja.nome_loja.toUpperCase() === "ZILDA"
            ? "ZILDA / CASA VERDE"
            : loja.nome_loja}
        </button>
      ))}
    </div>
  );
}
