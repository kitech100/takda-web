# Takda Web

Takda is a multi-business booking and operations platform. This repository contains the Laravel backend, React/Inertia admin web app, and the Docker services needed to run it.

## Included foundation

- Laravel 13, PHP 8.5 Docker runtime, React 19, TypeScript, Inertia, Tailwind CSS 4, and shadcn-style UI components
- Password, passkey, two-factor, email-verification, and Google authentication
- MySQL 8.4, Redis 8, nginx, Horizon queues, scheduler, Reverb WebSockets, and Mailpit
- Businesses, locations, staff, services, customers, appointments, availability, notification delivery, and daily analytics data models
- Transactional appointment creation with per-staff/day locks and overlap protection
- Platform and business roles, policies, public UUIDs, activity logs, and Laravel Sanctum for the future mobile API
- Soft deletion for user-managed business data, with explicit archive and restore actions
- PHPUnit, PHPStan/Larastan, Pint, ESLint, Prettier, and TypeScript checks

The dashboard is functional. The remaining business pages are routed shells ready to be mapped to the completed Figma components screen by screen.

## Start with Docker

Requirements: Docker Desktop (or Docker Engine with Compose v2). No host PHP, Composer, MySQL, Redis, or Node installation is required.

```powershell
Copy-Item .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

Open:

- Web app: `http://localhost:8080`
- Vite dev server: `http://localhost:5173`
- Mailpit: `http://localhost:8025`
- Health endpoint: `http://localhost:8080/up`
- Horizon: `http://localhost:8080/horizon`
- Pulse: `http://localhost:8080/pulse`

The local seed account is `admin@takda.test` with password `password`. Change or remove it outside local development.

Useful commands:

```powershell
docker compose exec app php artisan migrate
docker compose exec app php artisan test
docker compose exec app php artisan horizon:status
docker compose logs -f app nginx horizon scheduler reverb
docker compose down
```

Use `docker compose down -v` only when you intentionally want to erase the local MySQL, Redis, Composer vendor, and Node dependency volumes.

## DBGate

The MySQL port is bound to loopback only. Create a MySQL connection in DBGate with:

| Setting | Local value |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `3306` |
| Database | `takda` |
| User | `takda` |
| Password | The `DB_PASSWORD` value in `.env` |

If port 3306 is already used, set `FORWARD_DB_PORT=3307` in `.env` and use port 3307 in DBGate. Production access should use an SSH tunnel; never open MySQL port 3306 to the internet.

## Google login

Create OAuth web credentials in Google Cloud Console and add this local callback URL:

`http://localhost:8080/auth/google/callback`

Then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

## Quality checks

```powershell
docker compose exec app composer test
docker compose exec node npm run types:check
docker compose exec node npm run lint:check
docker compose exec node npm run format:check
docker compose exec node npm run build
```

See [coding structure](docs/architecture/STRUCTURE.md) and [GCP deployment](docs/deployment/GCP.md).

