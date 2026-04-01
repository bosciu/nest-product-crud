# Nest Product CRUD

Small full stack project for product management.

- `backend`: NestJS REST API + Sequelize + MySQL
- `frontend`: Next.js app (base scaffold)

## Stack

- Node.js / TypeScript
- NestJS
- Sequelize + MySQL
- Swagger (`/api/docs`)
- class-validator / class-transformer
- Jest (unit + e2e)
- Next.js (frontend)

## Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose

## Quick Setup (recommended with Docker)

1. Copy env files:

```bash
cp .env_SAMPLE .env
cp backend/.env_SAMPLE backend/.env
cp backend/.env.e2e_SAMPLE backend/.env.e2e
```

2. Start services:

```bash
docker compose up --build
```

Exposed services:

- MySQL: `localhost:${MYSQL_HOST_PORT}` (default `3306`)
- Backend: `http://localhost:${BACKEND_HOST_PORT}` (default `3000`)
- Swagger: `http://localhost:${BACKEND_HOST_PORT}/api/docs`

Stop services:

```bash
docker compose down
```

## Environment Variables

### Root `.env`

Used by `docker-compose.yml`.

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_HOST_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `BACKEND_HOST_PORT`

### Backend `backend/.env`

Used by the backend in normal mode.

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### Backend tests `backend/.env.e2e`

Used by e2e tests (`NODE_ENV=test`).

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Why is `DB_HOST` different between `.env` and `.env.e2e`?

It depends on where the process runs:

- If backend runs **inside Docker Compose**, use `DB_HOST=mysql` (Docker service name).
- If tests run **from your host terminal** (`npm run test:e2e` locally), use `DB_HOST=localhost` (published port).

So using `mysql` in `.env` and `localhost` in `.env.e2e` is expected.

## Run backend locally (without backend container)

If you want to run Nest locally and keep MySQL in Docker:

```bash
docker compose up -d mysql
cd backend
npm install
npm run start:dev
```

In this case, `backend/.env` should use `DB_HOST=localhost`.

## Backend scripts

From the `backend` folder:

```bash
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Main API endpoints

Base path: `/products`

- `POST /products` create product
- `GET /products?page=1&limit=10` paginated list
- `GET /products/:id` product details
- `PATCH /products/update-stock/:id` update stock
- `DELETE /products/:id` delete product

## Create payload example

```json
{
  "productToken": "prod-001",
  "name": "Mouse",
  "price": 24.99,
  "stock": 10
}
```
