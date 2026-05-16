"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { postPedido } from "@/services/uni";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useProdutos } from "@/hooks/useProduto";
import { useLojas } from "@/hooks/useLoja";
import AutocompleteProduto from "@/components/HeroUI/AutocompleteP";
import AutocompleteLoja from "@/components/HeroUI/AutocompleteLoja";

export default function NovoPedidoPage() {
  const router = useRouter();

  const { data: produtos = [] } = useProdutos();
  const { data: lojas = [] } = useLojas();

  const user = useAuthStore((state) => state.user);

  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [descricao, setDescricao] = useState("");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);

  const isGerente = user?.group === "Gerente";

  const handleSubmit = async () => {
    if (loading) return;

    if (!produtoSelecionado) {
      alert("Selecione um produto");
      return;
    }

    if (quantidade <= 0) {
      alert("Quantidade deve ser maior que 0");
      return;
    }

    const lojaId = lojaSelecionada || user?.loja_id;

    if (!lojaId) {
      alert("Selecione uma loja");
      return;
    }

    try {
      setLoading(true);

      const pedido = {
        loja: lojaId,
        descricao: descricao.trim(),
        itens: [
          {
            produto: produtoSelecionado,
            quantidade: Number(quantidade),
          },
        ],
      };

      console.log("Enviando pedido:", pedido);

      await postPedido(pedido);

      alert("Pedido criado com sucesso!");

      // reset
      setProdutoSelecionado("");
      setQuantidade(0);
      setDescricao("");
      setLojaSelecionada("");

      if (isGerente) {
        router.push("/painel_unidade");
      } else {
        router.push("/meuspedidos");
      }
    } catch (error: unknown) {
      console.error("Erro completo:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-text-sub">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:ml-64">
        <section className="w-full max-w-2xl rounded-[32px] bg-theme-card p-8 border border-theme-border shadow-2xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-theme-text-title">
              Novo Pedido
            </h1>
            <p className="text-theme-text-sub/60 mt-2">
              Preencha os dados abaixo
            </p>
          </header>

          {/* LOJA */}
          {user?.group === "Gerente" && (
            <div className="mb-6">
              <label className="text-sm font-bold text-theme-text-title mb-2 block">
                Loja
              </label>

              <AutocompleteLoja
                lojas={lojas}
                onSelect={(id) => setLojaSelecionada(id)}
              />
            </div>
          )}

          {/* PRODUTO */}
          <div className="mb-6">
            <label className="text-sm font-bold text-theme-text-title mb-2 block">
              Produto
            </label>

            <AutocompleteProduto
              produtos={produtos}
              onSelect={(id) => setProdutoSelecionado(id)}
            />
          </div>

          {/* QUANTIDADE */}
          <div className="mb-6">
            <label className="text-sm font-bold text-theme-text-title">
              Quantidade
            </label>

            <input
              type="number"
              value={quantidade || ""}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-2xl border border-theme-border bg-theme-base p-4 mt-2 text-theme-text-title"
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="mb-6">
            <label className="text-sm font-bold text-theme-text-title">
              Descrição
            </label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Observações..."
              className="w-full rounded-2xl border border-theme-border bg-theme-base p-4 mt-2 text-theme-text-title min-h-[100px]"
            />
          </div>

          {/* BOTÕES */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="w-1/2 bg-theme-header border border-theme-border p-4 rounded-2xl hover:bg-theme-border transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-1/2 bg-blue-600 text-white p-4 rounded-2xl font-bold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
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
