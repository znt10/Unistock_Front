import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/shared/services/api";
import {
  type CaixaDescrita,
  type RecusaDaLeitura,
  desfazerLeitura,
  lerCaixa,
} from "@/features/leitura/services/leitura";

/**
 * Tudo o que acontece depois que um codigo de caixa foi lido: chamar a API,
 * montar a faixa colorida, pedir confirmacao (janela de 2 minutos no
 * servidor), guardar o historico da sessao e desfazer.
 *
 * Compartilhado pela tela de leitura e pela pagina do link do QR, para as
 * duas falarem igual.
 */
export type Faixa = {
  id: number;
  tipo: "CHEGOU" | "ABERTA" | "ACABOU" | "aviso" | "erro";
  titulo: string;
  detalhe?: string;
  leitura: string | null;
};

export type Confirmacao = { codigo: string; mensagem: string };

export type ItemDoHistorico = {
  id: number;
  titulo: string;
  detalhe: string;
  leitura: string | null;
  desfeita: boolean;
};

const descrever = (caixa: CaixaDescrita) =>
  `${caixa.produto_nome} · caixa ${caixa.numero}/${caixa.total}`;

const vibrar = (padrao: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(padrao);
  }
};

export function useLeituraDeCaixa({ onMudou }: { onMudou?: () => void } = {}) {
  const [faixa, setFaixa] = useState<Faixa | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [historico, setHistorico] = useState<ItemDoHistorico[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const contador = useRef(0);
  // Ref alem do state: duas leituras no mesmo quadro nao podem passar juntas.
  const ocupadoRef = useRef(false);

  const mostrar = useCallback((nova: Omit<Faixa, "id">) => {
    contador.current += 1;
    setFaixa({ ...nova, id: contador.current });
    vibrar(nova.tipo === "erro" ? [80, 60, 80] : 60);
  }, []);

  const mostrarErro = useCallback(
    (erro: unknown) => {
      if (erro instanceof ApiError) {
        mostrar({ tipo: "erro", titulo: erro.message, leitura: null });
      } else {
        // fetch rejeitado = sem rede. Nada fica guardado para depois.
        mostrar({ tipo: "erro", titulo: "Sem conexão — leia de novo", leitura: null });
      }
    },
    [mostrar],
  );

  const ler = useCallback(
    async (codigo: string, confirmar = false) => {
      if (ocupadoRef.current) return;
      ocupadoRef.current = true;
      setOcupado(true);
      try {
        const resultado = await lerCaixa(codigo, confirmar);
        const caixa = resultado.caixa;

        if (resultado.ja_acabou) {
          mostrar({
            tipo: "aviso",
            titulo: "Essa caixa já acabou",
            detalhe: descrever(caixa),
            leitura: null,
          });
          return;
        }

        let detalhe = descrever(caixa);
        if (caixa.situacao === "CHEGOU") {
          detalhe += ` · pedido #${caixa.pedido_numero}: ${caixa.caixas_chegaram} de ${caixa.caixas_total}`;
        }
        if (resultado.caixa_fechada) {
          const fechada = resultado.caixa_fechada;
          detalhe += ` · a caixa ${fechada.numero}/${fechada.total} anterior foi marcada como ACABOU`;
        }
        const tipo = caixa.situacao as "CHEGOU" | "ABERTA" | "ACABOU";
        mostrar({ tipo, titulo: tipo, detalhe, leitura: resultado.leitura });
        setHistorico((atual) => [
          { id: contador.current, titulo: tipo, detalhe, leitura: resultado.leitura, desfeita: false },
          ...atual,
        ]);
        onMudou?.();
      } catch (erro) {
        const dados = erro instanceof ApiError ? (erro.data as RecusaDaLeitura | null) : null;
        if (dados?.codigo === "precisa_confirmar") {
          setConfirmacao({ codigo, mensagem: dados.error });
          vibrar(60);
        } else {
          mostrarErro(erro);
        }
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
      }
    },
    [mostrar, mostrarErro, onMudou],
  );

  const confirmar = useCallback(() => {
    if (!confirmacao) return;
    const { codigo } = confirmacao;
    setConfirmacao(null);
    void ler(codigo, true);
  }, [confirmacao, ler]);

  const cancelarConfirmacao = useCallback(() => setConfirmacao(null), []);

  const desfazer = useCallback(async () => {
    const leitura = faixa?.leitura;
    if (!leitura) return;
    try {
      const resultado = await desfazerLeitura(leitura);
      let detalhe = `${descrever(resultado.caixa)} voltou para ${resultado.caixa.situacao.replace("_", " ")}`;
      if (resultado.caixa_reaberta) {
        detalhe += ` · a caixa ${resultado.caixa_reaberta.numero}/${resultado.caixa_reaberta.total} voltou a ABERTA`;
      }
      mostrar({ tipo: "aviso", titulo: "Leitura desfeita", detalhe, leitura: null });
      setHistorico((atual) =>
        atual.map((item) => (item.leitura === leitura ? { ...item, desfeita: true } : item)),
      );
      onMudou?.();
    } catch (erro) {
      mostrarErro(erro);
    }
  }, [faixa, mostrar, mostrarErro, onMudou]);

  const fecharFaixa = useCallback(() => setFaixa(null), []);

  const mostrarQrInvalido = useCallback(
    () => mostrar({ tipo: "erro", titulo: "Esse QR não é de uma caixa", leitura: null }),
    [mostrar],
  );

  return {
    faixa,
    confirmacao,
    historico,
    ocupado,
    ler,
    confirmar,
    cancelarConfirmacao,
    desfazer,
    fecharFaixa,
    mostrarQrInvalido,
  };
}
