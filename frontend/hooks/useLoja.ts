
import { useQuery } from "@tanstack/react-query";
import { getLoja } from "@/services/uni";

export interface Loja {
  id: number;
  nome_loja: string;
  tipo: string;
  cidade: string;
  endereco: string;
  responsavel: number;
  responsavel_nome: string;
  ativo: boolean;
}

export function useLojas() {
  return useQuery<Loja[]>({
    queryKey: ["lojas"],
    queryFn: async () => {
      const data = await getLoja();
  
      return (data.results ?? data) as Loja[];
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false,      
  });
}