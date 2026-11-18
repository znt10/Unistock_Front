import { useCallback, useRef, useState } from "react";
import { notifyManager, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/services/api";
import type { FaixaDoToqueDados } from "@/features/estoque/components/FaixaDoToque";
import {
  type ItemDaLoja,
  MINHA_LOJA_QUERY_KEY,
  type MinhaLoja,
  type RespostaDoToque,
  desfazerToque,
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
  // Produto de cada toque confirmado: o desfazer entra na fila do mesmo produto.
  const produtoDoToque = useRef<Record<string, string>>({});

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

  // Entra na mesma fila de notificacao do cache: a quantidade nova e o delta
  // retirado chegam juntos na tela, sem um quadro com o numero errado.
  const tirarPendente = useCallback((produto: string, delta: number) => {
    notifyManager.schedule(() =>
      setPendentes((p) => ({ ...p, [produto]: (p[produto] ?? 0) - delta })),
    );
  }, []);

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
      void enfileirar(produto, async () => {
        try {
          const r = await tocar(loja, produto, delta);
          gravar(produto, r.quantidade, r.significado === "PRODUCAO" ? delta : 0);
          tirarPendente(produto, delta);
          produtoDoToque.current[r.toque] = produto;
          setFaixa({ tipo: "ok", texto: texto(delta, nome, r), toque: r.toque });
        } catch (erro) {
          tirarPendente(produto, delta);
          setFaixa({ tipo: "erro", texto: mensagemDoErro(erro), toque: null });
        }
      });
    },
    [loja, enfileirar, gravar, tirarPendente],
  );

  const desfazer = useCallback(() => {
    const toque = faixa?.toque;
    if (!toque || desfazendo.current) return;
    desfazendo.current = true;
    const produto = produtoDoToque.current[toque] ?? "";
    void enfileirar(produto, async () => {
      try {
        const r = await desfazerToque(toque);
        gravar(r.produto, r.quantidade);
        setFaixa({ tipo: "aviso", texto: "Desfeito", toque: null });
        // "hoje" da fabrica nao vem na resposta: so recarrega se mais nada
        // deste produto esta a caminho (senao o numero contaria em dobro).
        if ((naFila.current[produto] ?? 0) <= 1) {
          void queryClient.invalidateQueries({ queryKey: MINHA_LOJA_QUERY_KEY });
        }
      } catch (erro) {
        setFaixa({ tipo: "erro", texto: mensagemDoErro(erro), toque: null });
      } finally {
        desfazendo.current = false;
      }
    });
  }, [faixa, queryClient, enfileirar, gravar]);

  const fecharFaixa = useCallback(() => setFaixa(null), []);

  return { pendentes, tocarItem, faixa, desfazer, fecharFaixa };
}
