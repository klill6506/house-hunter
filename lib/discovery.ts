import { mergeResearch, type PropertyResearch } from "./research";
import type { Listing } from "./types";
export type DiscoveryHit = {
  source: string;
  sourceUrl: string;
  address: string;
  city?: string;
  state?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  snippet?: string;
  fsbo?: boolean;
  discoveredAt: string;
  research?: PropertyResearch;
};
export type Candidate = {
  listing: Listing;
  sightings: DiscoveryHit[];
  confidence: "single-source" | "cross-source";
};
const key = (h: DiscoveryHit) =>
  [h.address, h.city, h.state]
    .filter(Boolean)
    .join(",")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function mergeDiscoveries(hits: DiscoveryHit[]): Candidate[] {
  const groups = new Map<string, DiscoveryHit[]>();
  for (const h of hits) {
    const k = key(h);
    groups.set(k, [...(groups.get(k) || []), h]);
  }
  return [...groups.values()].map((sightings) => {
    const best = sightings.sort(
      (a, b) => (b.snippet?.length || 0) - (a.snippet?.length || 0),
    )[0];
    return {
      listing: {
        id: "public-" + key(best),
        address: best.address,
        city: best.city || "",
        state: best.state || "",
        price: best.price || 0,
        beds: best.beds || 0,
        baths: best.baths || 0,
        sqft: best.sqft,
        source: [...new Set(sightings.map((x) => x.source))].join(" + "),
        url: best.sourceUrl,
        description: best.snippet,
        facts: {
          research: sightings.reduce(
            (r, s) =>
              mergeResearch(r, s.research || { criteria: [], notes: [] }),
            { criteria: [], notes: [] } as PropertyResearch,
          ),
          fsbo: sightings.some((x) => x.fsbo),
          sourceCount: new Set(sightings.map((x) => x.source)).size,
        },
      },
      sightings,
      confidence:
        new Set(sightings.map((x) => x.source)).size > 1
          ? "cross-source"
          : "single-source",
    };
  });
}
