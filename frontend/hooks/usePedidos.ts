import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "@/services/uni";

export interface Pedido {
  id: number;
  itens?: {
    produto: number;
    produto_nome?: string;
    quantidade: number;
  }[];
  descricao: string;
  data: string;
  hora: string;
  loja: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PedidoFilters {
  status?: string;
  data?: string;
  loja?: string;
}

export function usePedidos(filters?: PedidoFilters) {
  return useQuery<Pedido[]>({
    queryKey: [
      "pedidos",
      filters?.status,
      filters?.data,
      filters?.loja,
    ],

    queryFn: async () => {

      const data = await getPedidos(filters);

      return data.results as Pedido[];
    },

    staleTime: 0,
  });
}
