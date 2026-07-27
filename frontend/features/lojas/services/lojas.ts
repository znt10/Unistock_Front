import { apiV1 } from "@/shared/services/api";


// ======================================================
// 🔹 LOJAS
// ======================================================

export type LojaUpdateData = Partial<{
  nome_loja: string;
  tipo: string;
  cidade: string;
  endereco: string;
  ativo: boolean;
  email: string;
  telefone_whatsapp: string;
  gerente: number | null;
}>;

export const getLoja = async () => {
  const res = await apiV1("/lojas/", {
    method: "GET",
  });

  const data = await res.json();
  // Compatível com resposta paginada do DRF e com array cru.
  return data.results ?? data;
};

export const postLoja = async (
  nome_loja: string,
  tipo: string,
  cidade: string,
  endereco: string,
  email?: string,
  telefone_whatsapp?: string,
) => {
  const res = await apiV1("/lojas/", {
    method: "POST",
    body: JSON.stringify({
      nome_loja,
      tipo,
      cidade,
      endereco,
      email: email || null,
      telefone_whatsapp: telefone_whatsapp || null,
    }),
  });

  return res.json();
};

export const patchLoja = async (
  id: number | string,
  data: LojaUpdateData,
) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getLojaById = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar detalhes da loja");
  }

  return res.json();
};

export const deleteLoja = async (id: string) => {
  const res = await apiV1(`/lojas/${id}/`, {
    method: "DELETE",
  });

  if (res.ok) {
    return { ok: true as const };
  }

  let mensagem = "Erro ao excluir a loja.";
  try {
    const data = await res.json();
    mensagem = data.error || mensagem;
  } catch {
    // corpo vazio (ex.: 204 sem chegar aqui, ou erro sem JSON) — mantem o generico
  }

  return { ok: false as const, mensagem };
};
