"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/shared/services/auth";
import { getNotificacoes } from "@/features/notificacoes/services/notificacoes";
import { useAuthStore } from "@/shared/stores/authStore";

const Icons = {
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path fill="currentColor" fillRule="evenodd" d="M11.218.878a1.5 1.5 0 0 1 1.564 0l8.742 5.342A1.5 1.5 0 0 1 22.3 7.5v8.608a1.5 1.5 0 0 1-.776 1.28l-8.742 5.342a1.5 1.5 0 0 1-1.564 0l-8.742-5.342A1.5 1.5 0 0 1 1.7 16.108V7.5a1.5 1.5 0 0 1 .776-1.28zM12 2.659l7.442 4.548l-7.442 4.547l-7.442-4.547zM3.2 8.878v7.23l7.3 4.46V13.338zM13.5 20.569v-7.231l7.3-4.46v7.23z" clipRule="evenodd" />
    </svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  Store: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  CashRegister: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h16" />
      <path d="M5 10V6a2 2 0 0 1 2-2h5l2 6" />
      <rect width="18" height="10" x="3" y="10" rx="2" />
      <path d="M7 15h.01" />
      <path d="M11 15h2" />
      <path d="M16 15h1" />
    </svg>
  ),
  Painel: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  UserCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  ),
};

type IconKey = keyof typeof Icons;

type MenuItem = { href: string; label: string; icon: IconKey };

const SIDEBAR_WIDTH = "lg:w-64";
const SIDEBAR_WIDTH_COLLAPSED = "lg:w-[72px]";

const NOTIFICACOES_QUERY_KEY = ["notificacoes"];

const MENU_CONFIG: Record<string, MenuItem[]> = {
  Gerente: [
    { href: "/lojas", label: "Gerenciar Lojas", icon: "Store" },
    { href: "/estoque", label: "Controle Estoque", icon: "Package" },
    { href: "/estoque-baixo", label: "Estoque Baixo", icon: "AlertTriangle" },
    { href: "/caixa", label: "Caixa PDV", icon: "CashRegister" },
    { href: "/produtos", label: "Produtos", icon: "Tag" },
    { href: "/novopedido", label: "Novo Pedido", icon: "ShoppingCart" },
    { href: "/painel_unidade", label: "Painel unidade", icon: "List" },
    { href: "/historico", label: "Historico", icon: "History" },
  ],
  Responsavel: [
    { href: "/novopedido", label: "Novo Pedido", icon: "ShoppingCart" },
    { href: "/meuspedidos", label: "Meus Pedidos", icon: "List" },
    { href: "/estoque", label: "Controle Estoque", icon: "Package" },
    { href: "/estoque-baixo", label: "Estoque Baixo", icon: "AlertTriangle" },
    { href: "/caixa", label: "Caixa PDV", icon: "CashRegister" },
    { href: "/historico", label: "Historico", icon: "History" },
  ],
};

const normalizeRole = (role?: string) => {
  const normalized = role
    ?.normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  if (["gerente", "administrador", "admin"].includes(normalized ?? "")) {
    return "Gerente";
  }

  if (normalized === "responsavel") {
    return "Responsavel";
  }

  return "";
};

