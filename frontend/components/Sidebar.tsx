"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout, register } from "@/services/auth";
import { getLoja } from "@/services/uni";
import { useAuthStore } from "@/stores/authStore";

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

type MenuItem =
  | { href: string; label: string; icon: IconKey; action?: never }
  | {
      action: "createResponsible";
      label: string;
      icon: IconKey;
      href?: never;
    };

type LojaOption = {
  id: number | string;
  nome?: string;
  nome_loja?: string;
  name?: string;
};

const MENU_CONFIG: Record<
  string,
  MenuItem[]
> = {
  Gerente: [
    { href: "/dashboard", label: "Painel Geral", icon: "Painel" },
    { href: "/lojas", label: "Gerenciar Lojas", icon: "Store" },
    { href: "/novopedido", label: "Novo Pedido", icon: "Plus" },
    { href: "/Painel_unidade", label: "Painel unidade", icon: "List" },
    {
      action: "createResponsible",
      label: "Criar responsável",
      icon: "UserCircle",
    },
  ],
  Responsavel: [
    { href: "/novopedido", label: "Novo Pedido", icon: "Plus" },
    { href: "/meuspedidos", label: "Meus Pedidos", icon: "List" },
  ],
};

export default function Sidebar() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResponsibleFormOpen, setIsResponsibleFormOpen] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [responsiblePassword, setResponsiblePassword] = useState("");
  const [responsibleLoja, setResponsibleLoja] = useState("");
  const [responsibleError, setResponsibleError] = useState<string | null>(null);
  const [responsibleSuccess, setResponsibleSuccess] = useState<string | null>(
    null,
  );
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [submittingResponsible, setSubmittingResponsible] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/registrar" ||
    pathname === "/esqueci-senha" ||
    pathname === "/redefinir-senha";
  useEffect(() => {
    if (!hydrated || user || isPublicRoute || isLoggingOut) return;

    getMe()
      .then((userInfo) => {
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          first_name: userInfo.first_name,
          group: userInfo.group,
          loja_id: userInfo.loja?.id ?? null,
          loja_nome: userInfo.loja?.nome ?? null,
        });
      })
      .catch(() => {
        router.push("/login");
      });
  }, [hydrated, isLoggingOut, isPublicRoute, router, setUser, user]);

  useEffect(() => {
    if (!isResponsibleFormOpen) return;

    async function carregarLojas() {
      setLoadingLojas(true);

      try {
        const data = await getLoja();
        setLojas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Falha ao buscar lojas:", err);
        setLojas([]);
      } finally {
        setLoadingLojas(false);
      }
    }

    carregarLojas();
  }, [isResponsibleFormOpen]);

  // Pega o grupo do usuário e renderiza o menu correto
  const role = user?.group ?? "";
  const menuItems = MENU_CONFIG[role] || [];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  const resetResponsibleForm = () => {
    setResponsibleName("");
    setResponsibleEmail("");
    setResponsiblePassword("");
    setResponsibleLoja("");
  };

  const openResponsibleForm = () => {
    setResponsibleError(null);
    setResponsibleSuccess(null);
    setIsResponsibleFormOpen(true);
    setIsOpenMobile(false);
  };

  const closeResponsibleForm = () => {
    if (submittingResponsible) return;
    setIsResponsibleFormOpen(false);
  };

  const handleResponsibleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponsibleError(null);
    setResponsibleSuccess(null);

    if (!responsibleLoja) {
      setResponsibleError("Selecione uma loja para o responsável.");
      return;
    }

    setSubmittingResponsible(true);

    try {
      await register(
        responsibleName,
        responsibleEmail,
        responsiblePassword,
        "responsavel",
        responsibleLoja,
      );
      setResponsibleSuccess("Responsável cadastrado com sucesso.");
      resetResponsibleForm();
    } catch (err: unknown) {
      setResponsibleError(
        err instanceof Error ? err.message : "Erro ao cadastrar responsável.",
      );
    } finally {
      setSubmittingResponsible(false);
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
        {/* Logo */}
        <Link
          href="/dashboard"
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
              const isAction = "action" in item;
              const isActive = !isAction && pathname === item.href;

              if (isAction) {
                return (
                  <li key={item.action}>
                    <button
                      type="button"
                      onClick={openResponsibleForm}
                      className={`flex w-full items-center gap-3 rounded-lg py-3 text-left transition-all ${
                        isCollapsed ? "justify-center" : "px-4"
                      } text-slate-400 hover:bg-slate-800/40 hover:text-white`}
                    >
                      <div className="shrink-0">
                        <IconComponent />
                      </div>
                      {!isCollapsed && (
                        <span className="text-[15px] font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg py-3 transition-all ${
                      isCollapsed ? "justify-center" : "px-4"
                    } ${
                      isActive
                        ? "bg-[#1d4ed8] text-white shadow-lg"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                    }`}
                  >
                    <div className="shrink-0">
                      <IconComponent />
                    </div>
                    {!isCollapsed && (
                      <span className="text-[15px] font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
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
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
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

            {/* Sair */}
            <li>
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 cursor-pointer text-[14px] text-slate-400 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-red-500/10 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <Icons.LogOut /> {!isCollapsed && "Sair"}
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

      {isResponsibleFormOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-card p-6 text-theme-text-title shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-header/60 p-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[3px] text-blue-500">
                  Gestão de usuários
                </span>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Criar responsável
                </h2>
                <p className="mt-1 text-sm leading-6 text-theme-text-sub">
                  Cadastre o responsável e vincule a uma loja.
                </p>
              </div>

              <button
                type="button"
                onClick={closeResponsibleForm}
                className="rounded-lg border border-theme-border bg-theme-header p-2 text-theme-text-sub transition hover:text-theme-text-title"
                aria-label="Fechar formulário"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={handleResponsibleSubmit} className="space-y-6">
              <div className="border-b border-theme-border pb-3">
                <h3 className="text-sm font-black uppercase tracking-[2px] text-theme-text-title">
                  Dados do responsável
                </h3>
                <p className="mt-1 text-sm text-theme-text-sub">
                  Informe identificação e credenciais de acesso.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="responsible-name" className="text-sm font-bold">
                  Nome completo
                </label>
                <input
                  id="responsible-name"
                  type="text"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="responsible-email"
                    className="text-sm font-bold"
                  >
                    E-mail
                  </label>
                  <input
                    id="responsible-email"
                    type="email"
                    value={responsibleEmail}
                    onChange={(e) => setResponsibleEmail(e.target.value)}
                    placeholder="responsavel@email.com"
                    className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="responsible-password"
                    className="text-sm font-bold"
                  >
                    Senha inicial
                  </label>
                  <input
                    id="responsible-password"
                    type="password"
                    value={responsiblePassword}
                    onChange={(e) => setResponsiblePassword(e.target.value)}
                    placeholder="Crie uma senha"
                    className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-theme-border pt-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[2px] text-theme-text-title">
                    Vínculo com loja
                  </h3>
                  <p className="mt-1 text-sm text-theme-text-sub">
                    Escolha a unidade que esse responsável poderá operar.
                  </p>
                </div>
                <label htmlFor="responsible-loja" className="text-sm font-bold">
                  Loja vinculada
                </label>
                <select
                  id="responsible-loja"
                  value={responsibleLoja}
                  onChange={(e) => setResponsibleLoja(e.target.value)}
                  className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">
                    {loadingLojas
                      ? "Carregando lojas..."
                      : lojas.length
                        ? "Selecione uma loja"
                        : "Nenhuma loja disponível"}
                  </option>
                  {lojas.map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome_loja ||
                        loja.nome ||
                        loja.name ||
                        `Loja ${loja.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {responsibleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {responsibleError}
                </div>
              )}

              {responsibleSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {responsibleSuccess}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-theme-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeResponsibleForm}
                  className="rounded-lg border border-theme-border bg-theme-header px-5 py-3 text-sm font-bold text-theme-text-sub transition hover:text-theme-text-title"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingResponsible}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {submittingResponsible
                    ? "Cadastrando..."
                    : "Cadastrar responsável"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
