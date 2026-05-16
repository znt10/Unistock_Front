import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/registrar", "/esqueci-senha", "/redefinir-senha"];

// Rotas permitidas por role
const ROLE_ROUTES: Record<string, string[]> = {
  Gerente: ["/dashboard", "/lojas", "/novopedido", "/meuspedidos", "/painel_unidade", "/notificacoes", "/configuracoes","/estoque","/produtos"],
  Responsavel: ["/novopedido", "/meuspedidos", "/notificacoes", "/configuracoes"],
};

// Rota padrão após login por role
const ROLE_HOME: Record<string, string> = {
  Gerente: "/dashboard",
  Responsavel: "/novopedido",
};

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;
  // 1. Já logado tentando acessar login → redireciona pra home do role
  if (pathname === "/login" && token) {
    const redirect = ROLE_HOME[role ?? ""] ?? "/dashboard";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // 2. Rotas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Não logado → manda pro login
  if (!token) {
    if (refreshToken) {
      return refreshAccessToken(request);
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Proteção por role — verifica se a rota é permitida pro role atual
  const allowedRoutes = ROLE_ROUTES[role ?? ""] ?? [];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    const home = ROLE_HOME[role ?? ""] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // 5. Permitido
  return NextResponse.next();
}

async function refreshAccessToken(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const refreshResponse = await fetch(`${apiUrl}/token/refresh/`, {
    method: "POST",
    headers: {
      Cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!refreshResponse.ok) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("role");
    return response;
  }

  const data = await refreshResponse.json();
  const response = NextResponse.redirect(request.nextUrl);

  if (data.access) {
    response.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
