const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NO_REFRESH_ENDPOINTS = [
  "/login/",
  "/logout/",
  "/token/refresh/",
  "/api/v1/user/me/",
];

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

const setClientCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

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

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<Response> => {
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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: requestHeaders,
  });

  if (canRefresh && [401, 403].includes(response.status) && !_isRetry) {
    try {
      const refreshToken = getCookie("refresh_token");

      if (!refreshToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const refreshData = await refreshResponse.json();

      if (!refreshData.access) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      setClientCookie("access_token", refreshData.access, 60 * 60);

      return await apiFetch(endpoint, options, true);
    } catch (refreshError) {
      console.error("Erro no refresh:", refreshError);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw refreshError;
    }
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const data = await response.clone().json();
      message = extractApiErrorMessage(data) || message;
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
