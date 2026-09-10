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
  // Atalho de gerencia: preenchido, cria/reseta a senha do acesso da loja na
  // hora (ativa, sem o email de "defina sua senha"). Em branco/ausente nao
  // mexe em nada — o link por email continua sendo o caminho padrao.
  senha_acesso: string;
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
  // Preenchido, a loja ja nasce com acesso ativo e essa senha — sem esperar
  // o link por e-mail. Em branco, e o fluxo de sempre.
  senha_acesso?: string,
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
      senha_acesso: senha_acesso || undefined,
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
  // apiFetch ja lanca Error (com a mensagem extraida de {"error": ...}) pra
  // qualquer resposta nao-OK, entao um eventual `res.ok` aqui nunca seria
  // false — o catch e o unico jeito de pegar o 409 do backend.
  try {
    await apiV1(`/lojas/${id}/`, { method: "DELETE" });
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      mensagem: err instanceof Error ? err.message : "Erro ao excluir a loja.",
    };
  }
};
