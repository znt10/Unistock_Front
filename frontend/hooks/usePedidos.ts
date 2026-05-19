import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "@/services/uni";

export interface Pedido {
  id: string;
  itens?: {
    produto: string;
    produto_nome?: string;
    quantidade: number;
  }[];
  descricao: string;
  data: string;
  hora: string;
  loja: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PedidoFilters {
  status?: string;
  data?: string;
  loja?: string;
}

function normalizarPedidos(data: unknown): Pedido[] {
  if (Array.isArray(data)) return data as Pedido[];

  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    return Array.isArray(results) ? (results as Pedido[]) : [];
  }

  return [];
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

      return normalizarPedidos(data);
    },

    staleTime: 0,
  });
}
