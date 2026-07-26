"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patchPedidoStatus } from "@/features/pedidos/services/pedidos";

export type PedidoStatus = "PENDENTE" | "ENTREGUE" | "CANCELADO";

type AtualizarStatusOptions = {
  mostrarAlerta?: boolean;
};

export function usePedidoStatusActions() {
  const queryClient = useQueryClient();
  const [pedidoAtualizando, setPedidoAtualizando] = useState<string | null>(
    null,
  );
  const [atualizandoLista, setAtualizandoLista] = useState(false);


  
  const invalidarPedidos = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    await queryClient.invalidateQueries({ queryKey: ["estoque"] });
  };

  const atualizarStatusPedido = async (
    id: string,
    statusNovo: PedidoStatus,
    options: AtualizarStatusOptions = {},
  ) => {
    const { mostrarAlerta = true } = options;

    try {
      setPedidoAtualizando(id);
      await patchPedidoStatus(id, statusNovo);
      await invalidarPedidos();

      if (mostrarAlerta) {
        toast.success(
          statusNovo === "ENTREGUE"
            ? "Pedido entregue. Estoque da loja atualizado."
            : "Status atualizado com sucesso.",
        );
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar status.",
      );
      throw error;
    } finally {
      setPedidoAtualizando(null);
    }
  };

  const atualizarStatusPedidos = async (
    ids: string[],
    statusNovo: PedidoStatus,
  ) => {
    if (ids.length === 0) return;

    try {
      setAtualizandoLista(true);

      for (const id of ids) {
        await patchPedidoStatus(id, statusNovo);
      }

      await invalidarPedidos();
      toast.success(
        statusNovo === "ENTREGUE"
          ? "Pedidos entregues. Estoque das lojas atualizado."
          : "Pedidos atualizados com sucesso.",
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar pedidos.",
      );
      throw error;
    } finally {
      setAtualizandoLista(false);
    }
  };

  return {
    pedidoAtualizando,
    atualizandoLista,
    atualizarStatusPedido,
    atualizarStatusPedidos,
  };
}
