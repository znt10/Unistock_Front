"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/services/auth";
import { getNotificacoes } from "@/services/uni";
import { useAuthStore, selectIsAdmin } from "@/stores/authStore";

const Icons = {
  // Ícone ESTILO HERO UI (Cubo Isométrico)
  Package: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M11.218.878a1.5 1.5 0 0 1 1.564 0l8.742 5.342A1.5 1.5 0 0 1 22.3 7.5v8.608a1.5 1.5 0 0 1-.776 1.28l-8.742 5.342a1.5 1.5 0 0 1-1.564 0l-8.742-5.342A1.5 1.5 0 0 1 1.7 16.108V7.5a1.5 1.5 0 0 1 .776-1.28zM12 2.659l7.442 4.548l-7.442 4.547l-7.442-4.547zM3.2 8.878v7.23l7.3 4.46V13.338zM13.5 20.569v-7.231l7.3-4.46v7.23z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Store: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  CashRegister: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h16" />
      <path d="M5 10V6a2 2 0 0 1 2-2h5l2 6" />
      <rect width="18" height="10" x="3" y="10" rx="2" />
      <path d="M7 15h.01" />
      <path d="M11 15h2" />
      <path d="M16 15h1" />
    </svg>
  ),

  Painel: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  UserCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  ),
  Settings: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  LogOut: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Menu: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Eye: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  List: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  ),
};

type IconKey = keyof typeof Icons;

type MenuItem = { href: string; label: string; icon: IconKey };

const NOTIFICACOES_QUERY_KEY = ["notificacoes"];

const MENU_CONFIG: Record<string, MenuItem[]> = {
  Gerente: [
    { href: "/lojas", label: "Gerenciar Lojas", icon: "Store" },
    { href: "/estoque", label: "Controle Estoque", icon: "Package" },
    { href: "/caixa", label: "Caixa PDV", icon: "CashRegister" },
    { href: "/produtos/novo", label: "Cadastrar Produto", icon: "Plus" },
    { href: "/novopedido", label: "Novo Pedido", icon: "Plus" },
    { href: "/painel_unidade", label: "Painel unidade", icon: "List" },
    { href: "/historico", label: "Historico", icon: "List" },
  ],
  Responsavel: [
    { href: "/novopedido", label: "Novo Pedido", icon: "Plus" },
    { href: "/meuspedidos", label: "Meus Pedidos", icon: "List" },
    { href: "/estoque", label: "Controle Estoque", icon: "Package" },
    { href: "/caixa", label: "Caixa PDV", icon: "CashRegister" },
    { href: "/historico", label: "Historico", icon: "List" },
  ],
};

