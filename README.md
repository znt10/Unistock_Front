# UniStock — Frontend

Interface do sistema UniStock, em Next.js (App Router) e TypeScript.

O codigo da aplicacao fica em [`frontend/`](frontend). Todos os comandos deste
README rodam **de dentro dessa pasta**.

## Sumario

- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Como a autenticacao funciona](#como-a-autenticacao-funciona)
- [Arquitetura](#arquitetura)
- [Rotas](#rotas)

## Tecnologias

| O que | Usado para |
|---|---|
| Next.js 16 (App Router) | base do projeto |
| React 19 / TypeScript | componentes e tipos |
| Tailwind CSS 4 | estilo |
| HeroUI | componentes prontos |
| TanStack Query | cache e sincronia dos dados do servidor |
| Zustand | estado local de sessao |
| next-themes | tema claro/escuro |
| sonner | avisos na tela |

## Como rodar

O backend precisa estar de pe em `http://localhost:8000` — veja o repositorio
[Unistock_Back](https://github.com/znt10/Unistock_Back).

```powershell
cd frontend
npm install
npm run dev
```

O front sobe em `http://localhost:3000`.

```powershell
npm run dev      # desenvolvimento
npm run build    # build de producao
npm run lint     # lint (inclui a regra de fronteira de arquitetura)
```

## Variaveis de ambiente

Crie `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variavel | Para que serve |
|---|---|
| `NEXT_PUBLIC_API_URL` | destino do rewrite `/backend/*`. Default: `http://localhost:8000` |
| `API_PROXY_URL` | opcional; tem prioridade sobre a de cima. Util quando o destino interno difere do publico |

Nao existe segredo no front. **Nenhuma chave de assinatura de token deve ir
neste arquivo** — quem emite e valida JWT e o backend, e o front nunca ve o
token.

## Como a autenticacao funciona

Vale entender antes de mexer, porque explica varias decisoes do codigo.

O backend emite JWT em **cookies HTTP-only**. O JavaScript do front nunca le o
token — e essa e a defesa contra roubo de sessao por XSS.

Para o navegador tratar esses cookies como first-party, toda chamada de API sai
para o **proprio dominio do front**, em `/backend/...`, e o
[`next.config.ts`](frontend/next.config.ts) reescreve para o Django. O front
nao chama `localhost:8000` direto.

O [`proxy.ts`](frontend/proxy.ts) (middleware) cuida do resto:

- barra rotas privadas para quem nao esta logado;
- filtra por papel — `Gerente` e `Responsavel` enxergam conjuntos diferentes de
  rotas, declarados em `ROLE_ROUTES`;
- renova o token expirado e repassa o `Set-Cookie` do backend.

O controle de papel no middleware e conveniencia de navegacao, nao seguranca: a
permissao de verdade e aplicada pelo backend em cada requisicao.

## Arquitetura

Organizacao por **feature**, nao por tipo de arquivo. O que muda junto fica
junto.

```text
frontend/
  app/          rotas (App Router) — monta a tela, nao guarda regra de dominio
  features/     uma pasta por dominio, dona do proprio codigo
    estoque/  lojas/  notificacoes/  pdv/  pedidos/  produtos/  usuarios/
      components/   hooks/   services/   data/   types.ts
  shared/       o que serve a todos: cliente HTTP, auth, store de sessao, UI base
  components/   legado que ainda nao encontrou lugar
  proxy.ts      middleware de rota
```

A regra que sustenta isso:

> `shared/` nao importa de rota nem de feature.

Se `shared/` puxasse de uma feature, a dependencia se inverteria e a pasta
deixaria de ser comum na pratica. A regra e verificada no lint
([`eslint.config.mjs`](frontend/eslint.config.mjs)) — nao depende de ninguem
lembrar dela na revisao. Se algo em `shared/` precisa de uma feature, e sinal
de que aquilo nao era comum, ou de que o pedaco comum deveria ter sido movido
para dentro de `shared/`.

Onde procurar o que:

| Procurando | Vai em |
|---|---|
| chamada de API de um dominio | `features/<dominio>/services/` |
| busca e cache de dados | `features/<dominio>/hooks/` (TanStack Query) |
| componente de uma tela so | `features/<dominio>/components/` |
| componente usado por todo mundo | `shared/components/` |
| cliente HTTP, login, sessao | `shared/services/`, `shared/stores/` |

## Rotas

| Rota | Tela |
|---|---|
| `/login`, `/esqueci-senha`, `/redefinir-senha/[token]` | acesso (publicas) |
| `/confirmar-conta/[token]` | confirmacao de cadastro |
| `/` | inicio |
| `/estoque`, `/estoque-baixo`, `/historico` | estoque |
| `/produtos`, `/produtos/[categoria]`, `/produtos/novo` | produtos |
| `/novopedido`, `/meuspedidos` | pedidos |
| `/caixa` | PDV |
| `/lojas`, `/lojas/novaloja`, `/lojas/detalhes/[id]`, `/lojas/editar/[id]` | lojas (gerente) |
| `/painel_unidade` | painel da unidade (gerente) |
| `/notificacoes` | notificacoes |
| `/configuracoes` e subpaginas | conta, notificacoes, personalizacao |
