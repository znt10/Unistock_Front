// hooks/useProdutos.ts
import { useQuery } from "@tanstack/react-query";
import { getProdutos } from "@/services/uni"; // ← confirma o nome da função

export interface Produto {
  id: number;
  nome_produto: string;
  
}

export function useProdutos() {
  return useQuery<Produto[]>({
    queryKey: ["produtos"],
    queryFn: async () => {
      const data = await getProdutos();
      return data.results as Produto[];
    },
    staleTime: 0,              
    refetchOnWindowFocus: true, 
  });
}