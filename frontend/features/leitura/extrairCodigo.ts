/**
 * O codigo da caixa dentro do texto do QR, ou null se o QR nao e de caixa.
 *
 * A etiqueta guarda um link `<FRONTEND_URL>/caixa/<codigo>`. O dominio nao e
 * conferido de proposito: desenvolvimento, homologacao e producao imprimem
 * com dominios diferentes, e quem decide se a caixa existe e o backend.
 * O codigo tem sempre 12 caracteres (secrets.token_urlsafe(9)), o que tambem
 * impede que "/caixa/ler" seja confundido com uma caixa.
 */
const CAMINHO_DA_CAIXA = /^\/caixa\/([A-Za-z0-9_-]{12})\/?$/;

export function extrairCodigo(texto: string): string | null {
  let caminho: string;
  try {
    caminho = new URL(texto.trim()).pathname;
  } catch {
    return null;
  }
  return CAMINHO_DA_CAIXA.exec(caminho)?.[1] ?? null;
}
