import { useLojas } from "@/features/lojas/hooks/useLoja";

/**
 * True quando a empresa do usuario tem uma fabrica ativa cadastrada.
 *
 * Sem fabrica nada muda na operacao: e esta pergunta que esconde o menu
 * "Fabrica" do gerente e o rotulo "Caixas" do novo pedido. A lista de lojas ja
 * vem escopada pela empresa para todos os papeis (inclusive o login da loja),
 * e usa o mesmo cache de useLojas — nao ha chamada extra.
 *
 * Enquanto a lista carrega a resposta e false: melhor esconder por um instante
 * do que mostrar e sumir.
 */
export function useEmpresaTemFabrica({ enabled = true }: { enabled?: boolean } = {}) {
  const { data: lojas = [] } = useLojas({ enabled });

  return lojas.some((loja) => loja.tipo === "Fabrica" && loja.ativo);
}
