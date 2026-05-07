"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth";
import { getLoja } from "@/services/uni";

// Importando os ícones de olho
import { CubeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const router = useRouter();
  const [tipo_usuario, setTipo_usuario] = useState("gerente");
  const [first_name, setFirst_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Novo estado para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false);

  // --- ESTADOS DE LOJA ---
  const [lojas, setLojas] = useState<any[]>([]); // Tipagem genérica para evitar erros de propriedade
  const [id_loja, setId_loja] = useState("");
  const [loadingLojas, setLoadingLojas] = useState(false);

  // --- BUSCA AS LOJAS AO CARREGAR ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const data = await getLoja();

        if (data && Array.isArray(data)) {
          setLojas(data);
        } else if (data && data.results && Array.isArray(data.results)) {
          setLojas(data.results);
        } else {
          console.error("Formato de dados inválido:", data);
          setLojas([]);
        }
      } catch (err) {
        console.error("Falha ao buscar lojas:", err);
        setLojas([]);
      } finally {
        setLoadingLojas(false);
      }
    }
    carregarDados();
  }, []);

  const fields = [
    {
      id: "name",
      label: "Nome completo",
      type: "text",
      placeholder: "Seu nome completo",
    },
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
      placeholder: "Sua senha",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tipo_usuario === "responsavel" && !id_loja) {
      setError("Por favor, selecione uma loja.");
      return;
    }

    setLoading(true);

    try {
      await register(first_name, email, password, tipo_usuario, id_loja);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">
      {/* LADO ESQUERDO */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-[#020617] lg:flex">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1d4ed8]">
            <CubeIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-white">
            UniStock
          </h1>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <header className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1d4ed8]">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">UniStock</span>
            </div>
            <h2 className="text-2xl font-bold text-black">Crie sua conta</h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Tipo de Usuário */}
            <div className="flex w-full overflow-hidden rounded-lg border border-slate-300 mb-8">
              <button
                type="button"
                onClick={() => {
                  setTipo_usuario("gerente");
                  setId_loja("");
                }}
                className={`w-1/2 py-2.5 text-sm font-medium transition-all ${
                  tipo_usuario === "gerente"
                    ? "bg-[#4466f2] text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Gerente
              </button>
              <button
                type="button"
                onClick={() => setTipo_usuario("responsavel")}
                className={`w-1/2 py-2.5 text-sm font-medium transition-all ${
                  tipo_usuario === "responsavel"
                    ? "bg-[#4466f2] text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Responsável
              </button>
            </div>

            <div className="space-y-5">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={field.id} className="text-sm font-semibold">
                    {field.label}
                  </label>

                  {/* Container relativo para posicionar o ícone da senha */}
                  <div className="relative">
                    <input
                      id={field.id}
                      type={
                        field.id === "password" && showPassword
                          ? "text"
                          : field.type
                      }
                      placeholder={field.placeholder}
                      value={
                        field.id === "name"
                          ? first_name
                          : field.id === "email"
                            ? email
                            : password
                      }
                      onChange={(e) => {
                        if (field.id === "name") setFirst_name(e.target.value);
                        if (field.id === "email") setEmail(e.target.value);
                        if (field.id === "password")
                          setPassword(e.target.value);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-12"
                      required
                    />

                    {/* Renderiza o botão de mostrar senha apenas no campo de senha */}
                    {field.id === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
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

              {/* --- CAMPO CONDICIONAL DE LOJA --- */}
              {tipo_usuario === "responsavel" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold">
                    Selecione sua Loja
                  </label>
                  <select
                    id="loja"
                    value={id_loja}
                    onChange={(e) => setId_loja(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-black"
                  >
                    <option value="" className="text-black bg-white">
                      {loadingLojas
                        ? "Carregando lojas..."
                        : "Selecione uma loja"}
                    </option>
                    {Array.isArray(lojas) &&
                      lojas.map((loja: any) => (
                        <option
                          key={loja.id}
                          value={loja.id}
                          className="text-black bg-white"
                        >
                          {/* Prevenção: Tenta usar loja.nome, se não existir, tenta loja.name */}
                          {loja.nome_loja ||
                            loja.nome_loja ||
                            `Loja sem nome (${loja.id})`}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-12">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4466f2] py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Carregando..." : "Continuar"}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              Já possui uma conta?{" "}
              <Link
                href="/"
                className="font-bold text-blue-600 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
