// Todas as chamadas passam pelo rewrite same-origin do Next (/backend/...),
// entao os cookies HTTP-only de autenticacao sao enviados automaticamente
// pelo navegador. Nenhum token e lido ou gravado via JavaScript.
const API_URL = "/backend";

const NO_REFRESH_ENDPOINTS = [
  "/login/",
  "/logout/",
  "/token/refresh/",
  "/api/v1/user/me/",
];

const extractApiErrorMessage = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    return data.map(extractApiErrorMessage).filter(Boolean).join(" ");
  }

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const directMessage = record.error || record.detail;

    if (typeof directMessage === "string") {
      return directMessage;
    }

    return Object.entries(record)
      .map(([key, value]) => {
        const message = extractApiErrorMessage(value);
        return message ? `${key}: ${message}` : null;
      })
      .filter(Boolean)
      .join(" ");
  }

  return null;
};

/**
 * Erro de API com o corpo preservado.
 *
 * Continua sendo um Error (quem so mostra `message` nao muda), mas carrega
 * `status` e `data` para os casos em que a resposta de erro e informacao util
 * e nao so um texto — o aviso de teto de estoque (409) manda a lista de
 * produtos que estouram, com os numeros que a tela precisa mostrar.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<Response> => {
  const { headers, ...rest } = options;
  const canRefresh = !NO_REFRESH_ENDPOINTS.includes(endpoint);
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: requestHeaders,
  });

  if (canRefresh && [401, 403].includes(response.status) && !_isRetry) {
    // O backend responde token expirado com 403 (nao 401), entao todo 403
    // passa por aqui. Mas 403 tambem e regra de negocio ("a fabrica nao altera
    // pedidos das lojas"): so a falha do PROPRIO refresh quer dizer sessao
    // expirada e manda para o login.
    let refreshOk = false;

    try {
      // O refresh_token HTTP-only vai junto automaticamente; o backend
      // devolve o novo access_token tambem como cookie HTTP-only.
      const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      refreshOk = refreshResponse.ok;
    } catch (refreshError) {
      console.error("Erro no refresh:", refreshError);
    }

    if (!refreshOk) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw new Error("Sessao expirada. Faca login novamente.");
    }

    // Sessao valida: tenta de novo uma vez (_isRetry impede laco). Se a
    // retentativa tambem falhar, o ApiError com a mensagem do backend sobe
    // intacto para quem chamou, sem redirecionar.
    return apiFetch(endpoint, options, true);
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    let data: unknown = null;

    try {
      data = await response.clone().json();
      message = extractApiErrorMessage(data) || message;
    } catch {
      const errorText = await response.clone().text();
      message = errorText || message;
    }

    throw new ApiError(message, response.status, data);
  }

  return response;
};

export const apiV1 = (endpoint: string, options?: RequestInit) => {
  return apiFetch(`/api/v1${endpoint}`, options);
};
