import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/registrar", "/esqueci-senha"];

const ROLE_ROUTES: Record<string, string[]> = {
  Admin: [
    "/admin",
    "/configuracoes",
  ],
  Gerente: [
    "/lojas",
    "/novopedido",
    "/meuspedidos",
    "/painel_unidade",
    "/notificacoes",
    "/configuracoes",
    "/estoque",
    // Explicito: hoje passaria pelo prefixo "/estoque", mas o Sidebar mostra
    // este item e depender do prefixo esconde a intencao.
    "/estoque-baixo",
    "/produtos",
    "/caixa",
    "/historico"
  ],
  Responsavel: [
    "/novopedido",
    "/meuspedidos",
    "/estoque",
    "/estoque-baixo",
    "/notificacoes",
    "/configuracoes",
    "/caixa",
    "/historico"
  ],
};

const ROLE_HOME: Record<string, string> = {
  Admin: "/admin",
  Gerente: "/lojas",
  Responsavel: "/novopedido",
};

const normalizeRole = (role?: string) => {
  if (!role) {
    return undefined;
  }

  const normalized = role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (["admin", "administrador"].includes(normalized)) {
    return "Admin";
  }

  if (normalized === "gerente") {
    return "Gerente";
  }

  if (normalized === "responsavel") {
    return "Responsavel";
  }

  return undefined;
};

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const role = normalizeRole(request.cookies.get("role")?.value);
  const { pathname } = request.nextUrl;

  // Com skipTrailingSlashRedirect no next.config, a normalizacao da barra
  // final das rotas de pagina passa a ser responsabilidade do middleware
  // (as rotas /backend/* ficam fora do matcher e mantem a barra).
  if (pathname !== "/" && pathname.endsWith("/")) {
    // URL padrao, nao request.nextUrl.clone(): o NextURL re-aplica a barra
    // final original ao serializar, o que geraria um loop de redirect.
    const url = new URL(
      pathname.slice(0, -1) + request.nextUrl.search,
      request.url,
    );
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/" && token && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (pathname === "/login" && token && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/redefinir-senha/") ||
    pathname.startsWith("/confirmar-conta/")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    if (refreshToken) {
      return refreshAccessToken(request);
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!role) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("role");
    return response;
  }

  const allowedRoutes = ROLE_ROUTES[role];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

async function refreshAccessToken(request: NextRequest) {
  const apiUrl =
    process.env.API_PROXY_URL || process.env.NEXT_PUBLIC_API_URL;

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

  // O novo access_token vem apenas como Set-Cookie HTTP-only do backend;
  // repassa os cabecalhos ao navegador em vez de ler token do corpo.
  const response = NextResponse.redirect(request.nextUrl);

  for (const cookie of refreshResponse.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const config = {
  // "backend" fica fora do matcher: as chamadas de API same-origin passam
  // direto para o rewrite do next.config sem sofrer redirect de navegacao.
  matcher: [
    "/((?!backend|_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon\\.svg).*)",
  ],
};
