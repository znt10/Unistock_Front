const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NO_REFRESH_ENDPOINTS = ["/login/", "/logout/", "/token/refresh/", "/api/v1/user/me/"];

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<Response> => {
  const { headers, ...rest } = options;
  const canRefresh = !NO_REFRESH_ENDPOINTS.includes(endpoint);
  const accessToken = getCookie("access_token");
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  // 1. Faz a requisição original
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include", 
    headers: requestHeaders,
  });

  // 2. Se o token venceu (401) e ainda não tentamos fazer o refresh
  if (canRefresh && (response.status === 401 || response.status === 403) && !_isRetry) {
    try {
      const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
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
    let message = `Erro ${response.status}`;

    try {
      const data = await response.clone().json();
      message = data?.error || data?.detail || message;
    } catch {
      const errorText = await response.clone().text();
      message = errorText || message;
    }

    throw new Error(message);
  }

  return response;
};

export const apiV1 = (endpoint: string, options?: RequestInit) => {
  return apiFetch(`/api/v1${endpoint}`, options);
};
