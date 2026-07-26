// hooks/useProdutos.ts
import { useQuery } from "@tanstack/react-query";
import { getProdutos } from "@/features/produtos/services/produtos"; // ← confirma o nome da função

export const PRODUTOS_QUERY_KEY = ["produtos", "v3"] as const;

export interface Produto {
  id: string;
  nome_produto: string;
  unidade_medida?: string;
  quantidade_por_embalagem?: number | null;
  estoque_minimo_sugerido?: number;
  categoria?: string;
}

function normalizarProdutos(data: unknown): Produto[] {
  if (Array.isArray(data)) return data as Produto[];

  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    return Array.isArray(results) ? (results as Produto[]) : [];
  }

  return [];
}

export function useProdutos() {
  return useQuery<Produto[]>({
    queryKey: PRODUTOS_QUERY_KEY,
    queryFn: async () => {
      const data = await getProdutos();
      return normalizarProdutos(data);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
