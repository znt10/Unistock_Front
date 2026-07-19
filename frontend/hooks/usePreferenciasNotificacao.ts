"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPreferenciasNotificacao,
  updatePreferenciasNotificacao,
  type PreferenciaNotificacao,
} from "@/services/uni";

const QUERY_KEY = ["preferencias-notificacao"];

export function usePreferenciasNotificacao() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getPreferenciasNotificacao,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<PreferenciaNotificacao>) =>
      updatePreferenciasNotificacao(data),
    onSuccess: (atualizada) => {
      queryClient.setQueryData(QUERY_KEY, atualizada);
      toast.success("Preferências salvas.");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar preferências.",
      );
    },
  });

  return {
    preferencias: query.data,
    carregando: query.isLoading,
    erro: query.error,
    salvar: mutation.mutate,
    salvando: mutation.isPending,
  };
}
