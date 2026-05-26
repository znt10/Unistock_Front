"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import {
  PRODUTOS_QUERY_KEY,
  type Produto,
  useProdutos,
} from "@/hooks/useProduto";
import { postProduto } from "@/services/uni";

const Icons = {
  ChevronLeft: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Package: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  Barcode: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>
  ),
};

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

const UNIDADES_MEDIDA = [
  { valor: "UNIDADE", label: "Unidade" },
  { valor: "CAIXA", label: "Caixa" },
  { valor: "PACOTE", label: "Pacote" },
  { valor: "QUILO", label: "Quilo" },
  { valor: "LITRO", label: "Litro" },
] as const;

function normalizarTexto(valor?: string) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function NovoProduto() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: produtosExistentes = [] } = useProdutos();

  const [nomeProduto, setNomeProduto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("UNIDADE");
  const [quantidadePorEmbalagem, setQuantidadePorEmbalagem] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("1");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const produtosComNomeParecido = useMemo(() => {
    const nomeNormalizado = normalizarTexto(nomeProduto);

    if (!nomeNormalizado) return [];

    return produtosExistentes.filter(
      (produto) => normalizarTexto(produto.nome_produto) === nomeNormalizado,
    );
  }, [nomeProduto, produtosExistentes]);
  const unidadeUsaEmbalagem =
    unidadeMedida === "CAIXA" || unidadeMedida === "PACOTE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nomeProduto.trim()) {
      setError("Informe o nome do produto.");
      return;
    }

    if (!codigo.trim()) {
      setError("Informe o codigo do produto.");
      return;
    }

    if (!categoria) {
      setError("Selecione a categoria do produto.");
      return;
    }

    if (!estoqueMinimo || Number(estoqueMinimo) < 0) {
      setError("Informe o estoque minimo sugerido.");
      return;
    }

    try {
      setLoading(true);
      const produtoCriado = await postProduto(
        nomeProduto.trim(),
        codigo.trim(),
        unidadeMedida.trim(),
        categoria,
        ativo,
        unidadeUsaEmbalagem && quantidadePorEmbalagem
          ? Number(quantidadePorEmbalagem)
          : null,
        Number(estoqueMinimo),
      );
      queryClient.setQueryData<Produto[] | undefined>(
        PRODUTOS_QUERY_KEY,
        (produtosAtuais) => {
          if (!produtosAtuais) return [produtoCriado];

          const jaExiste = produtosAtuais.some(
            (produto) => produto.id === produtoCriado.id,
          );

          if (jaExiste) return produtosAtuais;

          return [...produtosAtuais, produtoCriado].sort((a, b) =>
            a.nome_produto.localeCompare(b.nome_produto),
          );
        },
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUTOS_QUERY_KEY,
        refetchType: "inactive",
      });
      setSuccess("Produto cadastrado com sucesso.");
      setNomeProduto("");
      setCodigo("");
      setUnidadeMedida("UNIDADE");
      setQuantidadePorEmbalagem("");
      setEstoqueMinimo("1");
      setCategoria("");
      setAtivo(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <Link
              href="/configuracoes"
              className="inline-flex items-center gap-2 text-theme-text-sub hover:text-blue-500 mb-6 transition-all group"
            >
              <span className="p-1.5 bg-theme-header rounded-lg group-hover:bg-theme-hover transition-all border border-theme-border shadow-sm">
                <Icons.ChevronLeft />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">
                Voltar para configuracoes
              </span>
            </Link>

            <h1 className="text-3xl font-black tracking-tighter text-theme-text-title uppercase leading-none sm:text-4xl">
              Cadastrar Produto
            </h1>
            <p className="text-theme-text-sub/60 font-medium mt-3">
              Registre um novo item para uso nos pedidos e no estoque.
            </p>
          </div>

          <div className="rounded-[32px] border border-theme-border bg-theme-card p-5 shadow-2xl sm:p-8 md:p-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="nome-produto"
                  className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                >
                  Nome do produto
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                    <Icons.Package />
                  </div>
                  <input
                    id="nome-produto"
                    type="text"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    placeholder="EX: COXINHA"
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/25 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                    required
                  />
                </div>
              </div>

              {produtosComNomeParecido.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                  <p className="font-black uppercase tracking-[1px]">
                    Ja existem produtos com esse nome
                  </p>
                  <div className="mt-3 space-y-2">
                    {produtosComNomeParecido.map((produto) => (
                      <div
                        key={produto.id}
                        className="rounded-xl bg-theme-header px-4 py-3"
                      >
                        <span className="font-black text-theme-text-title">
                          {produto.nome_produto}
                        </span>
                        <span className="font-bold text-theme-text-sub">
                          {" "}
                          -{" "}
                          {CATEGORIA_LABELS[produto.categoria || ""] ||
                            produto.categoria ||
                            "Sem categoria"}
                        </span>
                        {(produto.codigo || produto.unidade_medida) && (
                          <span className="mt-1 block text-xs font-medium text-theme-text-sub/70">
                            {[produto.codigo && `Codigo: ${produto.codigo}`, produto.unidade_medida && `Unidade: ${produto.unidade_medida}`]
                              .filter(Boolean)
                              .join(" | ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label
                    htmlFor="codigo"
                    className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                  >
                    Codigo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-theme-text-sub/40 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Barcode />
                    </div>
                    <input
                      id="codigo"
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="EX: PROD-001"
                      className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 pl-14 pr-6 text-theme-text-title placeholder:text-theme-text-sub/25 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="unidade-medida"
                    className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                  >
                    Unidade de medida
                  </label>
                  <select
                    id="unidade-medida"
                    value={unidadeMedida}
                    onChange={(e) => {
                      setUnidadeMedida(e.target.value);
                      if (!["CAIXA", "PACOTE"].includes(e.target.value)) {
                        setQuantidadePorEmbalagem("");
                      }
                    }}
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-5 text-theme-text-title focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                  >
                    {UNIDADES_MEDIDA.map((unidade) => (
                      <option key={unidade.valor} value={unidade.valor}>
                        {unidade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label
                    htmlFor="quantidade-embalagem"
                    className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                  >
                    Quantidade interna
                  </label>
                  <input
                    id="quantidade-embalagem"
                    type="number"
                    min={1}
                    disabled={!unidadeUsaEmbalagem}
                    value={quantidadePorEmbalagem}
                    onChange={(e) => setQuantidadePorEmbalagem(e.target.value)}
                    placeholder={
                      unidadeUsaEmbalagem
                        ? "EX: 50 unidades por caixa"
                        : "Disponivel para caixa/pacote"
                    }
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-5 text-theme-text-title placeholder:text-theme-text-sub/25 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="estoque-minimo"
                    className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                  >
                    Estoque minimo sugerido
                  </label>
                  <input
                    id="estoque-minimo"
                    type="number"
                    min={0}
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    placeholder="EX: 2 caixas"
                    className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-5 text-theme-text-title placeholder:text-theme-text-sub/25 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="categoria"
                  className="text-[11px] font-black text-theme-text-sub/50 uppercase tracking-[2px] ml-1"
                >
                  Categoria
                </label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-theme-header border border-theme-border rounded-2xl py-4 px-5 text-theme-text-title focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold uppercase text-sm"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="SALGADOS_GDE">Salgados grande</option>
                  <option value="SALGADOS_MINI">Salgados mini</option>
                  <option value="ESFIHAS_GDE">Esfihas grande</option>
                  <option value="ESFIHAS_MINI">Esfihas mini</option>
                  <option value="FOGAZZAS_GDE">Fogazzas grande</option>
                  <option value="FOGAZZAS_MINI">Fogazzas mini</option>
                  <option value="RECHEIOS">Recheios</option>
                  <option value="MERCADO">Mercado</option>
                </select>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-theme-border bg-theme-header px-5 py-4">
                <span>
                  <span className="block text-sm font-black text-theme-text-title">
                    Produto ativo
                  </span>
                  <span className="text-sm text-theme-text-sub">
                    Produtos ativos aparecem nas listas de pedido.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/configuracoes")}
                  className="flex justify-center items-center py-4 rounded-2xl border border-red-500/20 text-red-500/70 font-black text-[12px] uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-4 rounded-2xl bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 border-none hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Salvando..." : "Salvar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
