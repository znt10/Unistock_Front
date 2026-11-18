"use client";

import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import BotaoMaisMenos from "@/features/estoque/components/BotaoMaisMenos";
import FaixaDoToque from "@/features/estoque/components/FaixaDoToque";
import { useToques } from "@/features/estoque/hooks/useToques";
import { type MinhaLoja, minhaLojaQuery } from "@/features/estoque/services/toques";

function Lista({ dados }: { dados: MinhaLoja }) {
  // Le o cache aqui (nao so pelo pai): o numero e a retirada do delta pendente
  // precisam ser lidos na mesma renderizacao (ver tirarPendente em useToques).
  const { data = dados } = useQuery(minhaLojaQuery);
  const { loja, itens } = data;
  const { pendentes, tocarItem, faixa, desfazer, fecharFaixa } = useToques(loja.id);

  // O servidor ja manda os itens na ordem; so agrupa por categoria.
  const grupos: { categoria: string; itens: typeof itens }[] = [];
  for (const item of itens) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.categoria === item.categoria) ultimo.itens.push(item);
    else grupos.push({ categoria: item.categoria, itens: [item] });
  }

  return (
    <>
      <header className="px-5 pb-2 pt-6 md:px-8">
        <h1 className="break-words text-3xl font-black uppercase tracking-tight text-theme-text-title">
          {loja.fabrica ? "Produção do dia" : "Estoque"}
        </h1>
        <p className="mt-1 text-sm font-medium text-theme-text-sub">{loja.nome}</p>
      </header>

      <div className="space-y-6 px-5 py-4 md:px-8">
        {grupos.map((grupo) => (
          <section key={grupo.categoria}>
            <h2 className="mb-2 text-xs font-black uppercase tracking-[3px] text-blue-500">
              {grupo.categoria}
            </h2>
            <ul className="space-y-2">
              {grupo.itens.map((item) => {
                const valor = item.quantidade + (pendentes[item.produto] ?? 0);
                return (
                  <li
                    key={item.produto}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-theme-border bg-theme-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-base font-black leading-tight text-theme-text-title">
                        {item.produto_nome}
                      </p>
                      {item.hoje !== null && item.hoje > 0 && (
                        <p className="mt-1 text-xs font-bold text-theme-text-sub">
                          hoje +{item.hoje}
                        </p>
                      )}
                    </div>
                    <BotaoMaisMenos
                      valor={valor}
                      onMenos={() => tocarItem(item, -1)}
                      onMais={() => tocarItem(item, 1)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-4 z-30 px-5 lg:left-64">
        <FaixaDoToque faixa={faixa} onDesfazer={desfazer} onFechar={fecharFaixa} />
      </div>
    </>
  );
}

export default function EstoqueDaLoja() {
  const { data, error, isPending } = useQuery(minhaLojaQuery);

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-base pb-24 font-sans text-theme-text-sub">
      <Sidebar />
      <main className="min-w-0 pt-16 lg:ml-64 lg:pt-0">
        {data ? (
          <Lista dados={data} />
        ) : (
          <p className="p-8 text-center text-base font-bold text-theme-text-sub">
            {isPending ? "Carregando..." : error instanceof Error ? error.message : "Erro ao carregar."}
          </p>
        )}
      </main>
    </div>
  );
}
