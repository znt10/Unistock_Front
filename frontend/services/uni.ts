import { apiFetch, apiV1, } from "./api";


// 🔹 LOJAS
// services/uni.ts
export const getLoja= async () => {
  const res = await apiV1("/lojas/", { method: "GET" });
  const data = await res.json();
  return data;
};

// 🔹 PRODUTOS

export const getProdutos = async () => {
  const produtos: unknown[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await apiV1(`/produtos/?page=${page}`, {
      method: 'GET',
    });
    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    }

    produtos.push(...(data.results ?? []));
    hasNext = Boolean(data.next);
    page += 1;
  }

  return produtos;
};

export type EstoqueApi = {
  id: string;
  produto: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
  estado: "NORMAL" | "CONGELADO" | "RESFRIADO";
  atualizado_em?: string;
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

export const postProduto = async (
  nome_produto: string,
  codigo: string,
  unidade_medida: string,
  categoria: string,
  ativo = true,
) => {
  const res = await apiV1('/produtos/', {
    method: 'POST',
    body: JSON.stringify({
      nome_produto,
      codigo,
      unidade_medida,
      categoria,
      ativo,
    }),
  });

  return res.json();
};

// 🔹 TIPOS
export type ItemPedido = {
  produto: string;
  quantidade: number;
};

export type PedidoData = {
  loja: string;
  descricao: string;
  itens: ItemPedido[];
};

// 🔹 PEDIDO
export const postPedido = async (pedidoData: PedidoData) => {
  const res = await apiV1('/pedidos/', {
    method: 'POST',
    body: JSON.stringify(pedidoData),
  });

  return res.json();
};

export const getPedidos = async (filters?: {
  status?: string;
  data?: string;
  loja?: string;
}) => {

  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }

  if (filters?.data) {
    params.append("data", filters.data);
  } 

  if (filters?.loja) {
    params.append("loja", filters.loja);
  }

  const query = params.toString();
  const res = await apiV1(
    `/pedidos/${query ? `?${query}` : ""}`,
    {
      method: "GET",
    }
  );

  return res.json();
};

export type Notificacao = {
  id: string;
  pedido: string | null;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criada_em: string;
};

export const getNotificacoes = async () => {
  const res = await apiV1('/notificacoes/', {
    method: 'GET',
  });
  const data = await res.json();
  return (data.results ?? data) as Notificacao[];
};

export const marcarNotificacaoLida = async (id: string) => {
  const res = await apiV1(`/notificacoes/${id}/marcar-lida/`, {
    method: 'PATCH',
  });
  return res.json();
};

export const patchPedidoStatus = async (
  id: string,
  status: "PENDENTE" | "ENTREGUE" | "CANCELADO",
) => {
  const res = await apiV1(`/pedidos/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return res.json();
};

export const marcarTodasNotificacoesLidas = async () => {
  const res = await apiV1('/notificacoes/todas-lidas/', {
    method: 'PATCH',
  });
  return res.json();
};

export const excluirNotificacao = async (id: string) => {
  const res = await apiV1(`/notificacoes/${id}/`, {
    method: 'DELETE',
  });
  return res.ok;
};

export const limparNotificacoes = async () => {
  const res = await apiV1('/notificacoes/limpar/', {
    method: 'DELETE',
  });
  return res.ok;
};


// 🔹 RELATÓRIO (PDF)
// services/uni.ts — antes

// depois
export const getRelatorio = async (periodo: "dia" | "semana" | "mes" = "dia") => {
  const response = await apiFetch(`/gerar_pdf/?periodo=${periodo}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    let errorText;

    try {
      errorText = await response.text(); // tenta pegar erro do Django
    } catch {
      errorText = "Não foi possível ler resposta do servidor";
    }

    console.error("Status:", response.status);
    console.error("Resposta:", errorText);

    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.blob();
};


export const postLoja = async (nome_loja: string, tipo: string, cidade: string, endereco: string) => {
    const res = await apiV1('/lojas/', {
        method: 'POST',
        body: JSON.stringify({
            nome_loja,
            tipo,
            cidade,
            endereco,
        }),
    });
    return res.json();
};

export type LojaUpdateData = Partial<{
    responsavel: number | null;
    nome_loja: string;
    tipo: string;
    cidade: string;
    endereco: string;
    ativo: boolean;
}>;

export const patchLoja = async (id: number | string, data: LojaUpdateData) => {
    const res = await apiV1(`/lojas/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return res.json();
};

export type UsuarioResumo = {
  id: number;
  first_name: string;
  email: string;
};

export const getUsuarios = async () => {
  const res = await apiV1('/user/', {
    method: 'GET',
  });
  const data = await res.json();
  return (data.results ?? data) as UsuarioResumo[];
};

// No seu arquivo de API (ex: services/api.ts)

export const getLojaById = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error("Erro ao buscar detalhes da loja");
  return res.json();
};

export const deleteLoja = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: 'DELETE',
  });
  return res.ok;
};
