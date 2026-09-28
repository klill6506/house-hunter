import { db } from "./db";
import { evaluatePropertyText } from "./jev-client";
import { factualCriteria, rankListing } from "./rank";
import { mergeCriteria } from "./pipeline";
import { configOf, inPriceRange, profileCriteria } from "./profile-config";
import type { Listing } from "./types";
export async function scoreProfile(profileId: string) {
  const profile = await db.searchProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) throw new Error("Profile not found");
  const cfg = configOf(profile.criteria);
  const rows = await db.listing.findMany();
  let scored = 0;
  for (const row of rows) {
    const l: Listing = {
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
    if (!inPriceRange(l, cfg)) continue;
    let jev: Awaited<ReturnType<typeof evaluatePropertyText>> = [];
    try {
      jev = await evaluatePropertyText(l);
    } catch {
      console.error("Property enrichment unavailable", l.id);
    }
    const r = rankListing(
      l,
      profileCriteria(l, mergeCriteria(factualCriteria(l), jev), cfg),
    );
    const data = {
      score: r.score,
      coverage: r.coverage,
      criteria: r.criteria as any,
    };
    await db.listingScore.upsert({
      where: { profileId_listingId: { profileId, listingId: l.id } },
      update: { ...data, scoredAt: new Date() },
      create: { profileId, listingId: l.id, ...data },
    });
    scored++;
  }
  return { scored };
}
