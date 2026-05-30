export const ESTADOS_PRODUTO = ["Normal", "Congelado"] as const;

export type EstadoProduto = (typeof ESTADOS_PRODUTO)[number];

export type ItemEstoqueData = {
  qtd: number;
  estado?: EstadoProduto;
  updatedAt?: string;
};

export type EstoqueLocal = Record<
  string,
  Record<string, Record<string, ItemEstoqueData>>
>;
