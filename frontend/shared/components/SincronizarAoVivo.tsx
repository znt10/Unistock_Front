"use client";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMudancas, type Mudancas } from "@/shared/services/mudancas";
import { useAuthStore } from "@/shared/stores/authStore";

export const MUDANCAS_QUERY_KEY = ["mudancas"] as const;

// O que recarregar quando cada grupo muda em OUTRO aparelho. Invalidar so
// refaz a busca das telas abertas; o que a pessoa esta digitando fica.
const RECARREGAR: Record<keyof Mudancas, readonly (readonly string[])[]> = {
  pedidos: [["pedidos"], ["caixas-a-caminho"], ["caixa"], ["fabrica"]],
  estoque: [["estoque"], ["estoque-baixo"], ["fabrica", "disponivel"]],
};

/**
 * Atualizacao ao vivo entre aparelhos: pergunta ao servidor a cada 5s (so
 * com a aba visivel, e na hora em que ela volta a ficar visivel) se pedidos
 * ou estoque mudaram, e recarrega so o grupo que mudou.
 *
 * Fica nos Providers porque vale para o site inteiro. A versao anterior mora
 * num ref, e nao no cache, para um F5 nao comparar com a de antes do F5 e
 * recarregar tudo a toa.
 */
export function SincronizarAoVivo() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((s) => s.user?.email ?? null);
  const anterior = useRef<Mudancas | null>(null);

  const { data } = useQuery({
    queryKey: [...MUDANCAS_QUERY_KEY, usuario],
    queryFn: getMudancas,
    enabled: Boolean(usuario),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    staleTime: 0,
    retry: false,
  });

  // Trocou de usuario (logout/login): a versao anterior era de outra conta.
  useEffect(() => {
    anterior.current = null;
  }, [usuario]);

  useEffect(() => {
    if (!data) return;
    const antes = anterior.current;
    anterior.current = data;
    if (!antes) return;

    (Object.keys(RECARREGAR) as (keyof Mudancas)[]).forEach((grupo) => {
      if (antes[grupo] === data[grupo]) return;
      RECARREGAR[grupo].forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    });
  }, [data, queryClient]);

  return null;
}
