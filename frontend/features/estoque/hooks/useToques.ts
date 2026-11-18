import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/services/api";
import type { FaixaDoToqueDados } from "@/features/estoque/components/FaixaDoToque";
import {
  type ItemDaLoja,
  MINHA_LOJA_QUERY_KEY,
  type MinhaLoja,
  type RespostaDoToque,
  desfazerToque,
  toqueComecou,
  toqueTerminou,
  tocar,
} from "@/features/estoque/services/toques";

const texto = (delta: 1 | -1, nome: string, r: RespostaDoToque) => {
  const sinal = delta > 0 ? "+1" : "−1";
  if (r.significado === "FIM_DE_CAIXA" && r.caixa) {
    return `${sinal} ${nome} · acabou a caixa ${r.caixa.numero}/${r.caixa.total}`;
  }
  return `${sinal} ${nome} · ${r.significado === "PRODUCAO" ? "produção" : "correção"}`;
};

const mensagemDoErro = (erro: unknown) => {
  if (erro instanceof ApiError) {
    return erro.status >= 500 ? "Erro no servidor — tente de novo" : erro.message;
  }
  if (erro instanceof TypeError) return "Sem conexão — tente de novo";
  return "Erro inesperado — tente de novo";
};

/**
 * Fila de toques do [−] N [+]. Os toques de um mesmo produto vao ao servidor
 * em ordem (uma corrente de promises por produto) e o numero na tela e
 * `item.quantidade + pendentes[produto]`, entao nunca volta para tras enquanto
 * o servidor responde.
 */
export function useToques(loja: string) {
  const queryClient = useQueryClient();
  const [pendentes, setPendentes] = useState<Record<string, number>>({});
  const [faixa, setFaixa] = useState<FaixaDoToqueDados | null>(null);
  const filas = useRef<Record<string, Promise<void>>>({});
  // Quantas operacoes de cada produto ainda estao na fila.
  const naFila = useRef<Record<string, number>>({});
  // Ref alem do state: dois toques em Desfazer no mesmo quadro nao passam juntos.
  const desfazendo = useRef(false);
  // Cada toque confirmado: o desfazer entra na fila do mesmo produto e, se
  // foi producao, tira de "hoje" o que o toque tinha somado.
  const toquesFeitos = useRef<
    Record<string, { produto: string; delta: number; significado: RespostaDoToque["significado"] }>
  >({});

  const gravar = useCallback(
    (produto: string, quantidade: number, somaHoje = 0) => {
      queryClient.setQueryData<MinhaLoja>(MINHA_LOJA_QUERY_KEY, (antigo) =>
        antigo && {
          ...antigo,
          itens: antigo.itens.map((i) =>
            i.produto === produto
              ? { ...i, quantidade, hoje: i.hoje === null ? null : i.hoje + somaHoje }
              : i,
          ),
        },
      );
    },
    [queryClient],
  );

  // Logo depois de `gravar`: o setQueryData atualiza o resultado do
  // observador na hora, entao os dois chegam juntos na mesma renderizacao.
  const tirarPendente = useCallback((produto: string, delta: number) => {
    setPendentes((p) => ({ ...p, [produto]: (p[produto] ?? 0) - delta }));
  }, []);

  // Cancela leituras da tela em andamento: uma que leu o banco antes do toque
  // e chegasse depois da resposta voltaria o numero para tras. Leituras novas
  // esperam os toques terminarem (ver getMinhaLoja), entao nenhuma passa
  // entre a resposta do servidor e a gravacao no cache.
  const cancelarLeituras = useCallback(
    () => queryClient.cancelQueries({ queryKey: MINHA_LOJA_QUERY_KEY }),
    [queryClient],
  );

  const enfileirar = useCallback((produto: string, tarefa: () => Promise<void>) => {
    naFila.current[produto] = (naFila.current[produto] ?? 0) + 1;
    const proxima = (filas.current[produto] ?? Promise.resolve())
      .then(tarefa)
      .finally(() => {
        naFila.current[produto] -= 1;
      });
    filas.current[produto] = proxima;
    return proxima;
  }, []);

  const tocarItem = useCallback(
    (item: ItemDaLoja, delta: 1 | -1) => {
      const { produto, produto_nome: nome } = item;
      setPendentes((p) => ({ ...p, [produto]: (p[produto] ?? 0) + delta }));
      toqueComecou();
      void cancelarLeituras();
      void enfileirar(produto, async () => {
        try {
          await cancelarLeituras();
          const r = await tocar(loja, produto, delta);
          await cancelarLeituras();
          gravar(produto, r.quantidade, r.significado === "PRODUCAO" ? delta : 0);
          tirarPendente(produto, delta);
          toquesFeitos.current[r.toque] = { produto, delta, significado: r.significado };
          setFaixa({ tipo: "ok", texto: texto(delta, nome, r), toque: r.toque });
        } catch (erro) {
          tirarPendente(produto, delta);
          setFaixa({ tipo: "erro", texto: mensagemDoErro(erro), toque: null });
        } finally {
          toqueTerminou();
        }
      });
    },
    [loja, enfileirar, gravar, tirarPendente, cancelarLeituras],
  );

  const desfazer = useCallback(() => {
    const toque = faixa?.toque;
    if (!toque || desfazendo.current) return;
    desfazendo.current = true;
    const feito = toquesFeitos.current[toque];
    const produto = feito?.produto ?? "";
    toqueComecou();
    void cancelarLeituras();
    void enfileirar(produto, async () => {
      try {
        await cancelarLeituras();
        const r = await desfazerToque(toque);
        await cancelarLeituras();
        gravar(r.produto, r.quantidade, feito?.significado === "PRODUCAO" ? -feito.delta : 0);
        delete toquesFeitos.current[toque];
        setFaixa({ tipo: "aviso", texto: "Desfeito", toque: null });
      } catch (erro) {
        setFaixa({ tipo: "erro", texto: mensagemDoErro(erro), toque: null });
      } finally {
        toqueTerminou();
        desfazendo.current = false;
      }
    });
  }, [faixa, enfileirar, gravar, cancelarLeituras]);

  const fecharFaixa = useCallback(() => setFaixa(null), []);

  return { pendentes, tocarItem, faixa, desfazer, fecharFaixa };
}
