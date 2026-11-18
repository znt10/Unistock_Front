/**
 * O logo do Unistock: tres caixas empilhadas que tambem sao os "olhos" do QR
 * que a loja le na chegada. As formas vem dos arquivos mestres do kit do logo
 * (fora do repo); as regras de uso estao no guia que acompanha o kit.
 *
 * O simbolo e sempre laranja. A palavra "unistock" usa a cor do texto
 * (currentColor), entao segue o tema: escura no claro, branca no escuro.
 */

const LARANJA = "#E8590C";

// Anel das caixas com 20 unidades (em 256).
const SIMBOLO =
  "M93 32H163A9 9 0 0 1 172 41V111A9 9 0 0 1 163 120H93A9 9 0 0 1 84 111V41A9 9 0 0 1 93 32ZM106 52A2 2 0 0 0 104 54V98A2 2 0 0 0 106 100H150A2 2 0 0 0 152 98V54A2 2 0 0 0 150 52ZM118 63H138A3 3 0 0 1 141 66V86A3 3 0 0 1 138 89H118A3 3 0 0 1 115 86V66A3 3 0 0 1 118 63ZM43 132H113A9 9 0 0 1 122 141V211A9 9 0 0 1 113 220H43A9 9 0 0 1 34 211V141A9 9 0 0 1 43 132ZM56 152A2 2 0 0 0 54 154V198A2 2 0 0 0 56 200H100A2 2 0 0 0 102 198V154A2 2 0 0 0 100 152ZM68 163H88A3 3 0 0 1 91 166V186A3 3 0 0 1 88 189H68A3 3 0 0 1 65 186V166A3 3 0 0 1 68 163ZM143 132H213A9 9 0 0 1 222 141V211A9 9 0 0 1 213 220H143A9 9 0 0 1 134 211V141A9 9 0 0 1 143 132ZM156 152A2 2 0 0 0 154 154V198A2 2 0 0 0 156 200H200A2 2 0 0 0 202 198V154A2 2 0 0 0 200 152ZM168 163H188A3 3 0 0 1 191 166V186A3 3 0 0 1 188 189H168A3 3 0 0 1 165 186V166A3 3 0 0 1 168 163Z";

// Anel 10% mais fino: laranja e branco sobre fundo escuro parecem mais grossos.
const SIMBOLO_FINO =
  "M93 32H163A9 9 0 0 1 172 41V111A9 9 0 0 1 163 120H93A9 9 0 0 1 84 111V41A9 9 0 0 1 93 32ZM104 50A2 2 0 0 0 102 52V100A2 2 0 0 0 104 102H152A2 2 0 0 0 154 100V52A2 2 0 0 0 152 50ZM117 62H139A3 3 0 0 1 142 65V87A3 3 0 0 1 139 90H117A3 3 0 0 1 114 87V65A3 3 0 0 1 117 62ZM43 132H113A9 9 0 0 1 122 141V211A9 9 0 0 1 113 220H43A9 9 0 0 1 34 211V141A9 9 0 0 1 43 132ZM54 150A2 2 0 0 0 52 152V200A2 2 0 0 0 54 202H102A2 2 0 0 0 104 200V152A2 2 0 0 0 102 150ZM67 162H89A3 3 0 0 1 92 165V187A3 3 0 0 1 89 190H67A3 3 0 0 1 64 187V165A3 3 0 0 1 67 162ZM143 132H213A9 9 0 0 1 222 141V211A9 9 0 0 1 213 220H143A9 9 0 0 1 134 211V141A9 9 0 0 1 143 132ZM154 150A2 2 0 0 0 152 152V200A2 2 0 0 0 154 202H202A2 2 0 0 0 204 200V152A2 2 0 0 0 202 150ZM167 162H189A3 3 0 0 1 192 165V187A3 3 0 0 1 189 190H167A3 3 0 0 1 164 187V165A3 3 0 0 1 167 162Z";

// Sem o quadradinho do meio, numa grade de 16 unidades: nitido em 16, 32 e 48 px.
const SIMBOLO_PEQUENO =
  "M88 16H168A8 8 0 0 1 176 24V104A8 8 0 0 1 168 112H88A8 8 0 0 1 80 104V24A8 8 0 0 1 88 16ZM112 48V80H144V48ZM24 144H104A8 8 0 0 1 112 152V232A8 8 0 0 1 104 240H24A8 8 0 0 1 16 232V152A8 8 0 0 1 24 144ZM48 176V208H80V176ZM152 144H232A8 8 0 0 1 240 152V232A8 8 0 0 1 232 240H152A8 8 0 0 1 144 232V152A8 8 0 0 1 152 144ZM176 176V208H208V176Z";

const PALAVRA =
  "M270 80H290V132H270ZM360 132A45 45 0 0 1 270 132L290 132A25 25 0 0 0 340 132ZM340 80H360V176H340ZM382 80H402V176H382ZM382 124A45 45 0 0 1 472 124L452 124A25 25 0 0 0 402 124ZM452 124H472V176H452ZM494 80H514V176H494ZM492 46H516V70H492ZM570 80H599V98H570ZM570.5 137A32.5 28.5 0 0 1 570.5 80L570.5 98A11.5 10.5 0 0 0 570.5 119ZM569 119H571.5V137H569ZM569.5 119A32.5 28.5 0 0 1 569.5 176L569.5 158A11.5 10.5 0 0 0 569.5 137ZM541 158H570V176H541ZM632 52H652V176H632ZM620 80H666V100H620ZM778 128A49 49 0 0 1 680 128L700 128A29 29 0 0 0 758 128ZM680 128A49 49 0 0 1 778 128L758 128A29 29 0 0 0 700 128ZM877.65 162.65A49 49 0 1 1 877.65 93.35L863.51 107.49A29 29 0 1 0 863.51 148.51ZM898 40H918V176H898ZM945.7 80L974 80L908 146L908 117.7ZM910.1 100L933.2 100L977.1 176L954 176Z";

type LogoProps = {
  className?: string;
  /** Use quando o fundo for escuro fixo (ex.: a barra lateral). */
  fundoEscuro?: boolean;
};

/** So o simbolo. Abaixo de 24 px, passe `pequeno`. Decorativo: de nome ao pai. */
export function LogoSimbolo({
  className,
  fundoEscuro,
  pequeno,
}: LogoProps & { pequeno?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={pequeno ? "16 16 224 224" : "34 32 188 188"}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={LARANJA}
        d={pequeno ? SIMBOLO_PEQUENO : fundoEscuro ? SIMBOLO_FINO : SIMBOLO}
      />
    </svg>
  );
}

/** Simbolo + "unistock" na horizontal. De a altura pela className (ex.: h-8 w-auto). */
export function LogoUnistock({ className, fundoEscuro }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="34 32 944 188"
      className={className}
      role="img"
      aria-label="Unistock"
    >
      <path fill={LARANJA} d={fundoEscuro ? SIMBOLO_FINO : SIMBOLO} />
      <path fill="currentColor" d={PALAVRA} />
    </svg>
  );
}
