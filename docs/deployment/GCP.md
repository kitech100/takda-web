# Deploy Takda on a GCP Compute Engine VM

This is the first production path for learning server operations. The same application can later move MySQL to Cloud SQL, Redis to Memorystore, and container execution to Cloud Run or GKE without changing the domain layer.

## 1. Prepare the VM

Use a current Ubuntu LTS VM, reserve a static external IP, install Docker Engine and the Compose plugin, and allow inbound HTTP/HTTPS. Keep SSH restricted to trusted IPs or use Identity-Aware Proxy. Do not create a public firewall rule for MySQL or Redis.

Clone the repository on the VM, then create the production environment file:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Replace every example domain, password, OAuth value, mail credential, and Reverb secret. Generate the Laravel key without writing it to shell history where possible:

```bash
docker compose --env-file .env.production -f compose.prod.yaml run --rm app php artisan key:generate --show
```

Paste the result into `APP_KEY` in `.env.production`.

## 2. Build and launch

Compose interpolation must use the production file explicitly:

```bash
docker compose --env-file .env.production -f compose.prod.yaml build
docker compose --env-file .env.production -f compose.prod.yaml up -d
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan migrate --force
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan optimize
```

The stack runs separate app, nginx, Horizon, scheduler, Reverb, MySQL, and Redis containers. Check it with:

```bash
docker compose --env-file .env.production -f compose.prod.yaml ps
docker compose --env-file .env.production -f compose.prod.yaml logs --tail=200 app nginx horizon scheduler reverb
curl -fsS http://127.0.0.1/up
```

The included nginx container serves HTTP. Terminate HTTPS with a GCP HTTPS Load Balancer or a separately managed TLS reverse proxy, then forward traffic to the VM HTTP port. WebSocket forwarding for `/app/` and `/apps/` is already configured inside Takda nginx.

## 3. Release updates

Back up the database, fetch the release, then rebuild and migrate:

```bash
docker compose --env-file .env.production -f compose.prod.yaml build --pull
docker compose --env-file .env.production -f compose.prod.yaml up -d
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan migrate --force
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan optimize
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan horizon:terminate
```

Horizon exits gracefully and Compose restarts it on the new code. For migrations that cannot safely run alongside the old release, enable Laravel maintenance mode during the deployment.

## 4. Connect DBGate safely

MySQL is bound to `127.0.0.1` on the VM. Create an SSH tunnel from your computer:

```bash
gcloud compute ssh VM_NAME --zone=VM_ZONE -- -N -L 3307:127.0.0.1:3306
```

Keep that terminal open. In DBGate use host `127.0.0.1`, port `3307`, database/user values from `.env.production`, and the application database password. Do not use the MySQL root account for routine inspection.

## 5. Operations checklist

- Send database backups to a separate GCS bucket and regularly test a restore.
- Monitor disk space, container restarts, `/up`, Horizon, Pulse, failed jobs, and mail delivery.
- Rotate database, Redis, Google OAuth, SMTP, Reverb, and application secrets.
- Keep MySQL and Redis private. Prefer Cloud SQL private IP and Memorystore when moving beyond the practice VM.
- Store uploaded files in Cloud Storage before running more than one app VM.
- Run `composer audit` and `npm audit` in CI, then execute the repository quality checks before deployment.

