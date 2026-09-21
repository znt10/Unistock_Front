import type { MetadataRoute } from "next";

/**
 * O Unistock instalado como app no celular da loja e da fabrica.
 *
 * start_url e "/" porque o proxy ja manda cada um para a sua tela inicial
 * (loja e fabrica em /novopedido, gerente em /lojas) ou para o /login. Um
 * endereco fixo aqui serviria a um perfil so.
 *
 * scope "/" porque o app anda pelo site inteiro — com escopo menor o celular
 * abriria o navegador ao sair dele, fora da janela do app. E e o escopo que a
 * leitura do QR das caixas vai precisar: o QR aponta para uma pagina do site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Unistock",
    short_name: "Unistock",
    description: "Estoque e pedidos das lojas e da fábrica.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    // As cores do tema escuro (o padrao do site), para a abertura nao piscar
    // branco antes da primeira tela.
    theme_color: "#0b1220",
    background_color: "#070c18",
    icons: [
      {
        src: "/icones/icone-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icones/icone-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icones/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
