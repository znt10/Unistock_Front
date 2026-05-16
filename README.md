# UniStock

Sistema de gestao de estoque e pedidos com backend em Django REST Framework e frontend em Next.js.

O projeto possui controle de usuarios por grupo, autenticacao via JWT em cookies, cadastro de lojas, produtos, estoque e pedidos.

## Tecnologias

- Backend: Django, Django REST Framework, Simple JWT, MySQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Zustand
- Ambiente: Docker Compose para o backend

## Estrutura

```text
backend/   API Django
frontend/  Aplicacao Next.js
tests/     Testes auxiliares
```

## Como Rodar

### 1. Backend

Entre na pasta do backend:

```powershell
cd "D:\5 Periodo\backend"
```

Suba a API com Docker Compose:

```powershell
docker compose up --build
```

Ou em segundo plano:

```powershell
docker compose up -d --build
```

A API ficara disponivel em:

```text
http://localhost:8000
```

Para parar:

```powershell
docker compose down
```

### 2. Banco de Dados

O backend usa MySQL. No arquivo `backend/.env`, confira:

```env
DB_ENGINE=django.db.backends.mysql
DB_NAME=p5
DB_USER=root
DB_PASSWORD=12345
DB_HOST=localhost
DB_PORT=3306
```

No Docker Compose, o backend usa `host.docker.internal` para acessar o MySQL da maquina host.

### 3. Migracoes

Com o container rodando:

```powershell
docker compose exec api python manage.py migrate
```

### 4. Grupos e Permissoes

O projeto usa fixture para criar grupos:

```powershell
docker compose exec api python manage.py loaddata groups
```

Grupos criados:

- `Gerente`
- `Responsavel`

### 5. Criar Superusuario

```powershell
docker compose exec api python manage.py createsuperuser
```

### 6. Frontend

Em outro terminal, entre na pasta do frontend:

```powershell
cd "D:\5 Periodo\frontend"
```

Instale as dependencias se ainda nao instalou:

```powershell
npm install
```

Rode o servidor:

```powershell
npm run dev
```

O frontend ficara disponivel em:

```text
http://localhost:3000
```

## URLs Principais

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Schema OpenAPI: `http://localhost:8000/api/schema/`
- Swagger: `http://localhost:8000/api/schema/swagger/`

## Login

O login e feito em:

```text
POST /login/
```

O backend retorna os dados do usuario junto com o login, sem precisar chamar `/api/v1/user/me/` logo depois.

Exemplo de resposta:

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "first_name": "Usuario",
    "group": "Gerente",
    "loja": null
  }
}
```

## IDs Publicos

Os models principais possuem `public_id` em UUID. A API mostra esse UUID no campo `id`, para evitar expor IDs numericos internos.

Exemplo:

```json
{
  "id": "9d543ab7-50a1-11f1-bacf-3c7c3f7b9a64",
  "nome_loja": "Loja Centro"
}
```

Rotas de detalhe tambem usam o UUID:

```text
/api/v1/lojas/9d543ab7-50a1-11f1-bacf-3c7c3f7b9a64/
```

## Comandos Uteis

Backend:

```powershell
docker compose exec api python manage.py check
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
docker compose exec api python manage.py shell
docker compose exec api python manage.py loaddata groups
```

Frontend:

```powershell
npm run dev
npm run lint
npm run build
```

## Observacoes

- Para rodar comandos Django, prefira usar Docker: `docker compose exec api python manage.py ...`
- O ambiente virtual local pode falhar se o `mysqlclient` nao estiver instalado corretamente.
- Usuarios precisam estar nos grupos `Gerente` ou `Responsavel` para acessar o sistema corretamente.
