const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper para pegar cookie pelo nome
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR safety
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { headers, ...rest } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include", // só isso
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
};

export const apiV1 = (endpoint: string, options?: RequestInit) => {
  return apiFetch(`/api/v1${endpoint}`, options);
};