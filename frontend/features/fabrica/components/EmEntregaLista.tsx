"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { carregarPdfNaAba } from "@/features/fabrica/services/fabrica";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";

// lojaId null = modo "Todas": mostra todas as lojas, com a coluna Loja.
export default function EmEntregaLista({ lojaId }: { lojaId: string | null }) {
  const { data: pedidos = [], isLoading } = usePedidos({
    status: "EM_ENTREGA",
    da_fabrica: true,
  });
  const [reimprimindo, setReimprimindo] = useState<string | null>(null);
  const modoTodas = lojaId === null;
  const colunas = modoTodas ? 6 : 5;

  // Mais antigos primeiro: o que esta a caminho ha mais tempo e o que mais
  // provavelmente ficou para tras.
  const ordenados = useMemo(
    () =>
      pedidos
        .filter((pedido) => modoTodas || pedido.loja === lojaId)
        .sort((a, b) =>
          `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`),
        ),
    [pedidos, lojaId, modoTodas],
  );

  const reimprimir = async (pedidoId: string) => {
    // Aberta no clique, antes de qualquer await (ver carregarPdfNaAba).
    const aba = window.open("", "_blank");
    setReimprimindo(pedidoId);
    try {
      await carregarPdfNaAba(aba, [pedidoId]);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao reimprimir.");
    } finally {
      setReimprimindo(null);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
        Em entrega
      </h2>
      <section className="overflow-hidden rounded-[24px] border border-theme-border bg-theme-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-theme-border bg-theme-header/50 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
                {modoTodas && <th className="p-4">Loja</th>}
                <th className="p-4">Pedido</th>
                <th className="p-4">Produto</th>
                <th className="p-4 text-center">Chegaram</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {isLoading ? (
                <tr>
                  <td colSpan={colunas} className="p-8 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : ordenados.length === 0 ? (
                <tr>
                  <td colSpan={colunas} className="p-8 text-center">
                    {modoTodas
                      ? "Nenhum pedido em entrega."
                      : "Nenhum pedido em entrega para esta loja."}
                  </td>
                </tr>
              ) : (
                ordenados.map((pedido) => {
                  const completo =
                    pedido.caixas_chegaram >= pedido.caixas_total;
                  return (
                    <tr key={pedido.id} className="hover:bg-theme-hover">
                      {modoTodas && (
                        <td className="p-4 font-black uppercase text-theme-text-title">
                          {pedido.loja_nome ?? "—"}
                        </td>
                      )}
                      <td className="p-4 font-mono font-black text-theme-text-title">
                        #{pedido.numero}
                      </td>
                      <td className="p-4 font-bold uppercase">
                        {pedido.itens?.[0]?.produto_nome ?? "—"}
                      </td>
                      <td className="p-4 text-center font-mono text-lg font-black text-blue-500">
                        {pedido.caixas_chegaram} de {pedido.caixas_total}
                      </td>
                      <td className="p-4 text-sm">
                        {pedido.data
                          ? pedido.data.split("-").reverse().join("/")
                          : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => reimprimir(pedido.id)}
                          disabled={completo || reimprimindo === pedido.id}
                          className="rounded-xl border border-theme-border bg-theme-header px-3 py-2 text-[10px] font-black uppercase tracking-[1px] text-theme-text-title transition hover:border-blue-500/40 hover:text-blue-500 disabled:opacity-50"
                        >
                          {reimprimindo === pedido.id
                            ? "Abrindo..."
                            : "Reimprimir"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
