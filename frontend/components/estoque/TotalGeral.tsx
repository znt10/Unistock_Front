"use client";

import { type EstoqueLocal } from "@/data/estruturaEstoque";

type Props = {
  estoque: EstoqueLocal;
  lojas: { id: string; nome_loja: string }[];
  categorias: {
    categoria: string;
    produtos: readonly { id: string; nome: string }[];
  }[];
};

function baixarCsv(conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "estoque-total.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function TotalGeral({ estoque, lojas, categorias }: Props) {
  const linhas = categorias.flatMap((config) =>
    config.produtos.map((produto) => {
      const totaisPorLoja = lojas.map((loja) => ({
        lojaId: loja.id,
        loja: loja.nome_loja,
        qtd: estoque[loja.id]?.[config.categoria]?.[produto.id]?.qtd || 0,
      }));
      const total = totaisPorLoja.reduce((sum, item) => sum + item.qtd, 0);
      return { categoria: config.categoria, produto, totaisPorLoja, total };
    }),
  );

  const exportar = () => {
    const header = [
      "Categoria",
      "Produto",
      ...lojas.map((loja) => loja.nome_loja),
      "TOTAL",
    ];
    const rows = linhas.map((linha) => [
      linha.categoria,
      linha.produto.nome,
      ...linha.totaisPorLoja.map((item) => String(item.qtd)),
      String(linha.total),
    ]);
    baixarCsv([header, ...rows].map((row) => row.join(";")).join("\n"));
  };

  return (
    <section className="rounded-lg border border-theme-border bg-theme-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-theme-border px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-theme-text-title">
            Todas as lojas
          </h2>
          <p className="text-sm text-theme-text-sub">
            Totais consolidados por produto.
          </p>
        </div>
        <button
          type="button"
          onClick={exportar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[1px] text-white transition hover:bg-blue-700"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-theme-header text-[11px] uppercase tracking-[1px] text-theme-text-sub">
            <tr>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Produto</th>
              {lojas.map((loja) => (
                <th key={loja.id} className="px-4 py-2">
                  {loja.nome_loja}
                </th>
              ))}
              <th className="px-4 py-2">TOTAL</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-theme-hover/60">
            {linhas.map((linha) => (
              <tr
                key={`${linha.categoria}-${linha.produto.id}`}
                className="border-b border-theme-border"
              >
                <td className="px-4 py-2 text-xs font-bold text-theme-text-sub">
                  {linha.categoria}
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-theme-text-title">
                  {linha.produto.nome}
                </td>
                {linha.totaisPorLoja.map((item) => (
                  <td
                    key={item.lojaId}
                    className="px-4 py-2 text-sm font-bold text-theme-text-sub"
                  >
                    {item.qtd}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm font-black text-blue-600">
                  {linha.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
