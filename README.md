# House Hunter

Personalized real-estate discovery and ranking built around saved search profiles, broad listing ingestion, atomic criterion scoring, photo/text enrichment, and a small ranked review queue.

## First profile
Mountain House: $500k–$1.2m, roughly within 3 hours of Athens GA, genuine mountain view required. Preferences live in `lib/profile.ts`.

## Pipeline
1. Ingest permitted/authorized listing and FSBO sources.
2. Normalize and deduplicate.
3. Apply true hard filters only.
4. Score atomic text criteria with Jev; unknown stays unknown.
5. Use a vision-capable model for listing photos.
6. Enrich finalists (internet, drive times, STR rules, hazards, etc.).
7. Rank per profile and show ~40 candidates.
8. Store Love / Like / Pass feedback and tune weights without deleting lower-ranked inventory.

## Deployment
Next.js, container-ready for Coolify. Intended hostname: `house-hunter.kenlill.com`.

## Local
```
npm install
npm run dev
```
