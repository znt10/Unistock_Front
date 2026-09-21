/* Service worker do Unistock.
 *
 * Existe por um motivo so: sem um service worker com handler de fetch, o
 * Chrome nao oferece "instalar aplicativo". O que a loja precisa e o icone na
 * tela inicial e a janela sem barra de navegador.
 *
 * ELE NAO GUARDA NADA, e isso e deliberado. Estoque e pedidos mudam o tempo
 * todo; uma resposta cacheada no aparelho mostraria estoque velho ou uma fila
 * da fabrica sem o pedido que acabou de entrar. O site precisa de internet, e
 * sempre precisou; sem rede, o erro da propria tela e melhor do que uma tela
 * que abre offline com dado errado.
 *
 * Se um dia o cache entrar aqui, a regra e: nunca sob /backend/.
 */

self.addEventListener("install", () => {
  // Assume o controle sem esperar a aba antiga fechar — o celular da loja
  // fica dias com a mesma aba aberta.
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      // Limpa qualquer cache deixado por uma versao anterior deste arquivo.
      const nomes = await caches.keys();
      await Promise.all(nomes.map((nome) => caches.delete(nome)));
      await self.clients.claim();
    })(),
  );
});

// Precisa existir para o navegador considerar o app instalavel. Passa direto
// para a rede: o worker nao decide nada sobre o conteudo.
self.addEventListener("fetch", () => {});
