import { apiV1 } from "@/shared/services/api";


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
