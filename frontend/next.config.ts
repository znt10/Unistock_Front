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
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