export default function Sidebar() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const { data: notificacoes = [] } = useQuery({
    queryKey: NOTIFICACOES_QUERY_KEY,
    queryFn: getNotificacoes,
    enabled: hydrated && Boolean(user),
    refetchOnWindowFocus: true,
  });

  const role = normalizeRole(user?.group);
  const menuItems = MENU_CONFIG[role] || [];
  const temNotificacoes = notificacoes.some((n) => !n.lida);

  const closeMobile = useCallback(() => setIsOpenMobile(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpenMobile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <>
      {/* Botão Mobile — header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-[#0c1120]/95 backdrop-blur-md px-4 py-3 border-b border-slate-800/60 lg:hidden">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="rounded-lg bg-blue-600 p-2 text-white shadow-lg shadow-blue-900/40 active:scale-95 transition-transform"
          aria-label={isOpenMobile ? "Fechar menu" : "Abrir menu"}
        >
          {isOpenMobile ? <Icons.X /> : <Icons.Menu />}
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path fill="currentColor" fillRule="evenodd" d="M11.218.878a1.5 1.5 0 0 1 1.564 0l8.742 5.342A1.5 1.5 0 0 1 22.3 7.5v8.608a1.5 1.5 0 0 1-.776 1.28l-8.742 5.342a1.5 1.5 0 0 1-1.564 0l-8.742-5.342A1.5 1.5 0 0 1 1.7 16.108V7.5a1.5 1.5 0 0 1 .776-1.28zM12 2.659l7.442 4.548l-7.442 4.547l-7.442-4.547zM3.2 8.878v7.23l7.3 4.46V13.338zM13.5 20.569v-7.231l7.3-4.46v7.23z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-base font-bold text-white tracking-tight">UniStock</span>
        </div>
      </div>

      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpenMobile ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-dvh flex flex-col
          bg-[#0c1120] text-white
          border-r border-slate-800/60
          shadow-2xl shadow-black/40
          transition-all duration-300 ease-in-out
          w-64
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
        `}
      >
        {/* Logo — desktop only (mobile has the header) */}
        <Link
          href="/lojas"
          prefetch={false}
          className={`hidden lg:flex items-center gap-3 px-4 py-5 overflow-hidden whitespace-nowrap border-b border-slate-800/60 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/50">
            <Icons.Package />
          </div>
          {!isCollapsed && (
            <span className="text-[18px] font-bold tracking-tight text-white">
              UniStock
            </span>
          )}
        </Link>

        {/* Scrollable content — tudo rola junto no mobile */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overscroll-contain pt-16 lg:pt-0">
          {/* Perfil */}
          <Link href="/configuracoes/conta" onClick={closeMobile}>
            <div
              className={`flex items-center gap-3 px-4 py-4 overflow-hidden hover:bg-slate-800/30 transition-colors ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-slate-300">
                <Icons.UserCircle />
              </div>
              <div className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
                <span className="block text-[14px] font-semibold text-white truncate">
                  {user?.first_name || "Usuário"}
                </span>
                <span className="block text-[11px] text-slate-500 truncate">
                  {user?.group || ""}
                </span>
              </div>
            </div>
          </Link>

          {/* Divisor */}
          <div className="mx-4 border-t border-slate-800/60" />

          {/* NAVEGAÇÃO */}
          <nav className="flex-1 px-3 py-3">
            <p className={`mb-2 px-2 text-[10px] font-bold tracking-[0.12em] text-slate-600 uppercase ${isCollapsed ? "lg:hidden" : ""}`}>
              Navegação
            </p>
            <ul className="space-y-0.5">
              {menuItems.map((item) => {
                const IconComponent = Icons[item.icon];
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-lg py-2.5 transition-all duration-150 ${
                        isCollapsed ? "lg:justify-center lg:px-0" : ""
                      } px-3 ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-500" />
                      )}
                      <div className="shrink-0">
                        <IconComponent />
                      </div>
                      <span className={`text-[13.5px] font-medium whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {menuItems.length === 0 && (
                <li className={`px-3 py-3 text-[12px] text-slate-600 ${isCollapsed ? "lg:hidden" : ""}`}>
                  {hydrated ? "Nenhum item no menu" : "Carregando..."}
                </li>
              )}
            </ul>
          </nav>

          {/* RODAPÉ — dentro do scroll, sempre acessível */}
          <div className="border-t border-slate-800/60 p-3 mt-auto">
            <ul className={`mb-3 space-y-0.5 ${isCollapsed ? "lg:flex lg:flex-col lg:items-center" : ""}`}>
              {/* Notificações */}
              <li>
                <Link
                  href="/notificacoes"
                  prefetch={false}
                  className={`flex items-center gap-3 rounded-lg py-2 transition-all ${
                    isCollapsed ? "lg:justify-center lg:px-0" : ""
                  } px-3 ${
                    pathname === "/notificacoes"
                      ? "text-blue-400 bg-blue-600/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icons.Bell />
                    {temNotificacoes && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                  </div>
                  <span className={`text-[13px] ${isCollapsed ? "lg:hidden" : ""}`}>Notificações</span>
                </Link>
              </li>

              {/* Configurações */}
              <li>
                <Link
                  href="/configuracoes"
                  prefetch={false}
                  className={`flex items-center gap-3 rounded-lg py-2 transition-all ${
                    isCollapsed ? "lg:justify-center lg:px-0" : ""
                  } px-3 ${
                    pathname.startsWith("/configuracoes")
                      ? "text-blue-400 bg-blue-600/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="shrink-0">
                    <Icons.Settings />
                  </div>
                  <span className={`text-[13px] font-medium ${isCollapsed ? "lg:hidden" : ""}`}>Configurações</span>
                </Link>
              </li>

              {/* Sair */}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex w-full items-center gap-3 cursor-pointer text-[13px] text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/8 ${
                    isCollapsed ? "lg:justify-center lg:px-0" : ""
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Icons.LogOut />
                  <span className={isCollapsed ? "lg:hidden" : ""}>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                </button>
              </li>
            </ul>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800/80 bg-transparent py-2 text-[11px] font-medium text-slate-600 transition hover:bg-slate-800/40 hover:text-slate-400 uppercase tracking-widest"
            >
              {isCollapsed ? (
                <Icons.ChevronRight />
              ) : (
                <>
                  <Icons.ChevronLeft />
                  <span>Recolher</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
