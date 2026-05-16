export const LOJAS_ESTOQUE = [
  "LAPA",
  "PIRITUBA",
  "TIETE",
  "CACHOEIRINHA",
  "ITABERABA",
  "CLIPPER",
  "LIMAO",
  "ZILDA",
] as const;

export const CATEGORIAS_ESTOQUE = {
  "SALGADOS GDE": {
    cor: "orange",
    produtos: [
      "Coxinha",
      "Risoles de queijo",
      "Risole presunto e queijo",
      "Bolinho de carne",
      "Kibe",
      "Kibe Queijo",
      "Salsicha",
      "Bolinho ovo",
    ],
  },
  "SALGADOS MINI": {
    cor: "orange",
    temEstado: true,
    produtos: [
      "Coxinha",
      "Risoles de queijo",
      "Risole presunto e queijo",
      "Bolinho de carne",
      "Kibe",
      "Kibe Queijo",
    ],
  },
  "ESFIHAS GDE": {
    cor: "red",
    produtos: [
      "Carne",
      "Frango",
      "Bauru",
      "Calabresa",
      "Hamburger",
      "Salsicha com cheddar",
      "Torta de banana",
    ],
  },
  "ESFIHAS MINI": {
    cor: "red",
    produtos: [
      "Carne",
      "Frango",
      "Bauru",
      "Calabresa",
      "Hamburger",
      "Salsicha com cheddar",
      "Torta de banana",
    ],
  },
  RECHEIOS: {
    cor: "blue",
    produtos: [
      "Acucar+canela",
      "Bisnaga de chocolate",
      "Bisnaga doce de leite",
      "Bisnaga Beijinho",
      "Calabresa",
      "Carne",
      "Catupiry",
      "Frango",
      "Laranja",
      "Limao",
      "Massa de empada",
      "Massa Pastel",
      "Mussarela",
      "Oleo",
      "Oregano",
      "Ovo",
      "Palmito",
      "Pimenta",
      "Presunto",
      "Tomate",
    ],
  },
  MERCADO: {
    cor: "green",
    produtos: [
      "Acucar",
      "Cafe",
      "Detergente",
      "Leite",
      "Nescau",
      "Bombril",
      "Adocante",
    ],
  },
} as const;

export const ESTADOS_PRODUTO = ["Normal", "Congelado", "Resfriado"] as const;

export type LojaEstoque = (typeof LOJAS_ESTOQUE)[number];
export type CategoriaEstoque = keyof typeof CATEGORIAS_ESTOQUE;
export type EstadoProduto = (typeof ESTADOS_PRODUTO)[number];

export type ItemEstoqueData = {
  qtd: number;
  estado?: EstadoProduto;
  updatedAt?: string;
};

export type EstoqueLocal = Record<
  string,
  Record<string, Record<string, ItemEstoqueData>>
>;

export function criarEstoqueInicial(): EstoqueLocal {
  const agora = new Date().toISOString();

  return LOJAS_ESTOQUE.reduce<EstoqueLocal>((acc, loja) => {
    acc[loja] = {};

    Object.entries(CATEGORIAS_ESTOQUE).forEach(([categoria, config]) => {
      acc[loja][categoria] = {};
      config.produtos.forEach((produto) => {
        acc[loja][categoria][produto] = {
          qtd: 0,
          estado: "Normal",
          updatedAt: agora,
        };
      });
    });

    return acc;
  }, {});
}
