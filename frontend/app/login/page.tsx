"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";

import { CubeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginFields = [
    {
      id: "email",
      label: "E-mail",
      type: "email",
      placeholder: "seu@email.com",
    },
    {
      id: "password",
      label: "Senha",
      type: "password",
      placeholder: "Digite sua senha",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);

      router.push("/lojas");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-theme-base text-theme-text-title font-sans">
      {/* LADO ESQUERDO */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-theme-header lg:flex">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600">
            <CubeIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold tracking-tight">UniStock</h1>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <header className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">UniStock</span>
            </div>

            <h2 className="text-2xl font-bold">Entre na sua conta</h2>

            <p className="mt-2 text-sm text-theme-text-sub">
              Insira suas credenciais para acessar o sistema
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {loginFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={field.id}
                    className="text-sm font-semibold text-theme-text-title"
                  >
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      id={field.id}
                      data-testid={field.id}
                      type={
                        field.id === "password" && showPassword
                          ? "text"
                          : field.type
                      }
                      placeholder={field.placeholder}
                      value={field.id === "email" ? email : password}
                      onChange={(e) =>
                        field.id === "email"
                          ? setEmail(e.target.value)
                          : setPassword(e.target.value)
                      }
                      className="w-full rounded-lg border border-theme-border bg-theme-card text-theme-text-title px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-theme-text-sub"
                    />

                    {field.id === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-sub hover:text-theme-text-title transition"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Extras */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-theme-border text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-theme-text-sub group-hover:text-theme-text-title transition">
                  Lembrar de mim
                </span>
              </label>

              <Link
                href="/esqueci-senha"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="mt-12">
              <button
                type="submit"
                data-testid="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Continuar"}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
