"use client";

import React, { useState } from "react";
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

const NOTIFICACOES_QUERY_KEY = ["notificacoes"];

const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
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
);

const SettingsIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 1 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const StoreIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
  </svg>
);

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

type GrupoLoja = {
  loja_id: string | null;
  loja_nome: string;
  notificacoes: Notificacao[];
  naoLidas: number;
};

function agruparPorLoja(notificacoes: Notificacao[]): GrupoLoja[] {
  const mapa = new Map<string, GrupoLoja>();

  for (const n of notificacoes) {
    const chave = n.loja_id ?? "__sem_loja__";
    const nome = n.loja_nome ?? "Geral";

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        loja_id: n.loja_id,
        loja_nome: nome,
        notificacoes: [],
        naoLidas: 0,
      });
    }

    const grupo = mapa.get(chave)!;
    grupo.notificacoes.push(n);
    if (!n.lida) grupo.naoLidas++;
  }

  return Array.from(mapa.values()).sort((a, b) => b.naoLidas - a.naoLidas);
}

function NotificacaoItem({
  n,
  onMarcarLida,
  onExcluir,
}: {
  n: Notificacao;
  onMarcarLida: (id: string) => void;
  onExcluir: (id: string) => void;
}) {
  const tipoConfig = {
    estoque_baixo: {
      cor: "text-amber-400",
      bg: "bg-amber-500/10",
      borda: "border-amber-500/20",
    },
    novo_pedido: {
      cor: "text-blue-400",
      bg: "bg-blue-500/10",
      borda: "border-blue-500/20",
    },
    pedido_criado: {
      cor: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borda: "border-emerald-500/20",
    },
  }[n.tipo] ?? {
    cor: "text-theme-text-sub",
    bg: "bg-theme-hover",
    borda: "border-theme-border",
  };

  return (
    <div
      className={`group flex items-start gap-6 rounded-2xl border p-7 transition-all ${
        n.lida
          ? "border-theme-border bg-transparent opacity-50"
          : `${tipoConfig.borda} ${tipoConfig.bg}`
      }`}
    >
      <button
        onClick={() => onMarcarLida(n.id)}
        className="mt-0.5 shrink-0 cursor-pointer"
        title="Marcar como lida"
      >
        <div
          className={`relative ${n.lida ? "text-theme-text-sub/20" : tipoConfig.cor}`}
        >
          <BellIcon size={26} />
          {!n.lida && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
          )}
        </div>
      </button>

      <button
        onClick={() => onMarcarLida(n.id)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={`text-lg font-black uppercase tracking-tight ${n.lida ? "text-theme-text-sub/50" : "text-theme-text-title"}`}
        >
          {n.titulo}
        </p>
        <p className="mt-2 text-xl font-medium text-theme-text-sub/70 leading-relaxed">
          {n.mensagem}
        </p>
        <span className="mt-3 block text-sm font-bold uppercase tracking-wider text-theme-text-sub/30">
          {formatarData(n.criada_em)}
        </span>
      </button>

      <button
        onClick={() => onExcluir(n.id)}
        className="shrink-0 p-1.5 text-theme-text-sub/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Excluir"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function NotificacoesPage() {
  const queryClient = useQueryClient();
  const [lojaAtiva, setLojaAtiva] = useState<string | null>(null);

  const {
    data: notificacoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: NOTIFICACOES_QUERY_KEY,
    queryFn: getNotificacoes,
    refetchOnWindowFocus: true,
  });

  const grupos = agruparPorLoja(notificacoes);
  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length;

  // Seleciona a primeira loja com não lidas se nenhuma estiver ativa
  const lojaAtivaEfetiva =
    lojaAtiva ??
    grupos.find((g) => g.naoLidas > 0)?.loja_id ??
    grupos[0]?.loja_id ??
    null;

  const grupoAtivo =
    grupos.find((g) => g.loja_id === lojaAtivaEfetiva) ?? grupos[0];

  const atualizarLista = (updater: (n: Notificacao[]) => Notificacao[]) => {
    queryClient.setQueryData<Notificacao[]>(
      NOTIFICACOES_QUERY_KEY,
      (atual = []) => updater(atual),
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

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base text-theme-text-sub font-sans antialiased transition-colors duration-300">
      <Sidebar />

      <main className="relative min-w-0 flex-1 p-5 pt-20 transition-all sm:p-6 lg:ml-64 lg:pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 mx-auto mt-4 max-w-5xl lg:mt-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:justify-between md:items-end">
            <div>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[3px] mb-2 block">
                Central de Alertas
              </span>
              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-black tracking-tighter text-theme-text-title uppercase sm:text-4xl">
                Notificacoes
                {totalNaoLidas > 0 && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                    {totalNaoLidas}
                  </span>
                )}
              </h1>
              <p className="text-theme-text-sub/60 font-medium mt-2">
                Avisos organizados por loja.
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
                className="p-3 rounded-2xl bg-theme-card border border-theme-border text-theme-text-sub hover:text-blue-500 hover:border-blue-500/50 transition-all hover:rotate-90 duration-500"
              >
                <SettingsIcon />
              </Link>
            </div>
          </header>

          {isLoading && (
            <div className="p-20 text-center text-sm font-bold uppercase tracking-widest text-theme-text-sub/40">
              Carregando...
            </div>
          )}

          {isError && (
            <div className="p-20 text-center text-sm font-bold uppercase tracking-widest text-red-500">
              Nao foi possivel carregar as notificacoes
            </div>
          )}

          {!isLoading && !isError && notificacoes.length === 0 && (
            <div className="rounded-[28px] border border-theme-border bg-theme-card p-20 text-center">
              <div className="text-theme-text-sub/20 flex justify-center mb-4">
                <BellIcon size={32} />
              </div>
              <p className="text-theme-text-sub/40 font-bold uppercase tracking-widest text-sm">
                Nenhuma notificacao por aqui
              </p>
            </div>
          )}

          {!isLoading && !isError && grupos.length > 0 && (
            <div className="flex gap-5 items-start">
              {/* Sidebar de lojas */}
              <div className="w-72 shrink-0 flex flex-col gap-2">
                {grupos.map((grupo) => {
                  const ativa = grupo.loja_id === lojaAtivaEfetiva;
                  return (
                    <button
                      key={grupo.loja_id ?? "__sem_loja__"}
                      onClick={() => setLojaAtiva(grupo.loja_id)}
                      className={`group w-full flex items-center gap-3 rounded-2xl border px-5 py-5 text-left transition-all ${
                        ativa
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                          : "border-theme-border bg-theme-card text-theme-text-sub hover:border-blue-500/20 hover:text-theme-text-title"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${ativa ? "text-blue-400" : "text-theme-text-sub/40"}`}
                      >
                        <StoreIcon />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-base font-black uppercase tracking-wide">
                        {grupo.loja_nome}
                      </span>
                      {grupo.naoLidas > 0 && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                            ativa
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {grupo.naoLidas}
                        </span>
                      )}
                    </button>
                  );
                })}

                {notificacoes.length > 0 && (
                  <button
                    onClick={limparTudo}
                    className="mt-2 w-full rounded-2xl border border-red-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[2px] text-theme-text-sub/30 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              {/* Painel de notificações */}
              <div className="min-w-0 flex-1">
                {grupoAtivo ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-theme-text-sub/40">
                          <StoreIcon />
                        </span>
                        <h2 className="text-sm font-black uppercase tracking-[2px] text-theme-text-title">
                          {grupoAtivo.loja_nome}
                        </h2>
                        <span className="text-xs font-bold text-theme-text-sub/30">
                          — {grupoAtivo.notificacoes.length}{" "}
                          {grupoAtivo.notificacoes.length === 1
                            ? "notificacao"
                            : "notificacoes"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {grupoAtivo.notificacoes.map((n) => (
                        <NotificacaoItem
                          key={n.id}
                          n={n}
                          onMarcarLida={marcarLida}
                          onExcluir={excluir}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[28px] border border-theme-border bg-theme-card p-16 text-center">
                    <p className="text-theme-text-sub/40 font-bold uppercase tracking-widest text-sm">
                      Selecione uma loja
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
