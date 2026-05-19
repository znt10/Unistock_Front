import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/registrar", "/esqueci-senha", "/redefinir-senha"];

const ROLE_ROUTES: Record<string, string[]> = {
  Gerente: [
    "/lojas",
    "/novopedido",
    "/meuspedidos",
    "/painel_unidade",
    "/notificacoes",
    "/configuracoes",
    "/estoque",
    "/produtos",
  ],
  Responsavel: [
    "/novopedido",
    "/meuspedidos",
    "/estoque",
    "/notificacoes",
    "/configuracoes",
  ],
};

const ROLE_HOME: Record<string, string> = {
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

  if (["gerente", "administrador", "admin"].includes(normalized)) {
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

  if (pathname === "/" && token && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (pathname === "/login" && token && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
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
