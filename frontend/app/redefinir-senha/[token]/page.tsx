"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CubeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { definirSenha } from "@/services/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // 8 e o minimo do MinimumLengthValidator do Django. Avisar 6 aqui so
    // empurrava o erro pro servidor, que devolve a mensagem certa tarde demais.
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setSalvando(true);
    try {
      await definirSenha(params.token, password);
      setSuccess(true);
      // Deixa a mensagem de sucesso aparecer antes de sair da tela.
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao definir a senha.");
    } finally {
      setSalvando(false);
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

          <div className="space-y-4 border-l-4 border-emerald-500 pl-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
              Nova senha
            </p>
            <p className="text-3xl font-bold leading-tight">
              Defina uma senha segura para voltar ao sistema.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
              <LockClosedIcon className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Redefinir senha</h2>
            <p className="mt-2 text-sm text-theme-text-sub">
              Crie uma nova senha para acessar sua conta.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold">
                  Nova senha
                </label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirmar senha
                </label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-text-sub" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-theme-border bg-theme-card py-3 pl-11 pr-12 text-theme-text-title outline-none transition placeholder:text-theme-text-sub focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-sub transition hover:text-theme-text-title"
                  >
                    {showConfirmPassword ? (
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
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircleIcon className="h-5 w-5 flex-none" />
                Senha validada com sucesso.
              </div>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar senha"}
              <CheckCircleIcon className="h-5 w-5" />
            </button>

            <Link
              href="/esqueci-senha"
              className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-theme-text-sub transition hover:text-theme-text-title"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Alterar e-mail
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
