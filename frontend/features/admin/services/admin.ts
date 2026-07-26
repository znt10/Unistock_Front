import { apiV1 } from "@/shared/services/api";

export type LojaDaEstrutura = {
  id: string;
  nome_loja: string;
  responsavel: { id: number; email: string } | null;
};

export type GerenteDaEstrutura = {
  id: number;
  nome: string;
  email: string;
  lojas: LojaDaEstrutura[];
};

export const getEstrutura = async (): Promise<GerenteDaEstrutura[]> => {
  const res = await apiV1("/user/estrutura/", { method: "GET" });
  return res.json();
};

export type Usuario = {
  id: number;
  first_name: string;
  email: string;
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await apiV1("/user/", { method: "GET" });
  const data = await res.json();
  return data.results ?? data;
};
