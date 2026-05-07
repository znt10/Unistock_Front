const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<Response> => {
  const { headers, ...rest } = options;

  // 1. Faz a requisição original
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  // 2. Se o token venceu (401) e ainda não tentamos fazer o refresh
  if (response.status === 401 && !_isRetry) {
    try {
      // 3. Bate na rota de refresh (ajuste a URL para a sua rota do Django)
      const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
        method: 'POST',
        credentials: "include", 
      });

      // Se o refresh falhou (ex: o refresh_token também venceu), lança o erro
      if (!refreshResponse.ok) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // 4. Se o refresh deu certo, o Django já atualizou o cookie de access_token.
      // Então, refazemos a requisição original que tinha dado 401, passando _isRetry como true
      return await apiFetch(endpoint, options, true);

    } catch (refreshError) {
      // 5. O Refresh falhou de vez. O usuário precisa logar de novo.
      console.error("Erro no refresh:", refreshError);
      
      // Se estiver rodando no lado do cliente (Browser), redireciona para o login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; // Ajuste para a sua rota de login
      }
      
      throw refreshError;
    }
  }

  // Se deu qualquer outro erro que não seja 401, ou se o 401 persistir
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response;
};

export const apiV1 = (endpoint: string, options?: RequestInit) => {
  return apiFetch(`/api/v1${endpoint}`, options);
};