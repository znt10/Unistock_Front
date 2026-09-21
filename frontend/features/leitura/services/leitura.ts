import { apiV1 } from "@/shared/services/api";

// ======================================================
// 🔹 LEITURA DAS CAIXAS (parte 3)
// ======================================================

export type Situacao = "A_CAMINHO" | "CHEGOU" | "ABERTA" | "ACABOU";

export type CaixaDescrita = {
  codigo: string;
  situacao: Situacao;
  proximo: Situacao | null;
  numero: number;
  total: number;
  produto_nome: string;
  loja_nome: string;
  pedido: string;
  pedido_numero: number;
  caixas_chegaram: number;
  caixas_total: number;
};

export type ResultadoDaLeitura = {
  leitura: string | null;
  ja_acabou: boolean;
  caixa: CaixaDescrita;
  caixa_fechada: CaixaDescrita | null;
};

export type ResultadoDoDesfazer = {
  caixa: CaixaDescrita;
  caixa_reaberta: CaixaDescrita | null;
};

export type ACaminho = {
  pedido: string;
  pedido_numero: number;
  produto_nome: string;
  caixas_total: number;
  caixas_chegaram: number;
  faltam: number[];
};

/** Corpo de erro das rotas de leitura: `codigo` diz o motivo sem ler texto. */
export type RecusaDaLeitura = {
  error: string;
  codigo: string;
  proximo?: Situacao;
};

export const lerCaixa = async (codigo: string, confirmar = false) => {
  const res = await apiV1(`/caixas/${encodeURIComponent(codigo)}/ler/`, {
    method: "POST",
    body: JSON.stringify({ confirmar }),
  });
  return (await res.json()) as ResultadoDaLeitura;
};

export const desfazerLeitura = async (leitura: string) => {
  const res = await apiV1(`/leituras/${leitura}/desfazer/`, { method: "POST" });
  return (await res.json()) as ResultadoDoDesfazer;
};

export const getCaixa = async (codigo: string) => {
  const res = await apiV1(`/caixas/${encodeURIComponent(codigo)}/`, { method: "GET" });
  return (await res.json()) as CaixaDescrita;
};

export const getACaminho = async () => {
  const res = await apiV1("/caixas/a-caminho/", { method: "GET" });
  return (await res.json()) as ACaminho[];
};
