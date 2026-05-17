import { apiFetch, apiV1 } from './api';
import { useAuthStore } from '@/stores/authStore';
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

  useAuthStore.getState().setUser({
    id: userInfo.id,
    email: userInfo.email,
    first_name: userInfo.first_name,
    group: userInfo.group,
    loja_id: userInfo.loja?.id ?? null,
    loja_nome: userInfo.loja?.nome ?? null,
  });
};


// 🔹 LOGOUT
export const logout = async () => {
  useAuthStore.getState().clearUser();

  try {
    // Pega o token do cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    const response = await apiFetch('/logout/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,  
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
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
  return await apiV1('/user/registrar/', {
    method: 'POST',
    body: JSON.stringify({
      first_name,
      email,
      password,
      tipo_usuario,
      id_loja: id_loja || null,
    }),
  });
};

