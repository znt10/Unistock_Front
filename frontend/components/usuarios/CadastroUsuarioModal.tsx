"use client";

import React from "react";
import CadastroUsuarioForm from "@/components/usuarios/CadastroUsuarioForm";

type TipoUsuario = "gerente";

type Props = {
  tipo: TipoUsuario;
  onClose: () => void;
};

const textos = {
  gerente: {
    titulo: "Criar gerente",
    descricao: "Cadastre um gerente para administrar o sistema.",
  },
};

const XIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default function CadastroUsuarioModal({ tipo, onClose }: Props) {
  const texto = textos[tipo];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-card p-6 text-theme-text-title shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-header/60 p-5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[3px] text-blue-500">
              Gestao de usuarios
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {texto.titulo}
            </h2>
            <p className="mt-1 text-sm leading-6 text-theme-text-sub">
              {texto.descricao}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-theme-border bg-theme-header p-2 text-theme-text-sub transition hover:text-theme-text-title"
            aria-label="Fechar formulario"
          >
            <XIcon />
          </button>
        </div>

        <CadastroUsuarioForm tipo={tipo} showCancel onCancel={onClose} />
      </div>
    </div>
  );
}
