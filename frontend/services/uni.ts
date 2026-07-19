import { apiFetch, apiV1 } from "./api";


// ======================================================
// 🔹 TYPES
// ======================================================

// 🔹 ESTOQUE
export type EstoqueApi = {
  id: string;
  produto: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
  estado: "NORMAL" | "CONGELADO" | "RESFRIADO";
  atualizado_em?: string;
};

export type EstoquePayload = {
  produto: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
  estado: "NORMAL" | "CONGELADO" | "RESFRIADO";
};

// 🔹 PEDIDOS
export type ItemPedido = {
  produto: string;
  quantidade: number;
};

export type PedidoData = {
  loja: string;
  descricao: string;
  itens: ItemPedido[];
};

// 🔹 NOTIFICAÇÕES
export type Notificacao = {
  id: string;
  pedido: string | null;
  loja_id: string | null;
  loja_nome: string | null;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criada_em: string;
};

// 🔹 LOJAS
export type LojaUpdateData = Partial<{
  responsavel: number | null;
  nome_loja: string;
  tipo: string;
  cidade: string;
  endereco: string;
  ativo: boolean;
  email: string;
  telefone_whatsapp: string;
}>;

// 🔹 USUÁRIOS
export type UsuarioResumo = {
  id: number;
  first_name: string;
  email: string;
};


// ======================================================
// 🔹 LOJAS
// ======================================================

export const getLoja = async () => {
  const res = await apiV1("/lojas/", {
    method: "GET",
  });

  const data = await res.json();
  // Compatível com resposta paginada do DRF e com array cru.
  return data.results ?? data;
};

export const postLoja = async (
  nome_loja: string,
  tipo: string,
  cidade: string,
  endereco: string,
  email?: string,
  telefone_whatsapp?: string,
) => {
  const res = await apiV1("/lojas/", {
    method: "POST",
    body: JSON.stringify({
      nome_loja,
      tipo,
      cidade,
      endereco,
      email: email || null,
      telefone_whatsapp: telefone_whatsapp || null,
    }),
  });

  return res.json();
};

export const patchLoja = async (
  id: number | string,
  data: LojaUpdateData,
) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getLojaById = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar detalhes da loja");
  }

  return res.json();
};

export const deleteLoja = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "DELETE",
  });

  return res.ok;
};


// ======================================================
// 🔹 PRODUTOS
// ======================================================

export const getProdutos = async () => {
  const produtos: unknown[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await apiV1(`/produtos/?page=${page}`, {
      method: "GET",
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

export const postProduto = async (
  nome_produto: string,
  categoria: string,
  quantidade_por_embalagem?: number | null,
  estoque_minimo_sugerido = 1,
) => {
  const res = await apiV1("/produtos/", {
    method: "POST",
    body: JSON.stringify({
      nome_produto,
      unidade_medida: "UNIDADE",
      quantidade_por_embalagem,
      estoque_minimo_sugerido,
      categoria,
    }),
  });

  return res.json();
};

export const patchProduto = async (
  id: string,
  payload: Partial<{
    unidade_medida: string;
    quantidade_por_embalagem: number | null;
    estoque_minimo_sugerido: number;
    categoria: string;
    nome_produto: string;
  }>,
) => {
  const res = await apiV1(`/produtos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const deleteProduto = async (id: string) => {
  await apiV1(`/produtos/${id}/`, { method: "DELETE" });
};


// ======================================================
// 🔹 ESTOQUE
// ======================================================

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
// 🔹 PEDIDOS
// ======================================================

export const postPedido = async (
  pedidoData: PedidoData,
) => {
  const res = await apiV1("/pedidos/", {
    method: "POST",
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

  const pedidos: unknown[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    params.set("page", String(page));

    const res = await apiV1(`/pedidos/?${params.toString()}`, {
      method: "GET",
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    }

    pedidos.push(...(data.results ?? []));
    hasNext = Boolean(data.next);

    page += 1;
  }

  return pedidos;
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


// ======================================================
// 🔹 NOTIFICAÇÕES
// ======================================================

export const getNotificacoes = async () => {
  const res = await apiV1("/notificacoes/", {
    method: "GET",
  });

  const data = await res.json();

  return (data.results ?? data) as Notificacao[];
};

export const marcarNotificacaoLida = async (
  id: string,
) => {
  const res = await apiV1(
    `/notificacoes/${id}/marcar-lida/`,
    {
      method: "PATCH",
    }
  );

  return res.json();
};

export const marcarTodasNotificacoesLidas = async () => {
  const res = await apiV1("/notificacoes/todas-lidas/", {
    method: "PATCH",
  });

  return res.json();
};

export const excluirNotificacao = async (
  id: string,
) => {
  const res = await apiV1(`/notificacoes/${id}/`, {
    method: "DELETE",
  });

  return res.ok;
};

export const limparNotificacoes = async () => {
  const res = await apiV1("/notificacoes/limpar/", {
    method: "DELETE",
  });

  return res.ok;
};


// ======================================================
// 🔹 RELATÓRIOS
// ======================================================

export const getRelatorio = async (
  periodo: "dia" | "semana" | "mes" = "dia",
) => {
  const response = await apiFetch(
    `/gerar_pdf/?periodo=${periodo}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    let errorText;

    try {
      errorText = await response.text();
    } catch {
      errorText = "Não foi possível ler resposta do servidor";
    }

    console.error("Status:", response.status);
    console.error("Resposta:", errorText);

    throw new Error(
      `Erro ${response.status}: ${errorText}`
    );
  }

  return response.blob();
};


// ======================================================
// 🔹 USUÁRIOS
// ======================================================

export const getUsuarios = async () => {
  const res = await apiV1("/user/", {
    method: "GET",
  });

  const data = await res.json();

  return (data.results ?? data) as UsuarioResumo[];
};


// ======================================================
// 🔹 PREFERENCIAS DE NOTIFICACAO
// ======================================================

export type PreferenciaNotificacao = {
  email_ativo: boolean;
  whatsapp_ativo: boolean;
  telefone_whatsapp: string;
  digest_ativo: boolean;
  digest_horario: string; // "HH:MM:SS"
  digest_dias_semana: string; // "1,2,3" (1=segunda ... 7=domingo)
};

export const getPreferenciasNotificacao = async () => {
  const res = await apiV1("/preferencias-notificacao/me/", { method: "GET" });
  return (await res.json()) as PreferenciaNotificacao;
};

export const updatePreferenciasNotificacao = async (
  data: Partial<PreferenciaNotificacao>,
) => {
  const res = await apiV1("/preferencias-notificacao/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return (await res.json()) as PreferenciaNotificacao;
};
