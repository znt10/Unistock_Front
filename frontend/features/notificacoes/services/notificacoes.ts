import { apiV1 } from "@/shared/services/api";


// ======================================================
// 🔹 NOTIFICAÇÕES
// ======================================================

export type Notificacao = {
  id: string;
  pedido: string | null;
  loja_id: string | null;
  loja_nome: string | null;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criada_em: string;
};

export const getNotificacoes = async () => {
  const res = await apiV1("/notificacoes/", {
    method: "GET",
  });

  const data = await res.json();

  return (data.results ?? data) as Notificacao[];
};

export const marcarNotificacaoLida = async (
  id: string,
) => {
  const res = await apiV1(
    `/notificacoes/${id}/marcar-lida/`,
    {
      method: "PATCH",
    }
  );

  return res.json();
};

export const marcarTodasNotificacoesLidas = async () => {
  const res = await apiV1("/notificacoes/todas-lidas/", {
    method: "PATCH",
  });

  return res.json();
};

export const excluirNotificacao = async (
  id: string,
) => {
  const res = await apiV1(`/notificacoes/${id}/`, {
    method: "DELETE",
  });

  return res.ok;
};

export const limparNotificacoes = async () => {
  const res = await apiV1("/notificacoes/limpar/", {
    method: "DELETE",
  });

  return res.ok;
};


// ======================================================
// 🔹 PREFERENCIAS DE NOTIFICACAO
// ======================================================

// O resumo diario NAO fica aqui: ele e por loja (vai pro email da loja as 7h),
// nao por usuario. Aqui ficam so os canais.
export type PreferenciaNotificacao = {
  email_ativo: boolean;
  whatsapp_ativo: boolean;
  telefone_whatsapp: string;
};

export const getPreferenciasNotificacao = async () => {
  const res = await apiV1("/preferencias-notificacao/me/", { method: "GET" });
  return (await res.json()) as PreferenciaNotificacao;
};

export const updatePreferenciasNotificacao = async (
  data: Partial<PreferenciaNotificacao>,
) => {
  const res = await apiV1("/preferencias-notificacao/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return (await res.json()) as PreferenciaNotificacao;
};
