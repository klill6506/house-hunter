import { describe, it, expect, vi } from "vitest";
vi.mock("./db", () => ({ db: {} }));
import {
  validResearch,
  researchOf,
  mergeListingFacts,
  type PropertyResearch,
} from "./research";
import { mergeDiscoveries, type DiscoveryHit } from "./discovery";
import { profileCriteria, configOf } from "./profile-config";
import { rankListing } from "./rank";
import { topMatches } from "./review-queue";
import batch from "../data/research-2026-09-28.json";
const research: PropertyResearch = {
  criteria: [
    {
      key: "strEligible",
      score: 0,
      status: "confirmed",
      evidence: "Source says rentals prohibited",
      sourceUrl: "https://example.com/home",
      checkedAt: "2026-09-28T03:35:06Z",
    },
  ],
  notes: [],
};
const listing = {
  id: "test",
  address: "A",
  city: "B",
  state: "GA",
  price: 600000,
  beds: 4,
  baths: 3,
  source: "test",
  facts: { research },
};
describe("source-backed research", () => {
  it("keeps sourced highlights and cautions through basic and repeated imports without changing scores", () => {
    const hit = batch.hits[0] as DiscoveryHit;
    const before = mergeDiscoveries([hit])[0].listing;
    const saved = mergeListingFacts(before.facts, {
      research: { criteria: [], notes: [] },
    });
    const repeated = mergeListingFacts(saved, before.facts);
    expect(researchOf(repeated).highlights).toHaveLength(3);
    expect(researchOf(repeated).notes).toEqual(hit.research!.notes);
    const withoutHighlights = {
      ...before,
      facts: { research: { ...hit.research, highlights: undefined } },
    };
    expect(
      rankListing(before, profileCriteria(before, [], configOf(null))).score,
    ).toBe(
      rankListing(
        withoutHighlights,
        profileCriteria(withoutHighlights, [], configOf(null)),
      ).score,
    );
  });
  it("accepts old research without highlights but rejects unsafe or excessive highlights", () => {
    expect(validResearch(research)).toBe(true);
    const note = {
      text: "Finished basement",
      sourceUrl: "https://example.com/home",
      checkedAt: "2026-09-28T03:35:06Z",
    };
    expect(validResearch({ ...research, highlights: [note] })).toBe(true);
    expect(
      validResearch({
        ...research,
        highlights: [{ ...note, sourceUrl: "javascript:alert(1)" }],
      }),
    ).toBe(false);
    expect(
      validResearch({ ...research, highlights: Array(7).fill(note) }),
    ).toBe(false);
    expect(validResearch({ ...research, highlights: [null] })).toBe(false);
  });
  it("validates the reviewed batch and refuses malformed evidence or unsafe sources", () => {
    expect(batch.hits).toHaveLength(10);
    expect(batch.hits.every((h) => validResearch(h.research))).toBe(true);
    for (const patch of [
      { score: NaN },
      { sourceUrl: "javascript:alert(1)" },
      { key: "fake" },
      { evidence: "" },
      { status: "unknown", score: 100 },
      { key: "bedrooms", score: 100 },
    ]) {
      expect(
        validResearch({
          ...research,
          criteria: [{ ...research.criteria[0], ...patch }],
        }),
      ).toBe(false);
    }
  });
  it("retains researched drawbacks, profile weights, and source links over old positive scores", () => {
    const injected = {
      ...research,
      criteria: [{ ...research.criteria[0], weight: 10 }],
    };
    const c = profileCriteria(
      { ...listing, facts: { research: injected } },
      [
        {
          key: "strEligible",
          label: "Rental",
          score: 100,
          weight: 5,
          status: "inferred",
        },
      ],
      configOf({ criteria: { strEligible: { weight: 0 } } }),
    );
    expect(c.find((x) => x.key === "strEligible")).toMatchObject({
      score: 0,
      weight: 0,
      sourceUrl: "https://example.com/home",
    });
  });
  it("leaves conflicting bedroom counts unknown under every profile target", () => {
    const hit = batch.hits.find((h) => h.address === "1306 Ramey Mountain Rd")!;
    const l = mergeDiscoveries([hit as DiscoveryHit])[0].listing;
    for (const target of [3, 4, 5]) {
      const c = profileCriteria(
        l,
        [],
        configOf({ criteria: { bedrooms: { target, weight: 6 } } }),
      );
      expect(c.find((x) => x.key === "bedrooms")?.score).toBeNull();
      expect(c.find((x) => x.key === "bathrooms")?.score).toBeNull();
    }
  });
  it("does not erase research on a later basic import or replace it with older evidence", () => {
    const merged = mergeListingFacts(
      { research, custom: "preserved" },
      { sourceCount: 1, research: { criteria: [], notes: [] } },
    );
    expect(researchOf(merged)).toEqual(research);
    const stale = {
      ...research,
      criteria: [
        {
          ...research.criteria[0],
          score: 100,
          checkedAt: "2026-01-01T00:00:00Z",
        },
      ],
    };
    expect(
      researchOf(mergeListingFacts(merged, { research: stale })).criteria[0]
        .score,
    ).toBe(0);
    expect(merged).toMatchObject({ custom: "preserved" });
  });
  it("combines distinct source findings instead of keeping only the longest snippet", () => {
    const hit = batch.hits[0] as DiscoveryHit;
    const second = { ...hit, source: "Second source", research };
    const l = mergeDiscoveries([hit, second])[0].listing;
    expect(
      researchOf(l.facts).criteria.some((c) => c.key === "strEligible"),
    ).toBe(true);
    expect(
      researchOf(l.facts).criteria.some((c) => c.key === "mountainView"),
    ).toBe(true);
  });
  it("ranks a supported strong match above a thin perfect early match without changing match scores", () => {
    const thin = {
      ...listing,
      id: "thin",
      score: 100,
      coverage: 21,
      criteria: [],
    };
    const strong = {
      ...listing,
      id: "strong",
      score: 90,
      coverage: 75,
      criteria: [],
    };
    expect(topMatches([thin, strong])[0].id).toBe("strong");
    expect(thin.score).toBe(100);
  });
  it("adds real evidence for all ten homes while keeping healthcare unknown", () => {
    for (const h of batch.hits) {
      const l = mergeDiscoveries([h as DiscoveryHit])[0].listing;
      const c = profileCriteria(l, [], configOf(null));
      expect(
        c.filter((x) => x.score !== null && x.weight > 0).length,
      ).toBeGreaterThanOrEqual(7);
      expect(c.find((x) => x.key === "healthcareAccess")?.score).toBeNull();
      expect(rankListing(l, c).coverage).toBeGreaterThan(21);
    }
  });
});
