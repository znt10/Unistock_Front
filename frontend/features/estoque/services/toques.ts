import { apiV1 } from "@/shared/services/api";

// Comeca com "estoque": a atualizacao ao vivo (SincronizarAoVivo) invalida
// sozinha tudo que comeca assim quando o estoque muda em outro aparelho.
export const MINHA_LOJA_QUERY_KEY = ["estoque", "minha-loja"] as const;

export type ItemDaLoja = {
  produto: string;
  produto_nome: string;
  categoria: string;
  categoria_ordem: number;
  quantidade: number;
  // Total produzido hoje: numero na fabrica, null nas lojas.
  hoje: number | null;
};

export type MinhaLoja = {
  loja: { id: string; nome: string; fabrica: boolean };
  itens: ItemDaLoja[];
};

export type RespostaDoToque = {
  toque: string;
  produto: string;
  quantidade: number;
  significado: "PRODUCAO" | "CORRECAO" | "FIM_DE_CAIXA";
  caixa: { numero: number; total: number } | null;
};

// Toques ainda indo ao servidor. Uma leitura da tela que comecasse agora
// poderia trazer um numero velho (ou ja com o toque, antes da resposta dele):
// por isso ela espera todos os toques terminarem antes de consultar.
let emVoo = 0;
export const toqueComecou = () => {
  emVoo += 1;
};
export const toqueTerminou = () => {
  emVoo -= 1;
};

// Em erro o apiV1 lanca ApiError (subclasse de Error) com a mensagem do servidor.
export const getMinhaLoja = async (signal?: AbortSignal) => {
  // Cancelada (cancelQueries): para de esperar e nao chega a enviar o GET.
  const cancelada = () => new DOMException("Aborted", "AbortError");
  while (emVoo > 0) {
    if (signal?.aborted) throw cancelada();
    await new Promise((r) => setTimeout(r, 50));
  }
  if (signal?.aborted) throw cancelada();
  const res = await apiV1("/estoque/minha-loja/", { method: "GET", signal });
  return (await res.json()) as MinhaLoja;
};

// Mesmas opcoes nos dois lugares que leem a loja (EstoqueDaLoja e Lista).
export const minhaLojaQuery = {
  queryKey: MINHA_LOJA_QUERY_KEY,
  queryFn: ({ signal }: { signal: AbortSignal }) => getMinhaLoja(signal),
};

export const tocar = async (loja: string, produto: string, delta: 1 | -1) => {
  const res = await apiV1("/estoque/tocar/", {
    method: "POST",
    body: JSON.stringify({ loja, produto, delta }),
  });
  return (await res.json()) as RespostaDoToque;
};

export const desfazerToque = async (id: string) => {
  const res = await apiV1(`/toques/${id}/desfazer/`, { method: "POST" });
  return (await res.json()) as { produto: string; quantidade: number };
};
