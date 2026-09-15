"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import BarraLojas from "@/features/estoque/components/BarraLojas";
import {
  carregarPdfNaAba,
  getDisponivel,
  imprimirEtiquetas,
} from "@/features/fabrica/services/fabrica";
import { useLojas } from "@/features/lojas/hooks/useLoja";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";

const DISPONIVEL_QUERY_KEY = ["fabrica", "disponivel"] as const;

export default function FilaDaFabricaPage() {
  const queryClient = useQueryClient();
  const { data: todasAsLojas = [] } = useLojas();
  const lojas = useMemo(
    () => todasAsLojas.filter((loja) => loja.tipo !== "Fabrica" && loja.ativo),
    [todasAsLojas],
  );
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const lojaAtiva = lojaSelecionada || lojas[0]?.id || "";

  // Todos os pendentes da fabrica numa chamada so: o resumo do topo soma todas
  // as lojas, e a tabela filtra a loja escolhida sem ir de novo na API.
  const { data: pendentes = [], isLoading } = usePedidos({
    status: "PENDENTE",
    da_fabrica: true,
  });
  const { data: disponivel = [] } = useQuery({
    queryKey: DISPONIVEL_QUERY_KEY,
    queryFn: getDisponivel,
  });

  const [marcados, setMarcados] = useState<string[]>([]);
  const [imprimindo, setImprimindo] = useState(false);

  const disponivelPorProduto = useMemo(
    () => new Map(disponivel.map((linha) => [linha.produto, linha.disponivel])),
    [disponivel],
  );

  const resumo = useMemo(() => {
    const caixasPorProduto = new Map<string, number>();
    for (const pedido of pendentes) {
      const item = pedido.itens?.[0];
      if (!item) continue;
      const nome = item.produto_nome ?? "—";
      caixasPorProduto.set(nome, (caixasPorProduto.get(nome) ?? 0) + item.quantidade);
    }
    return [...caixasPorProduto.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [pendentes]);

  const modoTodas = lojaAtiva === "TODAS";

  // No modo "Todas as lojas" lista a fila inteira; senao, filtra pela loja
  // escolhida (ver ruling: "TODAS" nao pode bater com nenhuma loja real).
  const pedidosDaLoja = useMemo(
    () =>
      modoTodas ? pendentes : pendentes.filter((pedido) => pedido.loja === lojaAtiva),
    [pendentes, lojaAtiva, modoTodas],
  );

  const colunas = modoTodas ? 7 : 6;

  const todosMarcados =
    pedidosDaLoja.length > 0 &&
    pedidosDaLoja.every((pedido) => marcados.includes(pedido.id));

  const trocarLoja = (id: string) => {
    setLojaSelecionada(id);
    setMarcados([]);
  };

  const alternar = (id: string) =>
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((marcado) => marcado !== id) : [...atual, id],
    );

  const alternarTodos = () =>
    setMarcados(todosMarcados ? [] : pedidosDaLoja.map((pedido) => pedido.id));

  const imprimir = async () => {
    if (marcados.length === 0 || imprimindo) return;
    // Aberta no clique, antes de qualquer await (ver carregarPdfNaAba).
    const aba = window.open("", "_blank");
    setImprimindo(true);
    try {
      const resultado = await imprimirEtiquetas(marcados);
      for (const recusa of resultado.recusados) {
        toast.error(`Pedido #${recusa.numero ?? "?"}: ${recusa.motivo}`);
      }
      if (resultado.impressos.length > 0) {
        await carregarPdfNaAba(
          aba,
          resultado.impressos.map((impresso) => impresso.pedido),
        );
        toast.success(`Etiquetas de ${resultado.impressos.length} pedido(s) prontas.`);
      } else {
        aba?.close();
      }
      setMarcados([]);
    } catch (erro) {
      aba?.close();
      toast.error(erro instanceof Error ? erro.message : "Erro ao imprimir etiquetas.");
    } finally {
      setImprimindo(false);
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      await queryClient.invalidateQueries({ queryKey: DISPONIVEL_QUERY_KEY });
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
              Fábrica
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              Fila de pedidos
            </h1>
            <p className="mt-3 font-medium text-theme-text-sub/60">
              Escolha a loja, marque os pedidos e imprima as etiquetas.
            </p>
          </header>

          <section className="rounded-[24px] border border-theme-border bg-theme-card p-5">
            <h2 className="mb-3 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
              A separar (todas as lojas)
            </h2>
            {resumo.length === 0 ? (
              <p className="text-sm">Nenhum pedido pendente.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {resumo.map(([produto, caixas]) => (
                  <li
                    key={produto}
                    className="rounded-xl border border-theme-border bg-theme-header px-3 py-2 text-sm font-bold text-theme-text-title"
                  >
                    {produto}: {caixas} {caixas === 1 ? "caixa" : "caixas"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BarraLojas
            lojaAtiva={lojaAtiva}
            lojas={lojas}
            onChange={trocarLoja}
            notificacoesExternas={0}
            mostrarTodas={true}
          />

          <section className="overflow-hidden rounded-[24px] border border-theme-border bg-theme-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-header/50 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                    <th className="p-4">
                      <input
                        type="checkbox"
                        aria-label="Marcar todos"
                        checked={todosMarcados}
                        onChange={alternarTodos}
                      />
                    </th>
                    <th className="p-4">Pedido</th>
                    {modoTodas && <th className="p-4">Loja</th>}
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-center">Caixas</th>
                    <th className="p-4 text-center">Disponível</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={colunas} className="p-8 text-center">
                        Carregando...
                      </td>
                    </tr>
                  ) : pedidosDaLoja.length === 0 ? (
                    <tr>
                      <td colSpan={colunas} className="p-8 text-center">
                        {modoTodas
                          ? "Nenhum pedido pendente."
                          : "Nenhum pedido pendente desta loja."}
                      </td>
                    </tr>
                  ) : (
                    pedidosDaLoja.map((pedido) => {
                      const item = pedido.itens?.[0];
                      const livre = item ? (disponivelPorProduto.get(item.produto) ?? 0) : 0;
                      const falta = item ? item.quantidade > livre : false;
                      return (
                        <tr key={pedido.id} className="hover:bg-theme-hover">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              aria-label={`Marcar pedido ${pedido.numero}`}
                              checked={marcados.includes(pedido.id)}
                              onChange={() => alternar(pedido.id)}
                            />
                          </td>
                          <td className="p-4 font-mono font-black text-theme-text-title">
                            #{pedido.numero}
                          </td>
                          {modoTodas && (
                            <td className="p-4 text-sm font-bold text-theme-text-sub">
                              {pedido.loja_nome ?? "—"}
                            </td>
                          )}
                          <td className="p-4 font-black uppercase text-theme-text-title">
                            {item?.produto_nome ?? "—"}
                          </td>
                          <td className="p-4 text-center font-mono text-lg font-black text-blue-500">
                            {item?.quantidade ?? "—"}
                          </td>
                          <td
                            className={`p-4 text-center font-mono font-black ${
                              falta ? "text-red-500" : "text-green-500"
                            }`}
                          >
                            {livre}
                          </td>
                          <td className="p-4 text-sm">
                            {pedido.data ? pedido.data.split("-").reverse().join("/") : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button
            type="button"
            onClick={imprimir}
            disabled={imprimindo || marcados.length === 0}
            className="w-full rounded-2xl bg-blue-600 py-4 text-[12px] font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {imprimindo ? "Imprimindo..." : `Imprimir etiquetas (${marcados.length})`}
          </button>
        </div>
      </main>
    </div>
  );
}
