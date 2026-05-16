// components/HeroUI/AutocompleteLoja.tsx
"use client";

import { useState } from "react";

type Loja = {
  id: string;
  nome_loja: string;
  cidade: string;
};

interface Props {
  lojas: Loja[];
  onSelect: (id: string) => void;
}

export default function AutocompleteLoja({ lojas, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [aberto, setAberto] = useState(false);

  const filtrados = lojas.filter((l) =>
    `${l.nome_loja} ${l.cidade}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAberto(true);
          onSelect("");
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Digite ou selecione uma loja"
        className="w-full rounded-2xl border border-theme-border bg-theme-base py-4 px-4 text-theme-text-title outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
      />

      {aberto && filtrados.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
          {filtrados.map((l) => (
            <li
              key={l.id}
              onMouseDown={() => {
                onSelect(l.id);
                setQuery(`${l.nome_loja} — ${l.cidade}`);
                setAberto(false);
              }}
              className="px-4 py-3 hover:bg-theme-hover cursor-pointer text-theme-text-title text-sm transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="font-medium">{l.nome_loja}</span>
              <span className="text-theme-text-sub/60 ml-2">— {l.cidade}</span>
            </li>
          ))}
        </ul>
      )}

      {aberto && query && filtrados.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl px-4 py-3 text-sm text-theme-text-sub/60">
          Nenhuma loja encontrada
        </div>
      )}
    </div>
  );
}
