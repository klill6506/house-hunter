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
Run Prisma migrations/deploy before starting the production app once migrations are introduced. The schema is committed now so the persistence contract is stable before wiring API routes.
