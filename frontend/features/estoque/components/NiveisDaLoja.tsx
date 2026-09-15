"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useProdutos } from "@/features/produtos/hooks/useProduto";
import { useCategorias } from "@/features/produtos/hooks/useCategorias";
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

  // Lista unica ficava enorme: agrupa por categoria (na ordem do catalogo) e
  // deixa filtrar por categoria e buscar pelo nome.
  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const visiveis = linhas.filter(
      (linha) =>
        (!categoriaFiltro || linha.produto.categoria === categoriaFiltro) &&
        (!termo || linha.produto.nome_produto.toLowerCase().includes(termo)),
    );
    const ordem = [
      ...categorias.map((categoria) => ({ id: categoria.id, nome: categoria.nome })),
      { id: "", nome: "Sem categoria" },
    ];
    const conhecidas = new Set(categorias.map((categoria) => categoria.id));
    return ordem
      .map((grupo) => ({
        ...grupo,
        linhas: visiveis.filter((linha) =>
          grupo.id
            ? linha.produto.categoria === grupo.id
            : !linha.produto.categoria || !conhecidas.has(linha.produto.categoria),
        ),
      }))
      .filter((grupo) => grupo.linhas.length > 0);
  }, [linhas, categorias, categoriaFiltro, busca]);

  const categoriasComProduto = categorias.filter((categoria) =>
    linhas.some((linha) => linha.produto.categoria === categoria.id),
  );

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

    setErro((atual) => {
      const proximo = { ...atual };
      delete proximo[id];
      return proximo;
    });

    if (minimo === linha.minimo && maximo === linha.maximo) return;

    setSalvando(id);
    try {
      if (linha.registro) {
        await patchEstoque(linha.registro.id, {
          quantidade_minima: minimo,
          quantidade_maxima: maximo,
        });
      } else {
        await postEstoque({
          loja: lojaId,
          produto: id,
          quantidade_atual: 0,
          quantidade_minima: minimo,
          quantidade_maxima: maximo,
          estado: "NORMAL",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      setRascunho((atual) => {
        const proximo = { ...atual };
        delete proximo[id];
        return proximo;
      });
      toast.success(`Níveis de ${linha.produto.nome_produto} atualizados.`);
    } catch {
      toast.error("Não foi possível salvar os níveis.");
    } finally {
      setSalvando(null);
    }
  };

  if (linhas.length === 0) return null;

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
          parado demais estraga. Cada loja tem os próprios números.
        </p>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead className="bg-theme-header text-[11px] uppercase tracking-[1px] text-theme-text-sub">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-3 py-3 w-20 text-center">Atual</th>
              <th className="px-3 py-3 w-28 text-center">Mínimo</th>
              <th className="px-3 py-3 w-28 text-center">Máximo</th>
            </tr>
          </thead>
          <tbody>
            {grupos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm font-bold text-theme-text-sub">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {grupos.map((grupo) => (
              <React.Fragment key={grupo.id || "sem-categoria"}>
                <tr className="bg-theme-header/60">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-[2px] text-blue-500"
                  >
                    {grupo.nome}
                  </td>
                </tr>
                {grupo.linhas.map((linha) => {
                  const id = linha.produto.id;
                  const minimo = rascunho[id]?.minimo ?? linha.minimo;
                  const maximo = rascunho[id]?.maximo ?? linha.maximo;
                  const acima = linha.atual > maximo;
                  const abaixo = linha.atual <= minimo;

                  return (
                    <tr key={id} className="border-b border-theme-border/60">
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
                          disabled={salvando === id}
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
                          className="w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-center font-bold tabular-nums text-theme-text-title outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={1}
                          value={maximo}
                          disabled={salvando === id}
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
                          className="w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-center font-bold tabular-nums text-theme-text-title outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
