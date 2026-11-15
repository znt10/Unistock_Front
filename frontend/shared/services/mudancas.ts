import { apiV1 } from "@/shared/services/api";

// Versao opaca de cada grupo: so serve para comparar com a anterior.
export type Mudancas = { pedidos: string; estoque: string };

export const getMudancas = async () => {
  const res = await apiV1("/mudancas/", { method: "GET" });
  return (await res.json()) as Mudancas;
};
