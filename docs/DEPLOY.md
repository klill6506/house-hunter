# Coolify deployment

House Hunter is designed for a Coolify application plus PostgreSQL.

## App
- Repository: klill6506/house-hunter
- Branch: main
- Build: Dockerfile
- Port: 3000
- Domain: house-hunter.kenlill.com

## Environment
Copy the keys from .env.example into Coolify secrets/environment variables. Never commit real credentials.

## Database
Create a PostgreSQL resource in Coolify and provide its internal connection string as DATABASE_URL.

## First deployment
The Docker image installs from `package-lock.json`, generates the Prisma client, and builds Next.js. The existing startup command runs `prisma db push`, bootstraps the default profile if absent, and starts the app. This release preserves that setup and makes no schema changes.

Keep `JEV_API_KEY` and `DATABASE_URL` available at runtime only in Coolify; neither secret is needed to build the image. The Jev key is server-side and must never use a `NEXT_PUBLIC_` prefix.

The homepage ranks imported PostgreSQL inventory immediately and displays up to 40 homes, ten at a time. It does not silently substitute sample listings. Public discovery batches are imported through /api/import; automatic discovery is not configured. Jev enrichment remains a separate job. Profile preferences survive redeployments.
