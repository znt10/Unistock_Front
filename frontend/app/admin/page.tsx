"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import CadastroUsuarioModal from "@/features/usuarios/components/CadastroUsuarioModal";
import { getEstrutura } from "@/features/admin/services/admin";
import { getLoja, patchLoja } from "@/features/lojas/services/lojas";

export default function AdminDashboard() {
  const [criarGerenteAberto, setCriarGerenteAberto] = useState(false);
  const queryClient = useQueryClient();

  const { data: estrutura = [], isLoading } = useQuery({
    queryKey: ["admin-estrutura"],
    queryFn: getEstrutura,
  });

  const { data: todasAsLojas = [] } = useQuery({
    queryKey: ["lojas-todas-admin"],
    queryFn: getLoja,
  });

  const handleTrocarGerente = async (lojaId: string, gerenteId: string) => {
    await patchLoja(lojaId, { gerente: gerenteId ? Number(gerenteId) : null });
    queryClient.invalidateQueries({ queryKey: ["admin-estrutura"] });
    queryClient.invalidateQueries({ queryKey: ["lojas-todas-admin"] });
  };

  return (
    <div className="flex min-h-screen bg-theme-base font-sans">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 lg:ml-64 lg:pt-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
              Painel Administrativo
            </span>
            <h1 className="text-3xl font-bold text-theme-text-title">
              Gerentes e Lojas
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setCriarGerenteAberto(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700"
          >
            + Criar gerente
          </button>
        </div>

        {isLoading && <p className="text-theme-text-sub">Carregando...</p>}

        <div className="space-y-6">
          {estrutura.map((gerente) => (
            <div
              key={gerente.id}
              className="rounded-2xl border border-theme-border bg-theme-card p-6"
            >
              <h2 className="text-lg font-black text-theme-text-title">
                {gerente.nome}
              </h2>
              <p className="text-sm text-theme-text-sub">{gerente.email}</p>

              <div className="mt-4 space-y-2">
                {gerente.lojas.length === 0 && (
                  <p className="text-sm text-theme-text-sub">
                    Nenhuma loja atribuida.
                  </p>
                )}
                {gerente.lojas.map((loja) => (
                  <div
                    key={loja.id}
                    className="flex items-center justify-between rounded-lg border border-theme-border bg-theme-header/60 p-3"
                  >
                    <div>
                      <p className="font-bold text-theme-text-title">
                        {loja.nome_loja}
                      </p>
                      <p className="text-xs text-theme-text-sub">
                        {loja.responsavel?.email ?? "Sem acesso ainda"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!isLoading && estrutura.length === 0 && (
            <p className="text-sm text-theme-text-sub">
              Nenhum gerente cadastrado ainda.
            </p>
          )}
        </div>

        <div className="mt-10">
          <h3 className="mb-3 text-sm font-black uppercase tracking-[2px] text-theme-text-sub">
            Atribuir gerente por loja
          </h3>
          <div className="space-y-2">
            {todasAsLojas.map((loja: any) => (
              <div
                key={loja.id}
                className="flex items-center justify-between rounded-lg border border-theme-border bg-theme-card p-3"
              >
                <span className="font-bold text-theme-text-title">
                  {loja.nome_loja}
                </span>
                <select
                  defaultValue={loja.gerente ?? ""}
                  onChange={(e) => handleTrocarGerente(loja.id, e.target.value)}
                  className="rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-sm"
                >
                  <option value="">Sem gerente</option>
                  {estrutura.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </main>

      {criarGerenteAberto && (
        <CadastroUsuarioModal
          tipo="gerente"
          onClose={() => setCriarGerenteAberto(false)}
        />
      )}
    </div>
  );
}
