import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "@/services/uni"; 

export interface Pedido{
    id: number;
    produto: number;
    quantidade: number;
    descricao: string;
    loja: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export function usePedidos() {
    return useQuery<Pedido[]>({
        queryKey: ["pedidos"],
        queryFn: async () => {
            const data = await getPedidos();
            return data.results as Pedido[];
            
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}