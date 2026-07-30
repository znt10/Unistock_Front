"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { confirmarConta } from "@/shared/services/auth";

type Status = "confirmando" | "sucesso" | "erro";

export default function ConfirmarContaPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("confirmando");
  const [mensagem, setMensagem] = useState("Confirmando sua conta...");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    confirmarConta(token)
      .then((data) => {
        if (cancelled) return;
        setStatus("sucesso");
        setMensagem(data.detail || "Conta confirmada. Você já pode fazer login.");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus("erro");
        setMensagem(
          error instanceof Error
            ? error.message
            : "Não foi possível confirmar a conta.",
        );
      });

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-base p-6 transition-colors">
      <div className="w-full max-w-md rounded-[24px] border border-theme-border bg-theme-card p-8 text-center shadow-sm">
        <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
          UniStock
        </span>

        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            status === "sucesso"
              ? "bg-emerald-100 text-emerald-600"
              : status === "erro"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
          }`}
        >
          {status === "sucesso" ? "✓" : status === "erro" ? "✕" : "…"}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-theme-text-title">
          {status === "confirmando"
            ? "Confirmando conta"
            : status === "sucesso"
              ? "Conta confirmada"
              : "Link inválido"}
        </h1>

        <p className="mt-3 text-sm font-medium text-theme-text-sub">{mensagem}</p>

        {status !== "confirmando" && (
          <button
            onClick={() => router.push("/login")}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Ir para o login
          </button>
        )}
      </div>
    </div>
  );
}
