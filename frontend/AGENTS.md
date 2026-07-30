# Contexto do frontend

Projeto: Unistock
Parte: Frontend
Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query

## Estrutura

```
frontend/
├── app/                # Pages (App Router)
│   ├── caixa/
│   ├── configuracoes/
│   ├── esqueci-senha/
│   ├── estoque/
│   ├── historico/
│   ├── login/
│   ├── lojas/
│   ├── meuspedidos/
│   ├── notificacoes/
│   ├── novopedido/
│   ├── painel_unidade/
│   ├── produtos/
│   └── redefinir-senha/
├── components/         # Componentes React (estoque, pdv, pedidos, usuarios, HeroUI)
├── services/           # Chamadas API (api.ts, auth.ts, pdv.ts, uni.ts)
├── stores/             # Estado global Zustand (authStore.ts)
├── hooks/
├── types/
└── data/
```

## Regras do frontend

- Integrar com a API do backend Django REST Framework.
- Usar JWT no fluxo de login.
- Nao alterar o fluxo de autenticacao sem avisar antes.
- Nao expor dados de outras lojas na interface.
- Tratar usuario comum e admin conforme as permissoes vindas do backend.
- Manter componentes simples, organizados e reutilizaveis quando fizer sentido.
- Evitar criar regras de permissao apenas no frontend; a seguranca principal deve estar no backend.

## Como rodar

```bash
npm run dev
```

## Antes de finalizar

- Verificar se o login ainda funciona.
- Verificar se as chamadas para a API continuam usando o token corretamente.
- Explicar quais telas, componentes ou servicos foram alterados.
