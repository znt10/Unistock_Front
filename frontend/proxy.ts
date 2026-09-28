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
    "/historico",
    // A fabrica loga como Responsavel; quem pode agir nela quem decide e o
    // backend (403 para loja comum).
    "/fabrica",
  ],
  Responsavel: [
    "/novopedido",
    "/meuspedidos",
    "/estoque",
    "/estoque-baixo",
    "/notificacoes",
    "/configuracoes",
    "/caixa",
    "/historico",
    // A fabrica loga como Responsavel; quem pode agir nela quem decide e o
    // backend (403 para loja comum).
    "/fabrica",
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

// O rewrite de /backend/* vai para a URL publica da api, entao o Django ve o
// IP deste servidor para todo visitante. O IP de verdade segue num cabecalho,
// e o segredo prova ao Django que foi este servidor que o escreveu (ver
// app/middleware.py no back). O IP confiavel e o ultimo do X-Forwarded-For:
// o que o Traefik acrescentou; o comeco da lista quem escreve e o navegador.
function cabecalhosDoCliente(request: NextRequest): Record<string, string> {
  const segredo = process.env.PROXY_SEGREDO;
  const ip = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim();

  if (!segredo || !ip) {
    return {};
  }

  return { "x-cliente-ip": ip, "x-proxy-segredo": segredo };
}

function repassarParaApi(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Os que vierem de fora sao descartados: so este servidor escreve estes.
  headers.delete("x-cliente-ip");
  headers.delete("x-proxy-segredo");

  for (const [nome, valor] of Object.entries(cabecalhosDoCliente(request))) {
    headers.set(nome, valor);
  }

  return NextResponse.next({ request: { headers } });
}

export default function proxy(request: NextRequest) {
  // Chamadas de API: so os cabecalhos do IP, sem redirect de navegacao nem
  // normalizacao da barra final (o Django precisa dela).
  if (request.nextUrl.pathname.startsWith("/backend/")) {
    return repassarParaApi(request);
  }

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
      // Sem isto a renovacao de todo mundo dividiria o limite do IP deste
      // servidor.
      ...cabecalhosDoCliente(request),
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
  // "backend" entra no matcher so para ganhar os cabecalhos do IP; o inicio
  // do proxy() devolve essas chamadas antes de qualquer redirect.
  // Os arquivos do PWA tambem: o navegador os baixa sem login, e com eles no
  // matcher viravam redirect para /login — sem icone e sem manifest nao ha
  // instalacao.
  matcher: [
    "/((?!_next/static|_next/image|icones/|sw\\.js|manifest\\.webmanifest|favicon\\.ico|favicon\\.svg|icon\\.svg).*)",
  ],
};
