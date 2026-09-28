import { db } from "./db";
import { configOf, inPriceRange, profileCriteria } from "./profile-config";
import { factualCriteria, rankListing } from "./rank";
import type { CriterionResult, Listing, RankedListing } from "./types";
export const REVIEW_LIMIT = 40;
export const PAGE_SIZE = 10;
// Neutral unknowns affect ordering only; the displayed match still uses known evidence.
export function rankingPriority(l: Pick<RankedListing, "score" | "coverage">) {
  return 50 + ((l.score - 50) * l.coverage) / 100;
}
export function topMatches<T extends RankedListing>(listings: T[]): T[] {
  return [...listings]
    .sort(
      (a, b) =>
        rankingPriority(b) - rankingPriority(a) ||
        b.coverage - a.coverage ||
        a.id.localeCompare(b.id),
    )
    .slice(0, REVIEW_LIMIT);
}
export function pageLimit(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, REVIEW_LIMIT) : PAGE_SIZE;
}
export async function getReviewQueue(profileId: string) {
  const profile = await db.searchProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return null;
  const config = configOf(profile.criteria);
  // Imported homes qualify immediately, even before an enrichment job has run.
  const rows = await db.listing.findMany({
    include: {
      scores: { orderBy: { scoredAt: "desc" }, take: 1 },
      sightings: { orderBy: { discoveredAt: "desc" }, take: 1 },
    },
  });
  const ranked = rows
    .map((row) => {
      const listing: Listing = {
        ...row,
        price: row.price ?? 0,
        beds: row.beds ?? 0,
        baths: row.baths ?? 0,
        sqft: row.sqft ?? undefined,
        acres: row.acres ?? undefined,
        url: row.url ?? undefined,
        description: row.description ?? undefined,
        facts: row.facts as Record<string, unknown> | undefined,
      };
      if (!inPriceRange(listing, config)) return null;
      const saved = row.scores[0]?.criteria as CriterionResult[] | undefined;
      return {
        ...rankListing(
          listing,
          profileCriteria(listing, saved || factualCriteria(listing), config),
        ),
        discoveredAt: row.sightings[0]?.discoveredAt.toISOString() ?? null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
  return {
    profile,
    config,
    listings: topMatches(ranked),
    inventoryCount: rows.length,
    matchingCount: ranked.length,
  };
}
