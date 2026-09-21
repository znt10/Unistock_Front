import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Liga a camera traseira e chama `onLido` com o texto de cada QR visto.
 *
 * Usa o BarcodeDetector do navegador quando existe (Chrome no Android) e o
 * jsQR quando nao existe (Safari no iPhone). O jsQR so e baixado nesse caso.
 *
 * Chama `onLido` varias vezes por segundo enquanto o QR estiver na frente da
 * camera: ignorar repeticoes e trabalho de quem usa (ver useLeituraDeCaixa).
 */
type BarcodeDetectorLike = {
  detect: (fonte: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};
type BarcodeDetectorCtor = new (opcoes: { formats: string[] }) => BarcodeDetectorLike;

export type EstadoDaCamera = "iniciando" | "lendo" | "negada" | "indisponivel";

// Uma olhada a cada 250 ms basta para quem aponta a camera e poupa bateria.
const INTERVALO_MS = 250;

export function useLeitorQR(
  videoRef: RefObject<HTMLVideoElement | null>,
  onLido: (texto: string) => void,
) {
  const [estado, setEstado] = useState<EstadoDaCamera>("iniciando");
  // Ref para o laco sempre chamar a versao mais nova sem religar a camera.
  const onLidoRef = useRef(onLido);
  useEffect(() => {
    onLidoRef.current = onLido;
  }, [onLido]);

  useEffect(() => {
    let parado = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const iniciar = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setEstado("indisponivel");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch (erro) {
        const nome = erro instanceof DOMException ? erro.name : "";
        setEstado(nome === "NotAllowedError" ? "negada" : "indisponivel");
        return;
      }
      if (parado) {
        stream.getTracks().forEach((trilha) => trilha.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play().catch(() => {});
      setEstado("lendo");

      const Nativo = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
        .BarcodeDetector;
      const detector = Nativo ? new Nativo({ formats: ["qr_code"] }) : null;
      const jsQR = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const contexto = canvas.getContext("2d", { willReadFrequently: true });

      const olhar = async () => {
        if (parado) return;
        try {
          if (video.readyState >= video.HAVE_CURRENT_DATA) {
            let texto: string | undefined;
            if (detector) {
              texto = (await detector.detect(video))[0]?.rawValue;
            } else if (jsQR && contexto && video.videoWidth) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imagem = contexto.getImageData(0, 0, canvas.width, canvas.height);
              texto = jsQR(imagem.data, imagem.width, imagem.height, {
                inversionAttempts: "dontInvert",
              })?.data;
            }
            if (texto) onLidoRef.current(texto);
          }
        } catch {
          // Um quadro ruim nao para a leitura; o proximo tenta de novo.
        }
        timer = setTimeout(olhar, INTERVALO_MS);
      };
      olhar();
    };

    iniciar();

    return () => {
      parado = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((trilha) => trilha.stop());
    };
  }, [videoRef]);

  return { estado };
}