const normalizeRole = (role?: string) => {
  const normalized = role
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
  const [visitorDropdownOpen, setVisitorDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const visitorRole = useAuthStore((state) => state.visitorRole);
  const enterVisitorMode = useAuthStore((state) => state.enterVisitorMode);
  const exitVisitorMode = useAuthStore((state) => state.exitVisitorMode);
  const isAdmin = useAuthStore(selectIsAdmin);
  const { data: notificacoes = [] } = useQuery({
    queryKey: NOTIFICACOES_QUERY_KEY,
    queryFn: getNotificacoes,
    enabled: hydrated && Boolean(user),
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const effectiveGroup = visitorRole ?? user?.group;
  const role = normalizeRole(effectiveGroup);
  const menuItems = MENU_CONFIG[role] || [];
  const temNotificacoes = notificacoes.length > 0;

  const VISITOR_ROLES = [
    { key: "Gerente", label: "Gerente" },
    { key: "Responsavel", label: "Responsável" },
  ];

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
      {/* Botão Mobile */}
      <button
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-[#1d4ed8] p-2 text-white shadow-lg lg:hidden"
      >
        {isOpenMobile ? <Icons.X /> : <Icons.Menu />}
      </button>

      {/* Overlay Mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 z-40 h-screen bg-[#080b11] text-white shadow-xl transition-all duration-300 ease-in-out
        ${isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} 
        w-64 flex flex-col
      `}
      >
        {/* Banner Modo Visitante */}
        {visitorRole && (
          <div className="flex items-center justify-between gap-2 bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Icons.Eye />
              {!isCollapsed && (
                <span className="text-[12px] font-semibold text-amber-400 whitespace-nowrap truncate">
                  Visitante: {visitorRole}
                </span>
              )}
            </div>
            <button
              onClick={() => { exitVisitorMode(); router.push("/lojas"); }}
              className="shrink-0 text-amber-400 hover:text-amber-200 transition-colors"
              title="Sair do modo visitante"
            >
              <Icons.X />
            </button>
          </div>
        )}

        {/* Logo */}
        <Link
          href="/lojas"
          prefetch={false}
          className="flex items-center gap-3 border-b border-slate-800/50 p-5 overflow-hidden whitespace-nowrap"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#1d4ed8] text-white">
            <Icons.Package />
          </div>
          {!isCollapsed && (
            <span className="text-2xl font-bold tracking-tight">UniStock</span>
          )}
        </Link>

        {/* Perfil */}
        <Link href="">
          <div
            className={`flex items-center gap-3 px-6 py-6 text-slate-300 overflow-hidden ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <div className="shrink-0">
              <Icons.UserCircle />
            </div>
            {!isCollapsed && (
              <span className="text-[17px] font-semibold text-white whitespace-nowrap">
                {user?.first_name || "Usuario"}
              </span>
            )}
          </div>
        </Link>

        {/* NAVEGAÇÃO DINÂMICA (Baseada no cargo: Gerente / Responsavel) */}
        <nav className="flex-1 px-3">
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase">
              Menu
            </p>
          )}
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Chama o ícone correspondente de forma dinâmica
              const IconComponent = Icons[item.icon];
              const isActive = pathname === item.href;
              const itemClassName = `flex items-center gap-3 rounded-lg py-3 transition-all ${
                isCollapsed ? "justify-center" : "px-4"
              } ${
                isActive
                  ? "bg-[#1d4ed8] text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`;
              const itemContent = (
                <>
                  <div className="shrink-0">
                    <IconComponent />
                  </div>
                  {!isCollapsed && (
                    <span className="text-[15px] font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </>
              );

              return (
                <li key={item.href}>
                  {isActive ? (
                    <div className={itemClassName} aria-current="page">
                      {itemContent}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      prefetch={false}
                      className={itemClassName}
                    >
                      {itemContent}
                    </Link>
                  )}
                </li>
              );
            })}
            {menuItems.length === 0 && !isCollapsed && (
              <li className="px-4 py-3 text-[13px] font-medium text-slate-500">
                {hydrated ? "Carregando menu..." : "Carregando..."}
              </li>
            )}
          </ul>
        </nav>

        {/* RODAPÉ FIXO (Notificações, Configurações e Sair - INTACTOS) */}
        <div className="w-full border-t border-slate-800/50 p-4 bg-[#080b11]">
          <ul
            className={`mb-4 space-y-1 ${
              isCollapsed ? "flex flex-col items-center" : ""
            }`}
          >
            {/* ITEM NOTIFICAÇÕES */}
            <li>
              <Link
                href="/notificacoes"
                prefetch={false}
                className={`flex items-center gap-3 rounded-lg py-2.5 transition-all ${
                  isCollapsed ? "justify-center" : "px-3"
                } ${
                  pathname === "/notificacoes"
                    ? "text-white bg-blue-600/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <div className="relative shrink-0">
                  <Icons.Bell />
                  {temNotificacoes && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[14px]">Notificações</span>
                )}
              </Link>
            </li>

            {/* Configurações */}
            <li>
              <Link
                href="/configuracoes"
                prefetch={false}
                className={`flex items-center gap-3 rounded-lg py-2.5 transition-all ${
                  isCollapsed ? "justify-center" : "px-3"
                } ${
                  pathname === "/configuracoes"
                    ? "text-white bg-blue-600/10 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <div className="shrink-0">
                  <Icons.Settings />
                </div>
                {!isCollapsed && (
                  <span className="text-[14px] font-medium">Configurações</span>
                )}
              </Link>
            </li>

            {/* Modo Visitante (apenas admin) */}
            {isAdmin && (
              <li className="relative">
                {visitorRole ? (
                  <button
                    onClick={() => { exitVisitorMode(); router.push("/lojas"); }}
                    className={`flex w-full items-center gap-3 rounded-lg py-2.5 transition-all text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 ${
                      isCollapsed ? "justify-center" : "px-3"
                    }`}
                    title="Sair do modo visitante"
                  >
                    <Icons.EyeOff />
                    {!isCollapsed && (
                      <span className="text-[14px]">Sair do modo visitante</span>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setVisitorDropdownOpen((v) => !v)}
                      className={`flex w-full items-center gap-3 rounded-lg py-2.5 transition-all text-slate-300 hover:text-white hover:bg-slate-800/40 ${
                        isCollapsed ? "justify-center" : "px-3"
                      }`}
                      title="Entrar como visitante"
                    >
                      <Icons.Eye />
                      {!isCollapsed && (
                        <span className="text-[14px]">Modo visitante</span>
                      )}
                    </button>
                    {visitorDropdownOpen && !isCollapsed && (
                      <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg border border-slate-700 bg-[#0f1623] shadow-xl overflow-hidden z-50">
                        <p className="px-3 py-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          Visualizar como
                        </p>
                        {VISITOR_ROLES.map((r) => (
                          <button
                            key={r.key}
                            onClick={() => {
                              enterVisitorMode(r.key);
                              setVisitorDropdownOpen(false);
                              router.push("/lojas");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-[14px] text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                          >
                            <Icons.Eye />
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </li>
            )}

            {/* Sair */}
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex w-full items-center gap-3 cursor-pointer text-[14px] text-slate-400 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-red-500/10 ${
                  isCollapsed ? "justify-center" : ""
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Icons.LogOut />{" "}
                {!isCollapsed && (isLoggingOut ? "Saindo..." : "Sair")}
              </button>
            </li>
          </ul>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-3 rounded-lg border border-slate-800 bg-transparent py-2.5 text-[12px] font-medium text-slate-400 transition hover:bg-slate-800/40 uppercase tracking-tighter"
          >
            {isCollapsed ? (
              <Icons.ChevronRight />
            ) : (
              <>
                <Icons.ChevronLeft /> Recolher
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
