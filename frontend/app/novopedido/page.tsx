"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { postPedido } from "@/services/uni";
import { useAuthStore } from "@/stores/authStore";
import { useProdutos } from "@/hooks/useProduto";
import { useLojas } from "@/hooks/useLoja";
import AutocompleteProduto from "@/components/HeroUI/AutocompleteP";
import AutocompleteLoja from "@/components/HeroUI/AutocompleteLoja";

// Chave incremental para forçar reset dos Autocomplete
let chaveReset = 0;

export default function NovoPedidoPage() {
  const { data: produtos = [] } = useProdutos();
  const { data: lojas = [] } = useLojas();
  const user = useAuthStore((state) => state.user);

  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [descricao, setDescricao] = useState("");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroMsg, setErroMsg] = useState("");

  // Incrementar a chave força os componentes Autocomplete a remontarem (reset visual)
  const [resetKey, setResetKey] = useState(0);

  const isGerente = user?.group === "Gerente";

  function limparFormulario() {
    setProdutoSelecionado("");
    setQuantidade("");
    setDescricao("");
    setLojaSelecionada("");
    setResetKey((k) => k + 1); // remonta Autocompletes
  }

  const handleSubmit = async () => {
    if (loading) return;
    setErroMsg("");
    setSucesso(false);

    if (!produtoSelecionado) {
      setErroMsg("Selecione um produto.");
      return;
    }
    if (!quantidade || Number(quantidade) <= 0) {
      setErroMsg("Quantidade deve ser maior que 0.");
      return;
    }

    const lojaId = lojaSelecionada || user?.loja_id;
    if (!lojaId) {
      setErroMsg("Selecione uma loja.");
      return;
    }

    try {
      setLoading(true);

      await postPedido({
        loja: lojaId,
        descricao: descricao.trim(),
        itens: [
          { produto: produtoSelecionado, quantidade: Number(quantidade) },
        ],
      });

      limparFormulario();
      setSucesso(true);

      // Some o banner de sucesso depois de 4 segundos
      setTimeout(() => setSucesso(false), 4000);
    } catch (error: unknown) {
      setErroMsg(
        error instanceof Error ? error.message : "Erro ao criar pedido.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub">
      <Sidebar />

      <main className="flex flex-1 flex-col items-center justify-center p-6 lg:ml-64">
        <section className="w-full max-w-2xl rounded-[32px] border border-theme-border bg-theme-card p-8 shadow-2xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-theme-text-title">
              Novo Pedido
            </h1>
            <p className="mt-2 text-theme-text-sub/60">
              Preencha os dados abaixo
            </p>
          </header>

          {/* ── Banner de sucesso ── */}
          {sucesso && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="text-xl">✓</span>
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Pedido enviado com sucesso!
                </p>
                <p className="text-xs text-emerald-600">
                  O formulário foi limpo. Você pode fazer outro pedido.
                </p>
              </div>
            </div>
          )}

          {/* ── Banner de erro ── */}
          {erroMsg && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-bold text-red-700">{erroMsg}</p>
            </div>
          )}

          {/* ── LOJA (só Gerente) ── */}
          {isGerente && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-theme-text-title">
                Loja
              </label>
              <AutocompleteLoja
                key={`loja-${resetKey}`}
                lojas={lojas}
                onSelect={(id) => setLojaSelecionada(id)}
              />
            </div>
          )}

          {/* ── PRODUTO ── */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-theme-text-title">
              Produto
            </label>
            <AutocompleteProduto
              key={`produto-${resetKey}`}
              produtos={produtos}
              onSelect={(id) => setProdutoSelecionado(id)}
            />
          </div>

          {/* ── QUANTIDADE ── */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-theme-text-title">
              Quantidade
            </label>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) =>
                setQuantidade(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-theme-border bg-theme-base p-4 text-theme-text-title"
            />
          </div>

          {/* ── DESCRIÇÃO ── */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-theme-text-title">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Observações..."
              className="mt-2 min-h-[100px] w-full rounded-2xl border border-theme-border bg-theme-base p-4 text-theme-text-title"
            />
          </div>

          {/* ── BOTÕES ── */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={limparFormulario}
              className="w-1/2 rounded-2xl border border-theme-border bg-theme-header p-4 transition hover:bg-theme-border"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-1/2 rounded-2xl bg-blue-600 p-4 font-bold text-white transition ${
                loading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-500"
              }`}
            >
              {loading ? "Enviando..." : "Confirmar Pedido"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
