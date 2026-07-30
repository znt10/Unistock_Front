import { useQuery } from "@tanstack/react-query";
import { getCategorias } from "@/features/produtos/services/categorias";

export const CATEGORIAS_QUERY_KEY = ["categorias"] as const;

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

function normalizarCategorias(data: unknown): Categoria[] {
  if (Array.isArray(data)) return data as Categoria[];

  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    return Array.isArray(results) ? (results as Categoria[]) : [];
  }

  return [];
}

export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: async () => {
      const data = await getCategorias();
      return normalizarCategorias(data).sort(
        (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome),
      );
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
