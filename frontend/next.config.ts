import type { NextConfig } from "next";

// Toda chamada a API passa pelo proprio dominio do front (/backend/...),
// que o Next reescreve para o Django. Assim os cookies HTTP-only do backend
// viram cookies first-party e o navegador os envia sem precisar de tokens
// acessiveis ao JavaScript.
const API_URL =
  process.env.API_PROXY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Sem isso o Next redireciona /backend/login/ -> /backend/login (308)
  // antes do rewrite, e o Django (APPEND_SLASH) rejeita POST sem barra
  // final. O proxy.ts passa a normalizar a barra das rotas de pagina.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // Barra final forcada no destino: todas as rotas do Django
        // terminam em "/" (APPEND_SLASH cobre os GETs sem barra).
        source: "/backend/:path*",
        destination: `${API_URL}/:path*/`,
      },
    ];
  },
};

export default nextConfig;
