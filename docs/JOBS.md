# Server jobs

## Score a profile
POST /api/jobs/score
Body: {"profileId":"mountain-house"}

If HOUSE_HUNTER_JOB_TOKEN is configured, send:
Authorization: Bearer <token>

The job loads normalized listings, applies confirmed factual criteria, asks Jev for text-supported criteria, merges evidence by precedence, calculates score + coverage, and persists ListingScore.

## Rankings
GET /api/rankings?profileId=mountain-house&limit=40

Returns persisted scores ordered by match score then evidence coverage.

## Security
Set HOUSE_HUNTER_JOB_TOKEN in production. Do not expose JEV_API_KEY or job tokens to client components.
