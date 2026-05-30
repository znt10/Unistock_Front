import type { Produto } from "@/hooks/useProduto";

export type PdvProdutoDisponivel = Produto & {
  estoque_id: string;
  loja_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
};

export type PdvCarrinhoItem = {
  produto: PdvProdutoDisponivel;
  quantidade: number;
};

export type VendaItemPayload = {
  produto_id: string;
  quantidade: number;
};

export type VendaPayload = {
  loja_id?: string;
  itens: VendaItemPayload[];
};

export type VendaResponse = {
  detail: string;
  pedido: {
    id: string;
    loja: string;
    status: string;
  };
};
