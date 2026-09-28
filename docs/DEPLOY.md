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
The Docker image installs from `package-lock.json`, generates the Prisma client, and builds Next.js. On startup it runs `prisma migrate deploy` before starting the app. The initial migration creates the committed schema in the dedicated database.

Keep `JEV_API_KEY` and `DATABASE_URL` available at runtime only in Coolify; neither secret is needed to build the image. The Jev key is server-side and must never use a `NEXT_PUBLIC_` prefix.

The current homepage is a prototype using bundled sample listings, with Love/Like/Pass feedback saved in browser storage. Deploying and configuring Jev does not yet wire live discovery or Jev scoring into that homepage.
