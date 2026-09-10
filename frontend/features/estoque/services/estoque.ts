import { apiV1 } from "@/shared/services/api";


// ======================================================
// 🔹 ESTOQUE
// ======================================================

export type EstoqueApi = {
  id: string;
  produto: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  estado: "NORMAL" | "CONGELADO" | "RESFRIADO";
  atualizado_em?: string;
};

export type EstoquePayload = {
  produto: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
  // Obrigatorio e sempre maior que o minimo — o back recusa com 400 e o banco
  // tem CheckConstraint. Teto por LOJA: a Lapa gira mais que a Casa Verde.
  quantidade_maxima: number;
  estado: "NORMAL" | "CONGELADO" | "RESFRIADO";
};

// Produtos no/abaixo do minimo. O back ja escopa: gerente ve todas as lojas,
// responsavel so as dele.
export type EstoqueBaixo = {
  id: string;
  loja_id: string;
  loja_nome: string;
  produto_nome: string;
  unidade_medida: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
};

export const getEstoquesBaixos = async () => {
  const res = await apiV1("/estoque/baixos/", { method: "GET" });
  if (!res.ok) throw new Error("Erro ao carregar estoque baixo");
  return (await res.json()) as EstoqueBaixo[];
};

// Produtos ACIMA do maximo. Mesmo formato da falta de proposito: a tela mostra
// as duas listas com as mesmas colunas.
export const getEstoquesExcedidos = async () => {
  const res = await apiV1("/estoque/excedidos/", { method: "GET" });
  if (!res.ok) throw new Error("Erro ao carregar excesso de estoque");
  return (await res.json()) as EstoqueBaixo[];
};

export const getEstoques = async () => {
  const estoques: EstoqueApi[] = [];

  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await apiV1(`/estoque/?page=${page}`, {
      method: "GET",
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      return data as EstoqueApi[];
    }

    estoques.push(...((data.results ?? []) as EstoqueApi[]));

    hasNext = Boolean(data.next);
    page += 1;
  }

  return estoques;
};

export const postEstoque = async (
  payload: EstoquePayload,
) => {
  const res = await apiV1("/estoque/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const patchEstoque = async (
  id: string,
  payload: Partial<EstoquePayload>,
) => {
  const res = await apiV1(`/estoque/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return res.json();
};


// ======================================================
// 🔹 MOVIMENTACOES DE ESTOQUE (historico auditavel)
// ======================================================

export type MovimentacaoEstoque = {
  id: string;
  tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE" | "VENDA_PDV";
  produto_nome: string;
  loja_origem_id: string | null;
  loja_destino_id: string | null;
  loja_origem_nome: string | null;
  loja_destino_nome: string | null;
  quantidade: number;
  usuario_nome: string | null;
  data: string;
};

export const getMovimentacoes = async (lojaId?: string) => {
  // Primeira pagina (50 mais recentes) — suficiente para a tela de historico.
  const query = lojaId ? `?loja=${lojaId}` : "";
  const res = await apiV1(`/movimentacoes/${query}`, { method: "GET" });
  const data = await res.json();
  return (data.results ?? data) as MovimentacaoEstoque[];
};
