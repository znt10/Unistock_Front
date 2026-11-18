import Link from "next/link";

const ABAS = [
  { id: "novo", href: "/novopedido", label: "Novo pedido" },
  { id: "meus", href: "/meuspedidos", label: "Meus pedidos" },
] as const;

export default function AbasDoPedido({ ativa }: { ativa: "novo" | "meus" }) {
  return (
    <nav aria-label="Pedidos" className="mb-6 flex gap-2">
      {ABAS.map((aba) => {
        const isAtiva = aba.id === ativa;
        return (
          <Link
            key={aba.id}
            href={aba.href}
            aria-current={isAtiva ? "page" : undefined}
            className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors sm:flex-none ${
              isAtiva
                ? "bg-blue-600 text-white"
                : "border border-theme-border bg-theme-card text-theme-text-sub hover:text-blue-500"
            }`}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
