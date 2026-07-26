import { apiV1 } from "@/shared/services/api";
import type { VendaPayload, VendaResponse } from "@/features/pdv/types";

export const finalizarVenda = async (payload: VendaPayload) => {
  const res = await apiV1("/vendas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.json() as Promise<VendaResponse>;
};
