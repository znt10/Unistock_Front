"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { ConfirmarPasso } from "@/features/leitura/components/ConfirmarPasso";
import { FaixaDaLeitura } from "@/features/leitura/components/FaixaDaLeitura";
import { extrairCodigo } from "@/features/leitura/extrairCodigo";
import { useLeitorQR } from "@/features/leitura/hooks/useLeitorQR";
import { useLeituraDeCaixa } from "@/features/leitura/hooks/useLeituraDeCaixa";
import { getACaminho } from "@/features/leitura/services/leitura";

// A camera ve o mesmo QR varias vezes por segundo: o mesmo codigo e ignorado
// por este tempo. Leitura repetida de verdade cai na confirmacao do servidor.
const PAUSA_DO_MESMO_QR_MS = 4000;

export default function LerCaixasPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ultimo = useRef<{ codigo: string; em: number } | null>(null);
  const [terminando, setTerminando] = useState(false);

  const { data: aCaminho = [] } = useQuery({
    queryKey: ["caixas-a-caminho"],
    queryFn: getACaminho,
    staleTime: 0,
  });

  const onMudou = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["caixas-a-caminho"] });
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });
  }, [queryClient]);

  const leitura = useLeituraDeCaixa({ onMudou });
  const { ler, confirmacao, mostrarQrInvalido } = leitura;

  const onLido = useCallback(
    (texto: string) => {
      // Com o dialogo de confirmacao aberto, a camera nao dispara nada.
      if (confirmacao) return;
      const codigo = extrairCodigo(texto);
      const chave = codigo ?? texto;
      const agora = Date.now();
      if (ultimo.current?.codigo === chave && agora - ultimo.current.em < PAUSA_DO_MESMO_QR_MS) {
        return;
      }
      ultimo.current = { codigo: chave, em: agora };
      if (codigo) {
        void ler(codigo);
      } else {
        mostrarQrInvalido();
      }
    },
    [confirmacao, ler, mostrarQrInvalido],
  );

  const { estado } = useLeitorQR(videoRef, onLido);

  const faltam = aCaminho.flatMap((pedido) =>
    pedido.faltam.length ? [`${pedido.produto_nome} (${pedido.faltam.length})`] : [],
  );
  const totalQueFalta = aCaminho.reduce((soma, pedido) => soma + pedido.faltam.length, 0);

  const terminar = () => {
    if (totalQueFalta > 0) {
      setTerminando(true);
    } else {
      router.push("/novopedido");
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-theme-base font-sans text-theme-text-sub antialiased">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 md:p-12 lg:ml-64 lg:pt-12">
        <div className="mx-auto max-w-xl space-y-5">
          <header>
            <span className="mb-3 block text-[11px] font-black uppercase tracking-[4px] text-blue-500">
              Caixas da fábrica
            </span>
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-theme-text-title sm:text-4xl">
              Ler caixas
            </h1>
            <p className="mt-3 font-medium text-theme-text-sub/60">
              Aponte a câmera para a etiqueta. Cada leitura avança a caixa: chegou, aberta, acabou.
            </p>
          </header>

          <div className="relative aspect-square overflow-hidden rounded-[24px] border border-theme-border bg-black">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {estado !== "lendo" && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-bold text-white/80">
                {estado === "iniciando" && "Ligando a câmera..."}
                {estado === "negada" &&
                  "A câmera está bloqueada. Libere o acesso à câmera para este site nas configurações do navegador e abra a tela de novo."}
                {estado === "indisponivel" &&
                  "Não foi possível usar a câmera neste aparelho. Use a câmera do celular para abrir o link da etiqueta."}
              </div>
            )}
          </div>

          <FaixaDaLeitura
            faixa={leitura.faixa}
            onDesfazer={() => void leitura.desfazer()}
            onFechar={leitura.fecharFaixa}
          />

          {aCaminho.length > 0 && (
            <section className="rounded-[24px] border border-theme-border bg-theme-card p-5">
              <h2 className="text-[11px] font-black uppercase tracking-[3px] text-theme-text-sub/60">
                A caminho
              </h2>
              <ul className="mt-3 divide-y divide-theme-border">
                {aCaminho.map((pedido) => (
                  <li key={pedido.pedido} className="flex items-center justify-between py-3">
                    <span className="font-black uppercase text-theme-text-title">
                      {pedido.produto_nome}
                    </span>
                    <span className="font-mono font-black text-blue-500">
                      {pedido.caixas_chegaram} de {pedido.caixas_total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {leitura.historico.length > 0 && (
            <section className="rounded-[24px] border border-theme-border bg-theme-card p-5">
              <h2 className="text-[11px] font-black uppercase tracking-[3px] text-theme-text-sub/60">
                Lidas agora
              </h2>
              <ul className="mt-3 space-y-2">
                {leitura.historico.map((item) => (
                  <li key={item.id} className={item.desfeita ? "line-through opacity-50" : ""}>
                    <span className="font-black text-theme-text-title">{item.titulo}</span>{" "}
                    <span className="text-sm">{item.detalhe}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            type="button"
            onClick={terminar}
            className="w-full rounded-xl bg-theme-card px-4 py-4 font-black uppercase text-theme-text-title ring-1 ring-theme-border hover:bg-theme-hover"
          >
            Terminar
          </button>
        </div>
      </main>

      {confirmacao && (
        <ConfirmarPasso
          mensagem={confirmacao.mensagem}
          onSim={leitura.confirmar}
          onNao={leitura.cancelarConfirmacao}
        />
      )}

      {terminando && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
        >
          <div className="w-full max-w-md rounded-[24px] border border-theme-border bg-theme-card p-6">
            <p className="text-lg font-black text-theme-text-title">
              Faltam {totalQueFalta} {totalQueFalta === 1 ? "caixa" : "caixas"}: {faltam.join(", ")}.
            </p>
            <p className="mt-2 text-sm">Ficam pendentes e podem ser lidas quando chegarem.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setTerminando(false)}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-black uppercase text-white hover:bg-blue-500"
              >
                Continuar lendo
              </button>
              <button
                type="button"
                onClick={() => router.push("/novopedido")}
                className="flex-1 rounded-xl border border-theme-border px-4 py-3 font-black uppercase text-theme-text-sub hover:bg-theme-hover"
              >
                Terminar assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
