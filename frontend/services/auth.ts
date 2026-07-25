import { apiFetch, apiV1 } from './api';
import { useAuthStore } from '@/stores/authStore';

// Os cookies de autenticacao (access_token, refresh_token, role) sao
// gravados e removidos exclusivamente pelo backend, como HTTP-only.
// Nenhum token passa pelo JavaScript.

// 🔹 LOGIN


export const getMe = async () => {
  const response = await apiV1('/user/me/', {
    method: 'GET',
  });
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await apiFetch('/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  const userInfo = data.user;

  const user = {
    id: userInfo.id,
    email: userInfo.email,
    first_name: userInfo.first_name,
    group: userInfo.group,
    loja_id: userInfo.loja?.id ?? null,
    loja_nome: userInfo.loja?.nome ?? null,
  };

  useAuthStore.getState().setUser(user);

  return user;
};


// 🔹 LOGOUT
export const logout = async () => {
  useAuthStore.getState().clearUser();

  // A remocao dos cookies HTTP-only e feita pelo backend nesta chamada.
  try {
    const response = await apiFetch('/logout/', {
      method: 'POST',
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};


// 🔹 REGISTER
export const register = async (
  first_name: string,
  email: string,
  password: string,
  tipo_usuario: string,
  id_loja?: number | string
) => {
  const response = await apiV1('/user/registrar/', {
    method: 'POST',
    body: JSON.stringify({
      first_name,
      email,
      password,
      tipo_usuario,
      id_loja: id_loja || null,
    }),
  });

  // O backend informa em `detail` se a conta precisa de confirmacao por email.
  return (await response.json()) as { detail?: string };
};


// 🔹 CONFIRMACAO DE CONTA (link enviado por email)
export const confirmarConta = async (token: string) => {
  const response = await apiV1(`/user/confirmar/${encodeURIComponent(token)}/`, {
    method: 'GET',
  });

  return (await response.json()) as { detail?: string };
};


// 🔹 SENHA (definicao no 1o acesso e recuperacao de senha)
// A loja define a senha no 1o acesso (link enviado pro email da loja) e usa o
// mesmo fluxo quando esquece a senha. apiV1/apiFetch ja injeta o Content-Type
// e ja lanca um Error com a mensagem do backend quando a resposta nao e ok,
// entao nao ha necessidade de checar response.ok aqui (mesmo padrao do
// confirmarConta acima).
export const definirSenha = async (token: string, password: string) => {
  const response = await apiV1(
    `/user/definir-senha/${encodeURIComponent(token)}/`,
    {
      method: 'POST',
      body: JSON.stringify({ password }),
    },
  );

  return (await response.json().catch(() => ({}))) as { detail?: string };
};

export const esqueciSenha = async (email: string) => {
  const response = await apiV1('/user/esqueci-senha/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  return (await response.json().catch(() => ({}))) as { detail?: string };
};
