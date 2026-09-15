import { ApiError, apiFetch, apiV1 } from "@/shared/services/api";

export type PedidoStatus = "PENDENTE" | "EM_ENTREGA" | "ENTREGUE" | "CANCELADO";

// ======================================================
// 🔹 PEDIDOS
// ======================================================

export type ItemPedido = {
  produto: string;
  quantidade: number;
};

export type PedidoData = {
  loja: string;
  descricao: string;
  itens: ItemPedido[];
  // Resposta ao aviso de teto: reenviar com true registra o pedido mesmo
  // deixando a loja acima do maximo.
  confirmar_excesso?: boolean;
};

/** Um item do pedido que passaria do maximo da loja (corpo do 409). */
export type AvisoDeExcesso = {
  produto: string;
  atual: number;
  pedido: number;
  resultante: number;
  maximo: number;
  /** Quanto ainda caberia — o numero para corrigir sem fazer conta. */
  cabe: number;
};

export const excessoDoErro = (erro: unknown): AvisoDeExcesso[] | null => {
  if (!(erro instanceof ApiError) || erro.status !== 409) return null;
  const corpo = erro.data as { excesso?: AvisoDeExcesso[] } | null;
  return corpo?.excesso ?? null;
};

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
  da_fabrica?: boolean;
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

  if (filters?.da_fabrica !== undefined) {
    params.append("da_fabrica", String(filters.da_fabrica));
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
  status: PedidoStatus,
) => {
  const res = await apiV1(`/pedidos/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return res.json();
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
