"use client";

export function ConfirmarPasso({
  mensagem,
  onSim,
  onNao,
}: {
  mensagem: string;
  onSim: () => void;
  onNao: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
    >
      <div className="w-full max-w-md rounded-[24px] border border-theme-border bg-theme-card p-6">
        <p className="text-lg font-black text-theme-text-title">{mensagem}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onNao}
            className="flex-1 rounded-xl border border-theme-border px-4 py-3 font-black uppercase text-theme-text-sub hover:bg-theme-hover"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onSim}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-black uppercase text-white hover:bg-blue-500"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}
