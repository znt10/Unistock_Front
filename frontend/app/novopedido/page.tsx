"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  excessoDoErro,
  postPedido,
  type AvisoDeExcesso,
} from "@/features/pedidos/services/pedidos";
import { useAuthStore } from "@/shared/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useProdutos } from "@/features/produtos/hooks/useProduto";
import { useLojas } from "@/features/lojas/hooks/useLoja";
import AutocompleteProduto from "@/shared/components/HeroUI/AutocompleteP";
import AutocompleteLoja from "@/shared/components/HeroUI/AutocompleteLoja";

const normalizeRole = (role?: string) => {
  const normalized = role
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (["gerente", "administrador", "admin"].includes(normalized ?? "")) {
    return "Gerente";
  }

  if (normalized === "responsavel") {
    return "Responsavel";
  }

  return "";
};

export default function NovoPedidoPage() {
  const queryClient = useQueryClient();
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
  // Aviso de teto: a primeira tentativa volta aqui em vez de criar o pedido.
  // Trava avisada e nao dura de proposito — trava dura empurra quem esta na
  // loja a subir o maximo so para conseguir pedir, e nunca mais abaixar.
  const [excesso, setExcesso] = useState<AvisoDeExcesso[] | null>(null);

  // Incrementar a chave força os componentes Autocomplete a remontarem (reset visual)
  const [resetKey, setResetKey] = useState(0);

  const isGerente = normalizeRole(user?.group) === "Gerente";

  const produtoAtual = produtos.find((produto) => produto.id === produtoSelecionado);

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

    await enviarPedido(lojaId, false);
  };

  const enviarPedido = async (lojaId: string, confirmandoExcesso: boolean) => {
    try {
      setLoading(true);

      await postPedido({
        loja: lojaId,
        descricao: descricao.trim(),
        itens: [
          { produto: produtoSelecionado, quantidade: Number(quantidade) },
        ],
        confirmar_excesso: confirmandoExcesso,
      });

      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });

      limparFormulario();
      setExcesso(null);
      setSucesso(true);

      // Some o banner de sucesso depois de 4 segundos
      setTimeout(() => setSucesso(false), 4000);
    } catch (error: unknown) {
      const aviso = excessoDoErro(error);
      if (aviso) {
        // Nao e erro: o pedido esta correto, so passa do maximo da loja.
        setExcesso(aviso);
        return;
      }

      setErroMsg(
        error instanceof Error ? error.message : "Erro ao criar pedido.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-theme-border bg-theme-header py-4 px-5 text-sm font-bold text-theme-text-title placeholder:text-theme-text-sub/25 transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5";
  const labelClass =
    "ml-1 text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50";

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased transition-colors duration-300">
      <Sidebar />

      <main className="flex min-w-0 flex-1 items-center justify-center p-5 pt-20 transition-all duration-300 sm:p-8 md:p-12 lg:ml-60 lg:min-h-screen lg:pt-12">
        <div className="mx-auto w-full max-w-3xl">

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              Novo Pedido
            </h1>
            <p className="mt-3 font-medium text-theme-text-sub/60">
              Preencha os dados abaixo para registrar um pedido.
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <div className="rounded-4xl border border-theme-border bg-theme-card p-5 shadow-xl sm:p-8">
              <div className="space-y-7">

                {/* ── Banner de sucesso ── */}
                {sucesso && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Pedido enviado com sucesso! Formulário limpo.
                  </div>
                )}

                {/* ── Banner de erro ── */}
                {erroMsg && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {erroMsg}
                  </div>
                )}

                {/* ── Aviso de teto ──
                    Ambar e nao vermelho: nao e erro, e um alerta. O pedido
                    esta correto; o que ele faz e passar do maximo da loja. */}
                {excesso && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900">
                    <p className="text-sm font-black uppercase tracking-[2px]">
                      Isso passa do máximo da loja
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm font-medium">
                      {excesso.map((item) => (
                        <li key={item.produto}>
                          <b>{item.produto}</b>: ficaria com {item.resultante},
                          e o máximo é {item.maximo}.{" "}
                          {item.cabe > 0
                            ? `Ainda cabem ${item.cabe}.`
                            : "Não cabe mais nenhum."}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs font-medium text-amber-800">
                      Produto parado demais estraga. Ajuste a quantidade, ou
                      confirme se você sabe que vale a pena desta vez.
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setExcesso(null)}
                        className="rounded-xl border border-amber-400 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-amber-800 transition hover:bg-amber-100"
                      >
                        Ajustar quantidade
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          const lojaId = lojaSelecionada || user?.loja_id;
                          if (lojaId) enviarPedido(lojaId, true);
                        }}
                        className="rounded-xl bg-amber-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-amber-700 disabled:opacity-60"
                      >
                        {loading ? "Enviando..." : "Pedir mesmo assim"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── LOJA (só Gerente) ── */}
                {isGerente && (
                  <div className="space-y-2">
                    <label className={labelClass}>Loja</label>
                    <AutocompleteLoja
                      key={`loja-${resetKey}`}
                      lojas={lojas}
                      onSelect={(id) => setLojaSelecionada(id)}
                    />
                  </div>
                )}

                {/* ── PRODUTO ── */}
                <div className="space-y-2">
                  <label className={labelClass}>Produto</label>
                  <AutocompleteProduto
                    key={`produto-${resetKey}`}
                    produtos={produtos}
                    onSelect={(id) => setProdutoSelecionado(id)}
                  />
                </div>

                {/* ── QUANTIDADE ── */}
                <div className="space-y-2">
                  <label className={labelClass}>
                    {produtoAtual?.vem_da_fabrica ? "Caixas" : "Quantidade"}
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
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                {/* ── DESCRIÇÃO ── */}
                <div className="space-y-2">
                  <label className={labelClass}>
                    Descrição
                    <span className="ml-2 normal-case tracking-normal font-medium text-theme-text-sub/40">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Observações..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* ── BOTÕES ── */}
                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={limparFormulario}
                    className="flex items-center justify-center rounded-2xl border border-red-500/20 py-4 text-[12px] font-black uppercase tracking-widest text-red-500/70 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-2xl border-none bg-blue-600 py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Enviando..." : "Confirmar Pedido"}
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
