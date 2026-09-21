"use client";
import { useEffect } from "react";

/**
 * Registra o service worker (public/sw.js), que e o que torna o site
 * instalavel no celular.
 *
 * Fica nos Providers, e nao numa tela, porque o app instalado e o site
 * inteiro: loja, fabrica e gerente abrem por telas diferentes.
 *
 * O arquivo mora na raiz (/sw.js) porque o escopo de um worker e a pasta
 * dele; em outra pasta ele nao alcancaria o start_url "/" do manifest e o
 * navegador recusaria a instalacao.
 */
export function RegistrarPWA() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Falha silenciosa: sem service worker o site funciona igual, so nao da
    // para instalar. Nao ha o que dizer a quem esta fazendo um pedido.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
