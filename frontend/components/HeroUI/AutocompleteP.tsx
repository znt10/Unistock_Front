"use client";

import { useState } from "react";

type Produto = {
  id: string;
  nome_produto: string;
};

interface Props {
  produtos: Produto[];
  onSelect: (id: string) => void;
}

export default function AutocompleteProduto({ produtos, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [aberto, setAberto] = useState(false);
  const listaProdutos = Array.isArray(produtos) ? produtos : [];

  const filtrados = listaProdutos.filter((p) =>
    p.nome_produto.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      <input
        data-testid="produto-input"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAberto(true);
          onSelect("");
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Digite ou selecione um produto"
        className="w-full rounded-2xl border border-theme-border bg-theme-base py-4 px-4 text-theme-text-title outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
      />

      {aberto && filtrados.length > 0 && (
        <ul
          data-testid="produto-list"
          className="absolute z-50 mt-2 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl max-h-52 overflow-y-auto"
        >
          {filtrados.map((p) => (
            <li
              key={p.id}
              data-testid={`produto-${p.id}`}
              onMouseDown={() => {
                onSelect(p.id);
                setQuery(p.nome_produto);
                setAberto(false);
              }}
              className="px-4 py-3 hover:bg-theme-hover cursor-pointer text-theme-text-title text-sm transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="font-medium">{p.nome_produto}</span>
            </li>
          ))}
        </ul>
      )}

      {aberto && query && filtrados.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl px-4 py-3 text-sm text-theme-text-sub/60">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
}
