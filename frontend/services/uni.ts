import { apiFetch, apiV1, } from "./api";


// 🔹 LOJAS
export const getLoja = async () => {
  const res = await apiV1('/lojas/', {
    method: 'GET',
  });

  return res.json();
};

// 🔹 PRODUTOS

export const getProdutos = async () => {
  const res = await apiV1('/produtos/', {
    method: 'GET',
  });

  return res.json();
};

// 🔹 TIPOS
export type ItemPedido = {
  produto: number;
  quantidade: number;
};

export type PedidoData = {
  loja: number;
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

export const getPedidos = async () => {
  const res = await apiV1('/pedidos/', {
    method: 'GET',
  });
return res.json();
};


// 🔹 RELATÓRIO (PDF)
export const getRelatorio = async () => {
  const response = await apiFetch(`/gerar_pdf/`, {
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

export const patchLoja = async (id: number, data: Partial<{ responsavel: number; nome_loja: string; ativo: boolean }>) => {
    const res = await apiV1(`/lojas/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return res.json();
};