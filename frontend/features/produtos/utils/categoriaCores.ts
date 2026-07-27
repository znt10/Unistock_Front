// Categoria agora e um model dinamico (sem cor cadastrada no backend), entao
// a cor de cada uma e derivada do id — estavel entre renders/paginas sem
// precisar sincronizar ordem de fetch entre telas diferentes.
const PALETA = [
  { dot: "bg-orange-500", cor: "text-orange-500", borda: "border-orange-500/30", bg: "bg-orange-500/10" },
  { dot: "bg-red-500", cor: "text-red-500", borda: "border-red-500/30", bg: "bg-red-500/10" },
  { dot: "bg-emerald-500", cor: "text-emerald-500", borda: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { dot: "bg-blue-500", cor: "text-blue-500", borda: "border-blue-500/30", bg: "bg-blue-500/10" },
  { dot: "bg-violet-500", cor: "text-violet-500", borda: "border-violet-500/30", bg: "bg-violet-500/10" },
  { dot: "bg-amber-500", cor: "text-amber-500", borda: "border-amber-500/30", bg: "bg-amber-500/10" },
  { dot: "bg-pink-500", cor: "text-pink-500", borda: "border-pink-500/30", bg: "bg-pink-500/10" },
  { dot: "bg-cyan-500", cor: "text-cyan-500", borda: "border-cyan-500/30", bg: "bg-cyan-500/10" },
] as const;

function hash(valor: string) {
  let h = 0;
  for (let i = 0; i < valor.length; i += 1) {
    h = (h * 31 + valor.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function corDaCategoria(id: string) {
  return PALETA[hash(id) % PALETA.length];
}
