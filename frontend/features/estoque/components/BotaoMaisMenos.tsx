const BASE =
  "flex touch-manipulation h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl font-black leading-none transition active:scale-95";

export default function BotaoMaisMenos({
  valor,
  nome,
  onMenos,
  onMais,
  desligarMenos,
}: {
  valor: number;
  nome: string;
  onMenos: () => void;
  onMais: () => void;
  desligarMenos?: boolean;
}) {
  const menosDesligado = desligarMenos || valor <= 0;
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label={`Tirar um de ${nome}`}
        disabled={menosDesligado}
        onClick={onMenos}
        className={`${BASE} border border-theme-border bg-theme-card text-theme-text-title disabled:opacity-30`}
      >
        −
      </button>
      <span className="min-w-[3.5rem] text-center text-3xl font-black tabular-nums text-theme-text-title">
        {valor}
      </span>
      <button
        type="button"
        aria-label={`Pôr um de ${nome}`}
        onClick={onMais}
        className={`${BASE} bg-blue-600 text-white hover:bg-blue-700`}
      >
        +
      </button>
    </div>
  );
}
