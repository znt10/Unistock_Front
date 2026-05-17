"use client";

import React, { useState } from "react";
import Link from "next/link";
import { register } from "@/services/auth";
import {
  ArrowRightIcon,
  CubeIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await register(firstName, email, password, "gerente");
      setSuccess("Conta de gerente criada com sucesso. Faca login para continuar.");
      setFirstName("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-theme-base font-sans text-theme-text-title">
      <aside className="hidden w-1/2 items-center justify-center bg-theme-header px-10 lg:flex">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600">
              <CubeIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">UniStock</h1>
          </div>

          <div className="space-y-4 border-l-4 border-blue-600 pl-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
              Cadastro inicial
            </p>
            <p className="text-3xl font-bold leading-tight">
              Crie uma conta de gerente para administrar o sistema.
            </p>
            <p className="max-w-md text-sm leading-6 text-theme-text-sub">
              Depois de entrar, o gerente podera cadastrar responsaveis para as
              lojas pelo painel interno.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
              <CubeIcon className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Criar conta de gerente</h2>
            <p className="mt-2 text-sm text-theme-text-sub">
              Informe os dados do acesso principal.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold">
                  Nome completo
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Nome do gerente"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-lg border border-theme-border bg-theme-card py-3 pl-11 pr-4 text-theme-text-title outline-none transition placeholder:text-theme-text-sub focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold">
                  E-mail
                </label>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                  <input
                    id="email"
                    type="email"
                    placeholder="gerente@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-theme-border bg-theme-card py-3 pl-11 pr-4 text-theme-text-title outline-none transition placeholder:text-theme-text-sub focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold">
                  Senha
                </label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-theme-border bg-theme-card py-3 pl-11 pr-12 text-theme-text-title outline-none transition placeholder:text-theme-text-sub focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-sub transition hover:text-theme-text-title"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar conta"}
              <ArrowRightIcon className="h-5 w-5" />
            </button>

            <p className="text-center text-sm text-theme-text-sub">
              Ja possui uma conta?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Faca login
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
