"use client";

import React, { useEffect, useState } from "react";
import { register } from "@/services/auth";
import { getLoja } from "@/services/uni";

type TipoUsuario = "gerente" | "responsavel";

type LojaOption = {
  id: number | string;
  nome?: string;
  nome_loja?: string;
  name?: string;
};

type Props = {
  tipo: TipoUsuario;
  onCancel?: () => void;
  onSuccess?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
};

const textos = {
  gerente: {
    tituloSecao: "Dados do gerente",
    ajuda: "Informe identificacao e credenciais de acesso.",
    nomePlaceholder: "Nome do gerente",
    emailPlaceholder: "gerente@email.com",
    sucesso: "Gerente cadastrado com sucesso.",
    submit: "Cadastrar gerente",
    loading: "Cadastrando gerente...",
  },
  responsavel: {
    tituloSecao: "Dados do responsavel",
    ajuda: "Informe identificacao, credenciais e loja vinculada.",
    nomePlaceholder: "Nome do responsavel",
    emailPlaceholder: "responsavel@email.com",
    sucesso: "Responsavel cadastrado com sucesso.",
    submit: "Cadastrar responsavel",
    loading: "Cadastrando responsavel...",
  },
};

export default function CadastroUsuarioForm({
  tipo,
  onCancel,
  onSuccess,
  submitLabel,
  cancelLabel = "Cancelar",
  showCancel = false,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loja, setLoja] = useState("");
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const precisaLoja = tipo === "responsavel";
  const texto = textos[tipo];

  useEffect(() => {
    if (!precisaLoja) return;

    async function carregarLojas() {
      setLoadingLojas(true);

      try {
        const data = await getLoja();
        setLojas(Array.isArray(data) ? data : data?.results || []);
      } catch {
        setLojas([]);
      } finally {
        setLoadingLojas(false);
      }
    }

    carregarLojas();
  }, [precisaLoja]);

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setLoja("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (precisaLoja && !loja) {
      setError("Selecione uma loja para o responsavel.");
      return;
    }

    setLoading(true);

    try {
      await register(nome, email, senha, tipo, precisaLoja ? loja : undefined);
      setSuccess(texto.sucesso);
      resetForm();
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-theme-border pb-3">
        <h3 className="text-sm font-black uppercase tracking-[2px] text-theme-text-title">
          {texto.tituloSecao}
        </h3>
        <p className="mt-1 text-sm text-theme-text-sub">{texto.ajuda}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${tipo}-nome`} className="text-sm font-bold">
          Nome completo
        </label>
        <input
          id={`${tipo}-nome`}
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder={texto.nomePlaceholder}
          className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${tipo}-email`} className="text-sm font-bold">
            E-mail
          </label>
          <input
            id={`${tipo}-email`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={texto.emailPlaceholder}
            className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${tipo}-senha`} className="text-sm font-bold">
            Senha inicial
          </label>
          <div className="relative">
            <input
              id={`${tipo}-senha`}
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Crie uma senha"
              className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 pr-24 text-theme-text-title outline-none transition placeholder:text-theme-text-sub/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((valor) => !valor)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-blue-600"
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
      </div>

      {precisaLoja && (
        <div className="space-y-4 border-t border-theme-border pt-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[2px] text-theme-text-title">
              Vinculo com loja
            </h3>
            <p className="mt-1 text-sm text-theme-text-sub">
              Escolha a unidade que esse responsavel podera operar.
            </p>
          </div>
          <label htmlFor={`${tipo}-loja`} className="text-sm font-bold">
            Loja vinculada
          </label>
          <select
            id={`${tipo}-loja`}
            value={loja}
            onChange={(event) => setLoja(event.target.value)}
            className="w-full rounded-lg border border-theme-border bg-theme-base px-4 py-3 text-theme-text-title outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="">
              {loadingLojas
                ? "Carregando lojas..."
                : lojas.length
                  ? "Selecione uma loja"
                  : "Nenhuma loja disponivel"}
            </option>
            {lojas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome_loja || item.nome || item.name || `Loja ${item.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-theme-border pt-5 sm:flex-row sm:justify-end">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-theme-border bg-theme-header px-5 py-3 text-sm font-bold text-theme-text-sub transition hover:text-theme-text-title"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? texto.loading : submitLabel || texto.submit}
        </button>
      </div>
    </form>
  );
}
