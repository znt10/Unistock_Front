
import { useQuery } from "@tanstack/react-query";
import { getLoja } from "@/services/uni";

export const LOJAS_QUERY_KEY = ["lojas", "v2"] as const;

export interface Loja {
  id: string;
  nome_loja: string;
  tipo: string;
  cidade: string;
  endereco: string;
  responsavel:
    | number
    | null
    | {
        first_name?: string;
        email?: string;
      };
  responsavel_nome?: string;
  first_name?: string;
  ativo: boolean;
  email?: string | null;
  email_acesso?: string | null;
  telefone_whatsapp?: string | null;
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
