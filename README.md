# Nest Product CRUD

Backend technical exercise built with NestJS, Sequelize and MySQL.

## Tech Stack

- Node.js 20+
- TypeScript
- NestJS
- Sequelize + MySQL
- Swagger (`/api/docs`)
- class-validator / class-transformer
- Jest (unit + e2e)

## Project Structure

- `backend/`: NestJS API
- `mysql-init/`: MySQL init script
- `docker-compose.yml`: local infrastructure (MySQL + backend)

## Environment Setup

1. Copy env files:

```bash
cp .env_SAMPLE .env
cp backend/.env_SAMPLE backend/.env
cp backend/.env.e2e_SAMPLE backend/.env.e2e
```

2. Review values if needed (`passwords`, `ports`).

## Run with Docker (recommended)

```bash
docker compose up --build
```

Endpoints:

- API: `http://localhost:${BACKEND_HOST_PORT}` (default `3000`)
- Swagger: `http://localhost:${BACKEND_HOST_PORT}/api/docs`
- MySQL: `localhost:${MYSQL_HOST_PORT}` (default `3306`)

Stop:

```bash
docker compose down
```

## Run Backend Locally (using Docker MySQL)

```bash
docker compose up -d mysql
cd backend
npm install
npm run start:dev
```

If you run the backend locally, set `DB_HOST=localhost` in `backend/.env`.

## Available Scripts (backend)

From the `backend/` directory:

```bash
npm run start:dev   # dev server
npm run lint        # eslint
npm run test        # unit tests
npm run test:e2e    # e2e tests
npm run build       # production build
```

## API Summary

Base path: `/products`

- `POST /products`
- `GET /products?page=1&limit=10`
- `GET /products/:id`
- `PATCH /products/update-stock/:id`
- `DELETE /products/:id`

Example payload (`POST /products`):

```json
{
  "productToken": "prod-001",
  "name": "Mouse",
  "price": 24.99,
  "stock": 10
}
```
