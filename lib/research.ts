import type { CriterionResult } from "./types";

export type ResearchNote = {
  text: string;
  sourceUrl: string;
  checkedAt: string;
};
export type ResearchCriterion = Pick<
  CriterionResult,
  "key" | "score" | "status"
> & {
  evidence: string;
  sourceUrl: string;
  checkedAt: string;
};
export type PropertyResearch = {
  criteria: ResearchCriterion[];
  notes: ResearchNote[];
};
const keys = new Set([
  "price",
  "bedrooms",
  "bathrooms",
  "mountainView",
  "mainFloorLiving",
  "yearRoundAccess",
  "highSpeedInternet",
  "water",
  "outdoorLiving",
  "smallTownProximity",
  "healthcareAccess",
  "strEligible",
  "singleFamily",
  "moveInReady",
]);
export function safeSource(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
const datedSource = (r: any) =>
  r &&
  safeSource(r.sourceUrl) &&
  typeof r.checkedAt === "string" &&
  Number.isFinite(Date.parse(r.checkedAt));
export function validResearch(value: unknown): value is PropertyResearch {
  const r = value as PropertyResearch | undefined;
  return (
    !!r &&
    Array.isArray(r.criteria) &&
    r.criteria.length <= 14 &&
    new Set(r.criteria.map((c) => c?.key)).size === r.criteria.length &&
    Array.isArray(r.notes) &&
    r.notes.length <= 10 &&
    r.criteria.every(
      (c) =>
        datedSource(c) &&
        keys.has(c.key) &&
        typeof c.evidence === "string" &&
        c.evidence.trim().length > 0 &&
        c.evidence.length <= 1500 &&
        ["unknown", "confirmed", "inferred"].includes(c.status) &&
        (c.status === "unknown"
          ? c.score === null
          : typeof c.score === "number" &&
            Number.isFinite(c.score) &&
            c.score >= 0 &&
            c.score <= 100) &&
        // Numeric facts must always be scored against the selected profile's targets.
        (!["price", "bedrooms", "bathrooms"].includes(c.key) ||
          c.status === "unknown"),
    ) &&
    r.notes.every(
      (n) =>
        datedSource(n) &&
        typeof n.text === "string" &&
        n.text.trim().length > 0 &&
        n.text.length <= 1500,
    )
  );
}
export function researchOf(facts: unknown): PropertyResearch {
  const r = (facts as { research?: unknown } | null)?.research;
  return validResearch(r) ? r : { criteria: [], notes: [] };
}
export function mergeResearch(
  older: PropertyResearch,
  incoming: PropertyResearch,
): PropertyResearch {
  const criteria = new Map(older.criteria.map((c) => [c.key, c]));
  for (const c of incoming.criteria) {
    const prior = criteria.get(c.key);
    if (!prior || Date.parse(c.checkedAt) >= Date.parse(prior.checkedAt))
      criteria.set(c.key, c);
  }
  const notes = new Map(older.notes.map((n) => [n.sourceUrl + n.text, n]));
  for (const n of incoming.notes) notes.set(n.sourceUrl + n.text, n);
  return {
    criteria: [...criteria.values()],
    notes: [...notes.values()]
      .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))
      .slice(0, 10),
  };
}
export function mergeListingFacts(existing: unknown, incoming: unknown) {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? existing
      : {};
  const next =
    incoming && typeof incoming === "object" && !Array.isArray(incoming)
      ? incoming
      : {};
  return {
    ...base,
    ...next,
    research: mergeResearch(researchOf(base), researchOf(next)),
  };
}
