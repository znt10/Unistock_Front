import { apiV1 } from "@/shared/services/api";

// ======================================================
// 🔹 FABRICA
// ======================================================

export type Disponivel = {
  produto: string;
  produto_nome: string;
  estoque: number;
  a_caminho: number;
  disponivel: number;
};

export type RecusaDeImpressao = {
  pedido: string;
  numero: number | null;
  motivo: string;
  faltam: number | null;
};

export type ResultadoDaImpressao = {
  impressos: { pedido: string; numero: number; caixas: number }[];
  recusados: RecusaDeImpressao[];
};

export const getDisponivel = async () => {
  const res = await apiV1("/fabrica/disponivel/", { method: "GET" });
  return (await res.json()) as Disponivel[];
};

export const imprimirEtiquetas = async (pedidos: string[]) => {
  const res = await apiV1("/fabrica/etiquetas/", {
    method: "POST",
    body: JSON.stringify({ pedidos }),
  });
  return (await res.json()) as ResultadoDaImpressao;
};

/**
 * Carrega o PDF das etiquetas numa aba JA ABERTA.
 *
 * Quem chama abre a aba (`window.open("", "_blank")`) no clique, antes de
 * qualquer await: aberta depois de uma chamada a API, o navegador trata como
 * popup e bloqueia. Se o navegador bloquear mesmo assim (`aba` nula), o PDF
 * abre na aba atual.
 */
export const carregarPdfNaAba = async (aba: Window | null, pedidos: string[]) => {
  try {
    const res = await apiV1(
      `/fabrica/etiquetas/pdf/?pedidos=${pedidos.join(",")}`,
      { method: "GET" },
    );
    const url = URL.createObjectURL(await res.blob());
    if (aba) {
      aba.location.href = url;
    } else {
      window.location.href = url;
    }
    // A aba ja carregou o PDF; soltar o blob depois evita segurar memoria.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (erro) {
    aba?.close();
    throw erro;
  }
};

export const registrarProducao = async (produto: string, caixas: number) => {
  const res = await apiV1("/fabrica/producao/", {
    method: "POST",
    body: JSON.stringify({ produto, caixas }),
  });
  return (await res.json()) as {
    produto: string;
    produto_nome: string;
    quantidade_atual: number;
  };
};
