# UniStock — Frontend

Interface do sistema UniStock, desenvolvida com Next.js e TypeScript.

## Tecnologias

- Next.js 15
- React, TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)

## Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz desta pasta:

```env
JWT_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG_MODE=true
```

## Como Rodar

Instale as dependencias:

```powershell
npm install
```

Rode o servidor de desenvolvimento:

```powershell
npm run dev
```

O frontend fica disponivel em `http://localhost:3000`.

## Comandos Uteis

```powershell
npm run dev      # servidor de desenvolvimento
npm run build    # build de producao
npm run lint     # verificar erros de lint
```

## Observacoes

- O backend precisa estar rodando em `http://localhost:8000` para o frontend funcionar.
- A autenticacao usa JWT salvo em cookies HTTP-only gerenciados pelo backend.
- Usuarios precisam estar no grupo `Gerente` ou `Responsavel` para acessar o sistema.
