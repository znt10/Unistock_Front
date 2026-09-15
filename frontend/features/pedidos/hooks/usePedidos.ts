import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "@/features/pedidos/services/pedidos";

export interface Pedido {
  id: string;
  numero: number;
  loja_nome?: string;
  // Pedido que segue o fluxo das caixas: nao se marca entregue na mao.
  da_fabrica: boolean;
  caixas_total: number;
  caixas_chegaram: number;
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
  da_fabrica?: boolean;
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
      filters?.da_fabrica,
    ],

    queryFn: async () => {

      const data = await getPedidos(filters);

      return normalizarPedidos(data);
    },

    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
