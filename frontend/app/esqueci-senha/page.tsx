"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { esqueciSenha } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await esqueciSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar o link.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-theme-base font-sans text-theme-text-title">
      <aside className="hidden w-1/2 items-center justify-center bg-theme-header px-10 lg:flex">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600">
              <CubeIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">UniStock</h1>
          </div>

          <div className="space-y-4 border-l-4 border-cyan-500 pl-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-500">
              Recuperação de acesso
            </p>
            <p className="text-3xl font-bold leading-tight">
              Primeiro confirme o e-mail da conta.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
              <EnvelopeIcon className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Esqueci minha senha</h2>
            <p className="mt-2 text-sm text-theme-text-sub">
              Digite o e-mail para continuar.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold">
                E-mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-theme-border bg-theme-card py-3 pl-11 pr-4 text-theme-text-title outline-none transition placeholder:text-theme-text-sub focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {enviado && (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500">
                Se este e-mail estiver cadastrado, enviamos o link para
                definir a senha. Confira a caixa de entrada.
              </p>
            )}
            {erro && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar link"}
              <ArrowRightIcon className="h-5 w-5" />
            </button>

            <Link
              href="/login"
              className="mx-auto inline-flex items-center gap-2 text-theme-text-sub transition-all hover:text-blue-500 group"
            >
              <span className="flex items-center justify-center rounded-lg border border-theme-border bg-theme-header p-1.5 shadow-sm transition group-hover:bg-theme-hover">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[2px]">Voltar para login</span>
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
