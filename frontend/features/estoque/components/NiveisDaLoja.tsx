"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useProdutos } from "@/features/produtos/hooks/useProduto";
import { useCategorias } from "@/features/produtos/hooks/useCategorias";
import { corDaCategoria } from "@/features/produtos/utils/categoriaCores";
import {
  getEstoques,
  patchEstoque,
  postEstoque,
  type EstoqueApi,
} from "@/features/estoque/services/estoque";

type Props = {
  /** public_id da loja. */
  lojaId: string;
  nomeLoja: string;
};

/**
 * Minimo e maximo de cada produto NESTA loja.
 *
 * Mora na tela da loja, e nao na de estoque, porque a pergunta que estes
 * numeros respondem e sobre a loja: a Lapa gira muito mais que a Casa Verde e
 * precisa de niveis maiores; ao mesmo tempo nao pode acumular, porque estraga.
 * Ver os dois lado a lado, loja a loja, e o que deixa comparar de relance.
 */
export default function NiveisDaLoja({ lojaId, nomeLoja }: Props) {
  const queryClient = useQueryClient();
  const { data: produtos = [] } = useProdutos();
  const { data: categorias = [] } = useCategorias();
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const { data: estoques = [] } = useQuery({
    queryKey: ["estoque"],
    queryFn: getEstoques,
  });

  const [rascunho, setRascunho] = useState<
    Record<string, { minimo?: number; maximo?: number }>
  >({});
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<Record<string, string>>({});
  // Niveis digitados no cabecalho de cada categoria, antes de aplicar.
  const [nivelCategoria, setNivelCategoria] = useState<
    Record<string, { minimo: string; maximo: string }>
  >({});
  const [aplicandoCategoria, setAplicandoCategoria] = useState<string | null>(
    null,
  );

  const registroPorProduto = useMemo(() => {
    const mapa = new Map<string, EstoqueApi>();
    for (const item of estoques) {
      if (item.loja === lojaId) mapa.set(item.produto, item);
    }
    return mapa;
  }, [estoques, lojaId]);

  const linhas = useMemo(
    () =>
      produtos
        .map((produto) => {
          const registro = registroPorProduto.get(produto.id);
          // Produto que a loja ainda nao estocou aparece com a sugestao do
          // catalogo: da para definir os niveis ANTES do primeiro pedido, sem
          // esperar a linha nascer sozinha.
          const minimo =
            registro?.quantidade_minima ?? produto.estoque_minimo_sugerido ?? 1;
          const maximo =
            registro?.quantidade_maxima ??
            produto.estoque_maximo_sugerido ??
            Math.max(minimo * 3, minimo + 1);
          return {
            produto,
            registro,
            atual: registro?.quantidade_atual ?? 0,
            minimo,
            maximo,
          };
        })
        .sort((a, b) =>
          a.produto.nome_produto.localeCompare(b.produto.nome_produto),
        ),
    [produtos, registroPorProduto],
  );

  // Lista unica ficava enorme: cada categoria vira um bloco proprio (na ordem
  // do catalogo), com filtro por categoria e busca pelo nome.
  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const conhecidas = new Set(categorias.map((categoria) => categoria.id));
    const ordem = [
      ...categorias.map((categoria) => ({ id: categoria.id, nome: categoria.nome })),
      { id: "", nome: "Sem categoria" },
    ];
    return ordem
      .filter((grupo) => !categoriaFiltro || grupo.id === categoriaFiltro)
      .map((grupo) => {
        const todas = linhas.filter((linha) =>
          grupo.id
            ? linha.produto.categoria === grupo.id
            : !linha.produto.categoria || !conhecidas.has(linha.produto.categoria),
        );
        return {
          ...grupo,
          todas,
          linhas: todas.filter(
            (linha) =>
              !termo || linha.produto.nome_produto.toLowerCase().includes(termo),
          ),
        };
      })
      .filter((grupo) => grupo.linhas.length > 0);
  }, [linhas, categorias, categoriaFiltro, busca]);

  const categoriasComProduto = categorias.filter((categoria) =>
    linhas.some((linha) => linha.produto.categoria === categoria.id),
  );

  const limparRascunho = (ids: string[]) => {
    setRascunho((atual) => {
      const proximo = { ...atual };
      for (const id of ids) delete proximo[id];
      return proximo;
    });
    setErro((atual) => {
      const proximo = { ...atual };
      for (const id of ids) delete proximo[id];
      return proximo;
    });
  };

  // Grava os niveis de um produto nesta loja: atualiza a linha de estoque ou,
  // se a loja ainda nao estocou o produto, cria a linha ja com os niveis.
  const gravar = async (
    linha: (typeof linhas)[number],
    minimo: number,
    maximo: number,
  ) => {
    if (linha.registro) {
      await patchEstoque(linha.registro.id, {
        quantidade_minima: minimo,
        quantidade_maxima: maximo,
      });
    } else {
      await postEstoque({
        loja: lojaId,
        produto: linha.produto.id,
        quantidade_atual: 0,
        quantidade_minima: minimo,
        quantidade_maxima: maximo,
        estado: "NORMAL",
      });
    }
  };

  const recarregar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["estoque"] });
    await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
  };

  const salvar = async (linha: (typeof linhas)[number]) => {
    const id = linha.produto.id;
    const minimo = rascunho[id]?.minimo ?? linha.minimo;
    const maximo = rascunho[id]?.maximo ?? linha.maximo;

    // Mesma regra do back e do banco, checada aqui só para responder na hora
    // em vez de esperar o 400 da API.
    if (maximo <= minimo) {
      setErro((atual) => ({
        ...atual,
        [id]: "O máximo precisa ser maior que o mínimo.",
      }));
      return;
    }

    if (minimo === linha.minimo && maximo === linha.maximo) {
      limparRascunho([id]);
      return;
    }

    setSalvando(id);
    try {
      await gravar(linha, minimo, maximo);
      await recarregar();
      limparRascunho([id]);
      toast.success(`Níveis de ${linha.produto.nome_produto} atualizados.`);
    } catch {
      toast.error("Não foi possível salvar os níveis.");
    } finally {
      setSalvando(null);
    }
  };

  // Mesmo minimo e maximo para TODOS os produtos da categoria nesta loja
  // (inclusive os escondidos pela busca). Sobrescreve os niveis de cada um.
  const aplicarNaCategoria = async (grupo: (typeof grupos)[number]) => {
    const digitado = nivelCategoria[grupo.id];
    const minimo = Number(digitado?.minimo);
    const maximo = Number(digitado?.maximo);

    if (!digitado?.minimo || !digitado?.maximo || minimo < 0) {
      toast.error("Preencha o mínimo e o máximo da categoria.");
      return;
    }
    if (maximo <= minimo) {
      toast.error("O máximo precisa ser maior que o mínimo.");
      return;
    }

    const alvos = grupo.todas.filter(
      (linha) => linha.minimo !== minimo || linha.maximo !== maximo,
    );
    if (alvos.length === 0) {
      toast.success(`Todos os produtos de ${grupo.nome} já estão com esses níveis.`);
      return;
    }
    if (
      !confirm(
        `Aplicar mínimo ${minimo} e máximo ${maximo} a ${alvos.length} produto${alvos.length !== 1 ? "s" : ""} de ${grupo.nome} em ${nomeLoja}?`,
      )
    ) {
      return;
    }

    setAplicandoCategoria(grupo.id);
    const resultados = await Promise.allSettled(
      alvos.map((linha) => gravar(linha, minimo, maximo)),
    );
    await recarregar();
    limparRascunho(
      alvos
        .filter((_, indice) => resultados[indice].status === "fulfilled")
        .map((linha) => linha.produto.id),
    );
    setAplicandoCategoria(null);

    const falhas = resultados.filter((r) => r.status === "rejected").length;
    if (falhas > 0) {
      toast.error(
        `${falhas} de ${alvos.length} produtos de ${grupo.nome} não foram atualizados.`,
      );
    } else {
      setNivelCategoria((atual) => {
        const proximo = { ...atual };
        delete proximo[grupo.id];
        return proximo;
      });
      toast.success(`Níveis de ${grupo.nome} atualizados.`);
    }
  };

  if (linhas.length === 0) return null;

  const campo =
    "w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-center font-bold tabular-nums text-theme-text-title outline-none focus:border-blue-500";

  return (
    <section className="rounded-[28px] border border-theme-border bg-theme-card p-6 sm:p-8">
      <header className="mb-6 border-b border-theme-border pb-4">
        <span className="text-[11px] font-black uppercase tracking-[3px] text-blue-500">
          Níveis de estoque
        </span>
        <h2 className="mt-2 text-xl font-black text-theme-text-title">
          {nomeLoja}
        </h2>
        <p className="mt-1 text-sm text-theme-text-sub">
          O mínimo avisa quando falta; o máximo avisa quando sobra — produto
          parado demais estraga. Cada loja tem os próprios números. Use os
          campos da categoria para dar os mesmos níveis a todos os produtos dela.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
          className="w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-sm font-bold text-theme-text-title outline-none focus:border-blue-500 sm:flex-1"
        />
        <select
          value={categoriaFiltro}
          onChange={(event) => setCategoriaFiltro(event.target.value)}
          aria-label="Filtrar por categoria"
          className="w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-sm font-bold text-theme-text-title outline-none focus:border-blue-500 sm:w-56"
        >
          <option value="">Todas as categorias</option>
          {categoriasComProduto.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      {grupos.length === 0 && (
        <p className="py-8 text-center text-sm font-bold text-theme-text-sub">
          Nenhum produto encontrado.
        </p>
      )}

      <div className="space-y-6">
        {grupos.map((grupo) => {
          const cor = corDaCategoria(grupo.id || "sem-categoria");
          const digitado = nivelCategoria[grupo.id] ?? { minimo: "", maximo: "" };
          const aplicando = aplicandoCategoria === grupo.id;

          return (
            <div
              key={grupo.id || "sem-categoria"}
              className={`overflow-hidden rounded-2xl border ${cor.borda} bg-theme-base/40`}
            >
              <div className={`h-1.5 w-full ${cor.dot}`} />

              <div className={`flex flex-col gap-4 border-b ${cor.borda} ${cor.bg} px-4 py-4 lg:flex-row lg:items-end lg:justify-between`}>
                <div className="min-w-0">
                  <h3 className={`text-2xl font-black uppercase tracking-tight ${cor.cor}`}>
                    {grupo.nome}
                  </h3>
                  <span className="text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/70">
                    {grupo.todas.length} produto{grupo.todas.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {grupo.id && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="w-24">
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-[1px] text-theme-text-sub">
                        Mínimo
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={digitado.minimo}
                        disabled={aplicando}
                        onChange={(event) =>
                          setNivelCategoria((atual) => ({
                            ...atual,
                            [grupo.id]: { ...digitado, minimo: event.target.value },
                          }))
                        }
                        onWheel={(event) => event.currentTarget.blur()}
                        className={campo}
                      />
                    </label>
                    <label className="w-24">
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-[1px] text-theme-text-sub">
                        Máximo
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={digitado.maximo}
                        disabled={aplicando}
                        onChange={(event) =>
                          setNivelCategoria((atual) => ({
                            ...atual,
                            [grupo.id]: { ...digitado, maximo: event.target.value },
                          }))
                        }
                        onWheel={(event) => event.currentTarget.blur()}
                        className={campo}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => aplicarNaCategoria(grupo)}
                      disabled={aplicando}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-[1px] text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                    >
                      {aplicando ? "Aplicando..." : "Aplicar a todos"}
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead className="text-[11px] uppercase tracking-[1px] text-theme-text-sub">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="w-20 px-3 py-3 text-center">Atual</th>
                      <th className="w-28 px-3 py-3 text-center">Mínimo</th>
                      <th className="w-28 px-3 py-3 text-center">Máximo</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:nth-child(even)]:bg-theme-hover/60">
                    {grupo.linhas.map((linha) => {
                      const id = linha.produto.id;
                      const minimo = rascunho[id]?.minimo ?? linha.minimo;
                      const maximo = rascunho[id]?.maximo ?? linha.maximo;
                      const acima = linha.atual > maximo;
                      const abaixo = linha.atual <= minimo;
                      const bloqueado = salvando === id || aplicando;

                      return (
                        <tr key={id} className="border-t border-theme-border/60">
                          <td className="px-4 py-3">
                            <span className="font-bold text-theme-text-title">
                              {linha.produto.nome_produto}
                            </span>
                            {erro[id] && (
                              <p className="mt-1 text-xs font-bold text-red-500">
                                {erro[id]}
                              </p>
                            )}
                          </td>
                          <td
                            className={`px-3 py-3 text-center font-black tabular-nums ${
                              acima
                                ? "text-amber-600"
                                : abaixo
                                  ? "text-red-500"
                                  : "text-theme-text-sub"
                            }`}
                            title={
                              acima
                                ? "Acima do máximo"
                                : abaixo
                                  ? "No/abaixo do mínimo"
                                  : undefined
                            }
                          >
                            {linha.atual}
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min={0}
                              value={minimo}
                              disabled={bloqueado}
                              aria-label={`Mínimo de ${linha.produto.nome_produto}`}
                              onChange={(event) =>
                                setRascunho((atual) => ({
                                  ...atual,
                                  [id]: {
                                    ...atual[id],
                                    minimo: Number(event.target.value),
                                  },
                                }))
                              }
                              onBlur={() => salvar(linha)}
                              className={campo}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min={1}
                              value={maximo}
                              disabled={bloqueado}
                              aria-label={`Máximo de ${linha.produto.nome_produto}`}
                              onChange={(event) =>
                                setRascunho((atual) => ({
                                  ...atual,
                                  [id]: {
                                    ...atual[id],
                                    maximo: Number(event.target.value),
                                  },
                                }))
                              }
                              onBlur={() => salvar(linha)}
                              className={campo}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
