import { apiFetch, apiV1 } from "@/shared/services/api";


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
