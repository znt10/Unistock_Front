import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "@/services/uni";

export interface Pedido {
  id: number;
  produto: number;
  quantidade: number;
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
}

export function usePedidos(filters?: PedidoFilters) {
  return useQuery<Pedido[]>({
    queryKey: [
      "pedidos",
      filters?.status,
      filters?.data,
    ],

    queryFn: async () => {

      const data = await getPedidos(filters);

      return data.results as Pedido[];
    },

    staleTime: 0,
  });
}