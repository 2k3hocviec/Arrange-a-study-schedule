# Schedule Course Monorepo

This repository combines the frontend and backend projects into one workspace.

## Structure

- `frontend/` - React app
- `backend/` - NestJS API with Prisma

## Environment

All runtime environment variables are managed from the root `.env` file.

```sh
cp .env.example .env
```

This project already uses Docker service hostnames internally. For local commands outside Docker, `DATABASE_URL` and `REDIS_HOST` can stay on `localhost`. For Docker, `docker-compose.yml` overrides them with `postgres` and `redis`.

`RUN_DB_SEED=true` makes Docker run `backend/prisma/seed.ts` after `prisma db push`. The seed script clears and recreates seed data, so set `RUN_DB_SEED=false` when you want to keep data between restarts.

## Docker

Run the whole stack:

```sh
npm.cmd run docker:up
```

Or detached:

```sh
npm.cmd run docker:up:detached
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Reset database volume and run seed again on the next up:

```sh
npm.cmd run docker:reset
npm.cmd run docker:up
```

## Install

```sh
npm run install:all
```

Or install each app separately:

```sh
npm run install:frontend
npm run install:backend
```

## Development

Run the backend:

```sh
npm run backend:dev
```

Run the frontend in another terminal:

```sh
npm run frontend:dev
```

By default, the frontend uses `http://localhost:8000` for the API when running on localhost. The backend defaults to port `8000`.

## Build and Test

```sh
npm run backend:build
npm run frontend:build
npm run backend:test
npm run frontend:test
```

## Database

Backend Prisma commands are available from the root:

```sh
npm run backend:prisma:generate
npm run backend:prisma:push
npm run backend:seed
```

View the database with Prisma Studio: (Xem database)

```sh
cd backend
npm install
npx prisma studio
```
