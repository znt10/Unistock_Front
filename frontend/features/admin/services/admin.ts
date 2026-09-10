import { apiV1 } from "@/shared/services/api";

export type LojaDaEstrutura = {
  id: string;
  nome_loja: string;
  responsavel: { id: number; email: string } | null;
};

export type MembroDaEstrutura = {
  id: number;
  nome: string;
  email: string;
};

// Antes esta arvore era Gerente -> Lojas. Com a empresa no meio, uma conta de
// dois gerentes aparecia duas vezes, cada uma com um pedaco das lojas — e loja
// sem gerente nao aparecia em lugar nenhum.
export type ContaDaEstrutura = {
  id: string;
  nome: string;
  ativo: boolean;
  membros: MembroDaEstrutura[];
  lojas: LojaDaEstrutura[];
};

export const getEstrutura = async (): Promise<ContaDaEstrutura[]> => {
  const res = await apiV1("/user/estrutura/", { method: "GET" });
  return res.json();
};

export type Conta = {
  id: string;
  nome: string;
};

// O cadastro de gerente precisa dizer a empresa: gerente sem conta nao
// enxerga nada. A lista sai da propria arvore, que so o Admin acessa.
export const getContas = async (): Promise<Conta[]> => {
  const estrutura = await getEstrutura();
  return estrutura.map(({ id, nome }) => ({ id, nome }));
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
