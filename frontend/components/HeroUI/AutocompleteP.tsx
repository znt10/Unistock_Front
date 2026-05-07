"use client";

import { useState } from "react";

type Produto = {
  id: number;
  nome_produto: string;
};

interface Props {
  produtos: Produto[];
  onSelect: (id: number | "") => void;
}

export default function AutocompleteProduto({ produtos, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = produtos.filter((p) =>
    p.nome_produto.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      <input
        data-testid="produto-input"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onSelect("");
        }}
        onFocus={() => setOpen(true)}
        placeholder="Digite o produto"
        className="w-full p-4 rounded-2xl border border-theme-border bg-theme-base"
      />

      {open && filtered.length > 0 && (
        <ul
          data-testid="produto-list"
          className="absolute z-50 w-full mt-2 bg-theme-card border rounded-2xl max-h-52 overflow-auto"
        >
          {filtered.map((p) => (
            <li
              key={p.id}
              data-testid={`produto-${p.id}`}
              onMouseDown={() => {
                onSelect(p.id);
                setQuery(p.nome_produto);
                setOpen(false);
              }}
              className="p-3 hover:bg-theme-hover cursor-pointer"
            >
              {p.nome_produto}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
