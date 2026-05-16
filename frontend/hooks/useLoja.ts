
import { useQuery } from "@tanstack/react-query";
import { getLoja } from "@/services/uni";

export const LOJAS_QUERY_KEY = ["lojas", "v2"] as const;

export interface Loja {
  id: string;
  nome_loja: string;
  tipo: string;
  cidade: string;
  endereco: string;
  responsavel: number;
  responsavel_nome: string;
  ativo: boolean;
}

function normalizarLojas(data: unknown): Loja[] {
  if (Array.isArray(data)) return data as Loja[];

  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    return Array.isArray(results) ? (results as Loja[]) : [];
  }

  return [];
}

export function useLojas() {
  return useQuery<Loja[]>({
    queryKey: LOJAS_QUERY_KEY,
    queryFn: async () => {
      const data = await getLoja();
  
      return normalizarLojas(data);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
