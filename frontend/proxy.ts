import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/"];

// Rotas permitidas por role
const ROLE_ROUTES: Record<string, string[]> = {
  Gerente: ["/dashboard", "/lojas", "/novopedido", "/meuspedidos", "/Painel_unidade", "/registrar", "/notificacoes", "/configuracoes"],
  Responsavel: ["/novopedido", "/meuspedidos", "/notificacoes", "/configuracoes"],
};

// Rota padrão após login por role
const ROLE_HOME: Record<string, string> = {
  Gerente: "/dashboard",
  Responsavel: "/novopedido",
};

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // 1. Já logado tentando acessar login → redireciona pra home do role
  if (pathname === "/" && token) {
    const redirect = ROLE_HOME[role ?? ""] ?? "/dashboard";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // 2. Rotas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Não logado → manda pro login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Proteção por role — verifica se a rota é permitida pro role atual
  const allowedRoutes = ROLE_ROUTES[role ?? ""] ?? [];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    const home = ROLE_HOME[role ?? ""] ?? "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // 5. Permitido
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};