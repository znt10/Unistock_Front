import Link from "next/link";

/**
 * Voltar visivel de verdade: botao com borda e fundo laranja-claro, seta e
 * texto legivel. Antes cada tela tinha um "Voltar" cinza pequeno que quase
 * nao aparecia (sobretudo no celular).
 */
export default function BotaoVoltar({
  href,
  rotulo = "Voltar",
  className = "",
}: {
  href: string;
  rotulo?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2.5 text-sm font-black uppercase tracking-[1px] text-orange-500 transition hover:bg-orange-500/20 active:scale-95 ${className}`}
    >
      <svg
        aria-hidden
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      {rotulo}
    </Link>
  );
}
