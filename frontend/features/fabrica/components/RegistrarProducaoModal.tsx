"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { registrarProducao } from "@/features/fabrica/services/fabrica";
import type { Produto } from "@/features/produtos/hooks/useProduto";

type Props = {
  produtos: Produto[];
  onClose: () => void;
};

export default function RegistrarProducaoModal({ produtos, onClose }: Props) {
  const queryClient = useQueryClient();
  const produtosDaFabrica = useMemo(
    () =>
      produtos
        .filter((produto) => produto.vem_da_fabrica)
        .sort((a, b) => a.nome_produto.localeCompare(b.nome_produto)),
    [produtos],
  );
  const [produto, setProduto] = useState("");
  const [caixas, setCaixas] = useState<number | "">("");
  const [salvando, setSalvando] = useState(false);

  const salvar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!produto || !caixas || caixas <= 0 || salvando) return;

    setSalvando(true);
    try {
      const resultado = await registrarProducao(produto, Number(caixas));
      toast.success(
        `${resultado.produto_nome}: ${resultado.quantidade_atual} caixa(s) na fábrica.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
      await queryClient.invalidateQueries({ queryKey: ["fabrica", "disponivel"] });
      onClose();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao registrar produção.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={salvar}
        className="mx-4 w-full max-w-md space-y-5 rounded-3xl border border-theme-border bg-theme-card p-8 shadow-2xl"
      >
        <h2 className="text-lg font-black uppercase tracking-tighter text-theme-text-title">
          Registrar produção
        </h2>

        <label className="block space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
            Produto
          </span>
          <select
            value={produto}
            onChange={(evento) => setProduto(evento.target.value)}
            className="w-full rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-sm font-bold text-theme-text-title"
            required
          >
            <option value="">Selecione</option>
            {produtosDaFabrica.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome_produto}
                {item.categoria_nome ? ` — ${item.categoria_nome}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[2px] text-theme-text-sub/50">
            Caixas produzidas
          </span>
          <input
            type="number"
            min={1}
            value={caixas}
            onChange={(evento) =>
              setCaixas(evento.target.value === "" ? "" : Number(evento.target.value))
            }
            onWheel={(evento) => evento.currentTarget.blur()}
            className="w-full rounded-2xl border border-theme-border bg-theme-header px-4 py-3 text-sm font-bold text-theme-text-title"
            required
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-theme-border bg-theme-header py-3 text-[11px] font-black uppercase tracking-widest text-theme-text-sub transition hover:bg-theme-hover"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 rounded-2xl bg-blue-600 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
