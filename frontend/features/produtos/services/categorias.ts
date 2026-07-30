import { apiV1 } from "@/shared/services/api";

export const getCategorias = async () => {
  const res = await apiV1("/categorias/", { method: "GET" });
  const data = await res.json();
  // Compatível com resposta paginada do DRF e com array cru.
  return data.results ?? data;
};

export const postCategoria = async (nome: string) => {
  const res = await apiV1("/categorias/", {
    method: "POST",
    body: JSON.stringify({ nome }),
  });

  return res.json();
};
