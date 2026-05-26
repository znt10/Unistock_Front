"use client";

import { useState } from "react";

type Produto = {
  id: string;
  nome_produto: string;
  codigo?: string;
  unidade_medida?: string;
  categoria?: string;
};

interface Props {
  produtos: Produto[];
  onSelect: (id: string) => void;
}

const CATEGORIA_LABELS: Record<string, string> = {
  SALGADOS_GDE: "Salgados grande",
  SALGADOS_MINI: "Salgados mini",
  ESFIHAS_GDE: "Esfihas grande",
  ESFIHAS_MINI: "Esfihas mini",
  FOGAZZAS_GDE: "Fogazzas grande",
  FOGAZZAS_MINI: "Fogazzas mini",
  RECHEIOS: "Recheios",
  MERCADO: "Mercado",
};

function normalizarTexto(valor?: string) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function categoriaLabel(categoria?: string) {
  if (!categoria) return "Sem categoria";
  return CATEGORIA_LABELS[categoria] || categoria;
}

function produtoLabel(produto: Produto) {
  return `${produto.nome_produto} - ${categoriaLabel(produto.categoria)}`;
}

export default function AutocompleteProduto({ produtos, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [aberto, setAberto] = useState(false);
  const listaProdutos = Array.isArray(produtos) ? produtos : [];
  const queryNormalizada = normalizarTexto(query);

  const filtrados = listaProdutos.filter((p) => {
    const termos = [
      p.nome_produto,
      p.codigo,
      p.unidade_medida,
      p.categoria,
      categoriaLabel(p.categoria),
    ];

    return termos.some((termo) =>
      normalizarTexto(termo).includes(queryNormalizada),
    );
  });

  const produtosComMesmoNome = queryNormalizada
    ? listaProdutos.filter(
        (p) => normalizarTexto(p.nome_produto) === queryNormalizada,
      )
    : [];
  const categoriasComMesmoNome = new Set(
    produtosComMesmoNome.map((p) => categoriaLabel(p.categoria)),
  );
  const temMesmoNomeEmCategoriasDiferentes = categoriasComMesmoNome.size > 1;

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

      {aberto && temMesmoNomeEmCategoriasDiferentes && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300 shadow-2xl">
          Existem produtos com esse nome em categorias diferentes. Confira a
          categoria antes de selecionar.
        </div>
      )}

      {aberto && filtrados.length > 0 && (
        <ul
          data-testid="produto-list"
          className={`absolute z-50 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl max-h-72 overflow-y-auto ${
            temMesmoNomeEmCategoriasDiferentes ? "mt-20" : "mt-2"
          }`}
        >
          {filtrados.map((p) => (
            <li
              key={p.id}
              data-testid={`produto-${p.id}`}
              onMouseDown={() => {
                onSelect(p.id);
                setQuery(produtoLabel(p));
                setAberto(false);
              }}
              className="cursor-pointer px-4 py-3 text-sm text-theme-text-title transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-theme-hover"
            >
              <div className="flex flex-col gap-1">
                <span className="font-black">
                  {p.nome_produto}
                  <span className="font-bold text-theme-text-sub">
                    {" "}
                    - {categoriaLabel(p.categoria)}
                  </span>
                </span>
                <span className="text-xs font-medium text-theme-text-sub/70">
                  {[p.codigo && `Codigo: ${p.codigo}`, p.unidade_medida && `Unidade: ${p.unidade_medida}`]
                    .filter(Boolean)
                    .join(" | ") || "Sem codigo adicional"}
                </span>
              </div>
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
