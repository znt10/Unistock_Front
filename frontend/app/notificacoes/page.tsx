"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  excluirNotificacao,
  getNotificacoes,
  limparNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  type Notificacao,
} from "@/services/uni";

const Icons = {
  Bell: () => (
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Trash: () => (
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Settings: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const NOTIFICACOES_QUERY_KEY = ["notificacoes"];

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

export default function NotificacoesPage() {
  const queryClient = useQueryClient();
  const {
    data: notificacoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: NOTIFICACOES_QUERY_KEY,
    queryFn: getNotificacoes,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const atualizarLista = (updater: (notificacoes: Notificacao[]) => Notificacao[]) => {
    queryClient.setQueryData<Notificacao[]>(NOTIFICACOES_QUERY_KEY, (atual = []) =>
      updater(atual),
    );
  };

  const marcarLida = async (id: string) => {
    await marcarNotificacaoLida(id);
    atualizarLista((atual) =>
      atual.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
  };

  const marcarTodasLidas = async () => {
    await marcarTodasNotificacoesLidas();
    atualizarLista((atual) => atual.map((n) => ({ ...n, lida: true })));
  };

  const excluir = async (id: string) => {
    await excluirNotificacao(id);
    atualizarLista((atual) => atual.filter((n) => n.id !== id));
  };

  const limparTudo = async () => {
    await limparNotificacoes();
    queryClient.setQueryData<Notificacao[]>(NOTIFICACOES_QUERY_KEY, []);
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 lg:ml-64 transition-all relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto mt-10 relative z-10">
          <header className="mb-10 flex flex-col gap-5 md:flex-row md:justify-between md:items-end">
            <div>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[3px] mb-2 block">
                Central de Alertas
              </span>
              <h1 className="text-4xl font-black text-theme-text-title flex items-center gap-4 tracking-tighter uppercase">
                Notificacoes
                {naoLidas > 0 && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                    {naoLidas}
                  </span>
                )}
              </h1>
              <p className="text-theme-text-sub/60 font-medium mt-2">
                Avisos de pedidos e atualizacoes importantes do sistema.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {notificacoes.length > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub transition hover:border-blue-500/50 hover:text-blue-500"
                >
                  Marcar todas
                </button>
              )}
              <Link
                href="/configuracoes"
                className="p-3 rounded-2xl bg-theme-card border border-theme-border text-theme-text-sub hover:text-blue-500 hover:border-blue-500/50 transition-all hover:rotate-90 duration-500 shadow-sm"
              >
                <Icons.Settings />
              </Link>
            </div>
          </header>

          <div className="bg-theme-card border border-theme-border rounded-[32px] overflow-hidden shadow-xl transition-all">
            {isLoading && (
              <div className="p-20 text-center text-sm font-bold uppercase tracking-widest text-theme-text-sub/40">
                Carregando notificacoes...
              </div>
            )}

            {isError && (
              <div className="p-20 text-center text-sm font-bold uppercase tracking-widest text-red-500">
                Nao foi possivel carregar as notificacoes
              </div>
            )}

            {!isLoading && !isError && notificacoes.length > 0 && (
              <div className="divide-y divide-theme-border">
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className={`p-8 transition-all hover:bg-theme-hover group relative ${
                      n.lida ? "opacity-55" : "bg-theme-card"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <button
                        type="button"
                        className="flex items-start gap-6 flex-1 cursor-pointer text-left"
                        onClick={() => marcarLida(n.id)}
                      >
                        <div className="mt-1 relative">
                          <div
                            className={`${n.lida ? "text-theme-text-sub/30" : "text-blue-500"}`}
                          >
                            <Icons.Bell />
                          </div>
                          {!n.lida && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-theme-card rounded-full animate-pulse" />
                          )}
                        </div>

                        <div>
                          <h3
                            className={`text-lg font-black tracking-tight uppercase ${
                              n.lida
                                ? "text-theme-text-sub"
                                : "text-theme-text-title"
                            }`}
                          >
                            {n.titulo}
                          </h3>
                          <p className="text-theme-text-sub/80 mt-1 font-medium">
                            {n.mensagem}
                          </p>
                          <span className="text-[10px] font-bold text-theme-text-sub/40 mt-3 block uppercase tracking-wider">
                            {formatarData(n.criada_em)}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => excluir(n.id)}
                        className="p-2 text-theme-text-sub/20 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir notificacao"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && notificacoes.length === 0 && (
              <div className="p-20 text-center">
                <div className="text-theme-text-sub/20 flex justify-center mb-4">
                  <Icons.Bell />
                </div>
                <p className="text-theme-text-sub/40 font-bold uppercase tracking-widest text-sm">
                  Nenhuma notificacao por aqui
                </p>
              </div>
            )}
          </div>

          {notificacoes.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={limparTudo}
                className="text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/40 hover:text-red-500 transition-colors"
              >
                Limpar todo o historico
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
