// features/produtos/hooks/useProduto.ts
import { useQuery } from "@tanstack/react-query";
import { getProdutos } from "@/features/produtos/services/produtos"; // ← confirma o nome da função

export const PRODUTOS_QUERY_KEY = ["produtos", "v3"] as const;

export interface Produto {
  id: string;
  nome_produto: string;
  unidade_medida?: string;
  quantidade_por_embalagem?: number | null;
  estoque_minimo_sugerido?: number;
  // categoria e o id (UUID) da Categoria, usado pra ler/escrever na API;
  // categoria_nome e o nome pra exibicao — nunca usar categoria como texto.
  categoria?: string;
  categoria_nome?: string;
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
