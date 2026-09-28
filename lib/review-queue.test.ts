import { describe, it, expect, vi } from "vitest";
vi.mock("./db", () => ({ db: {} }));
import {
  configOf,
  profileCriteria,
  inPriceRange,
  validateProfile,
} from "./profile-config";
import { topMatches, pageLimit } from "./review-queue";
import { rankListing, factualCriteria } from "./rank";
import type { Listing } from "./types";
const listing: Listing = {
  id: "one",
  address: "A",
  city: "B",
  state: "GA",
  price: 800000,
  beds: 4,
  baths: 3,
  source: "test",
};
describe("profile-aware review queue", () => {
  it("uses edited budgets instead of the starter budget", () => {
    const config = configOf({ price: { min: 0, max: 600000 } });
    expect(inPriceRange(listing, config)).toBe(false);
    expect(
      profileCriteria({ ...listing, price: 400000 }, [], config).find(
        (c) => c.key === "price",
      )?.score,
    ).toBe(100);
  });
  it("maps saved evidence to the importance slider keys, including zero", () => {
    const config = configOf({ criteria: { mainFloorLiving: { weight: 0 } } });
    const criteria = profileCriteria(
      listing,
      [
        {
          key: "mainFloor",
          label: "Main floor",
          score: 40,
          weight: 9,
          status: "inferred",
        },
      ],
      config,
    );
    expect(criteria.find((c) => c.key === "mainFloorLiving")).toMatchObject({
      score: 40,
      weight: 0,
    });
    expect(criteria.filter((c) => /mainFloor/.test(c.key))).toHaveLength(1);
  });
  it("does not count unknown evidence or missing facts as researched", () => {
    const l = { ...listing, price: 0, beds: 0, baths: 0 };
    const c = profileCriteria(
      l,
      [
        {
          key: "water",
          label: "Water",
          weight: 8,
          score: 100,
          status: "unknown",
        },
      ],
      configOf(null),
    );
    const r = rankListing(l, c);
    expect(r.coverage).toBe(0);
    expect(c.every((x) => x.score === null)).toBe(true);
  });
  it("new bedroom targets change the score without a new enrichment job", () => {
    const cfg = configOf({ criteria: { bedrooms: { target: 5, weight: 6 } } });
    expect(
      profileCriteria(listing, factualCriteria(listing), cfg).find(
        (c) => c.key === "bedrooms",
      )?.score,
    ).toBe(65);
  });
  it("returns only the best forty in a stable order across pages", () => {
    const ranked = Array.from({ length: 53 }, (_, i) => ({
      ...listing,
      id: String(i).padStart(3, "0"),
      score: i < 10 ? 90 : 100,
      coverage: 21,
      criteria: [],
    }));
    const rows = topMatches(ranked.reverse());
    expect(rows).toHaveLength(40);
    expect(rows[0].id).toBe("010");
    expect(
      new Set(
        [0, 10, 20, 30].flatMap((n) => rows.slice(n, n + 10).map((x) => x.id)),
      ).size,
    ).toBe(40);
  });
  it("clamps and validates malformed pagination", () => {
    expect(pageLimit("1000")).toBe(40);
    for (const n of ["abc", "-1", "1.5", "Infinity"])
      expect(pageLimit(n)).toBe(10);
  });
  it("rejects invalid profiles without rejecting zero preferences", () => {
    expect(
      validateProfile({ name: "  ", criteria: configOf(null) }),
    ).toBeTruthy();
    expect(
      validateProfile({
        name: "Budget",
        criteria: configOf({ price: { min: 700000, max: 0 } }),
      }),
    ).toBeTruthy();
    expect(
      validateProfile({
        name: "Budget",
        criteria: configOf({
          price: { min: 0, max: 700000 },
          criteria: { water: { weight: 0 } },
        }),
      }),
    ).toBeNull();
  });
});
