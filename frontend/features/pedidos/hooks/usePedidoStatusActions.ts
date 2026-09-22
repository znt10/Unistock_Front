"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/shared/services/api";
import { patchPedidoStatus } from "@/features/pedidos/services/pedidos";
import type { PedidoStatus } from "@/features/pedidos/services/pedidos";
import type { Pedido } from "@/features/pedidos/hooks/usePedidos";

export type { PedidoStatus };

type AtualizarStatusOptions = {
  mostrarAlerta?: boolean;
};

// 409 no status = transicao invalida: o pedido ja mudou (outra pessoa entregou
// ou cancelou antes). Nao e falha de rede; a lista e que esta velha.
const ehConflito = (erro: unknown): erro is ApiError =>
  erro instanceof ApiError && erro.status === 409;

const mensagemDoConflito = (erro: ApiError) => {
  const corpo = erro.data as { status?: string } | null;
  return corpo?.status ?? "O pedido já mudou de status.";
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

  // Troca o pedido em todas as listas em cache pelo que o PATCH devolveu, para
  // a UI refletir cada item assim que ele passa, sem esperar o lote inteiro.
  const gravarPedidoNoCache = (pedido: Pedido) => {
    queryClient.setQueriesData<Pedido[]>({ queryKey: ["pedidos"] }, (lista) =>
      lista?.map((p) => (p.id === pedido.id ? { ...p, ...pedido } : p)),
    );
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
      if (ehConflito(error)) {
        toast.error(mensagemDoConflito(error), {
          description: "A lista foi atualizada.",
        });
        await invalidarPedidos();
      } else {
        toast.error(
          error instanceof Error ? error.message : "Erro ao atualizar status.",
        );
      }
      throw error;
    } finally {
      setPedidoAtualizando(null);
    }
  };

  /**
   * Atualiza em sequencia. Cada sucesso entra no cache na hora; um 409 so pula
   * aquele pedido; qualquer outro erro para o lote (rede/servidor) sem desfazer
   * o que ja passou. Em todo caso a lista e recarregada no fim, entao repetir a
   * acao so reenvia o que de fato ficou pendente.
   */
  const atualizarStatusPedidos = async (
    ids: string[],
    statusNovo: PedidoStatus,
  ) => {
    if (ids.length === 0) return;

    let atualizados = 0;
    let conflitos = 0;
    let erro: unknown = null;

    try {
      setAtualizandoLista(true);

      for (const id of ids) {
        try {
          gravarPedidoNoCache(await patchPedidoStatus(id, statusNovo));
          atualizados += 1;
        } catch (e: unknown) {
          if (!ehConflito(e)) {
            erro = e;
            break;
          }
          conflitos += 1;
        }
      }
    } finally {
      await invalidarPedidos();
      setAtualizandoLista(false);
    }

    const entregue = statusNovo === "ENTREGUE";
    const resumoConflitos =
      conflitos > 0
        ? `${conflitos} já tinha${conflitos > 1 ? "m" : ""} mudado de status e ${conflitos > 1 ? "foram ignorados" : "foi ignorado"}.`
        : undefined;

    if (erro) {
      const restantes = ids.length - atualizados - conflitos;
      toast.error(
        erro instanceof Error ? erro.message : "Erro ao atualizar pedidos.",
        {
          description: [
            `${atualizados} atualizado${atualizados === 1 ? "" : "s"}, ${restantes} não enviado${restantes === 1 ? "" : "s"}.`,
            resumoConflitos,
          ]
            .filter(Boolean)
            .join(" "),
        },
      );
    } else if (atualizados === 0) {
      toast.warning("Nenhum pedido foi atualizado.", {
        description: resumoConflitos,
      });
    } else if (conflitos > 0) {
      toast.warning(
        `${atualizados} pedido${atualizados === 1 ? "" : "s"} ${entregue ? "entregue" : "atualizado"}${atualizados === 1 ? "" : "s"}.`,
        { description: resumoConflitos },
      );
    } else {
      toast.success(
        entregue
          ? "Pedidos entregues. Estoque das lojas atualizado."
          : "Pedidos atualizados com sucesso.",
      );
    }
  };

  return {
    pedidoAtualizando,
    atualizandoLista,
    atualizarStatusPedido,
    atualizarStatusPedidos,
  };
}
