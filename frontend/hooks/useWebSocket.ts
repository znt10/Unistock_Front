"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WebSocketMessage = {
  tipo: string;
  payload?: unknown;
};

const WS_URL =
  process.env.NEXT_PUBLIC_ESTOQUE_WS_URL || "ws://localhost:3001/estoque";

export function useWebSocket(onMessage: (message: WebSocketMessage) => void) {
  const [conectado, setConectado] = useState(false);
  const [pendentes, setPendentes] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const messageRef = useRef(onMessage);

  useEffect(() => {
    messageRef.current = onMessage;
  }, [onMessage]);

  const enviar = useCallback((message: WebSocketMessage) => {
    const ws = wsRef.current;

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return;
    }

    setPendentes((atual) => [...atual, message]);
  }, []);

  useEffect(() => {
    let cancelado = false;

    function conectar() {
      if (cancelado) return;

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setConectado(true);
          setPendentes((fila) => {
            fila.forEach((msg) => ws.send(JSON.stringify(msg)));
            return [];
          });
        };

        ws.onmessage = (event) => {
          try {
            messageRef.current(JSON.parse(event.data));
          } catch {
            // Ignora mensagens invalidas do servidor.
          }
        };

        ws.onclose = () => {
          setConectado(false);
          if (!cancelado) {
            reconnectRef.current = window.setTimeout(conectar, 2500);
          }
        };

        ws.onerror = () => {
          setConectado(false);
          ws.close();
        };
      } catch {
        setConectado(false);
        reconnectRef.current = window.setTimeout(conectar, 2500);
      }
    }

    conectar();

    return () => {
      cancelado = true;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  return { conectado, enviar, pendentes: pendentes.length };
}
