import { mountainHouseProfile } from "./profile";
import type { CriterionResult, Listing } from "./types";
export type ProfileConfig = {
  price: { min: number; max: number };
  anchor?: string;
  driveHoursApprox?: number;
  criteria: Record<
    string,
    { weight: number; target?: number; required?: boolean }
  >;
  [key: string]: unknown;
};
export const defaultConfig: ProfileConfig = mountainHouseProfile;
export const criterionLabels: Record<string, string> = {
  mountainView: "Mountain view",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  mainFloorLiving: "Main-floor living",
  yearRoundAccess: "Easy year-round access",
  highSpeedInternet: "High-speed internet",
  water: "Water / lake view",
  outdoorLiving: "Outdoor living",
  smallTownProximity: "Small town nearby",
  healthcareAccess: "Healthcare access",
  strEligible: "Short-term rental option",
  singleFamily: "Detached single-family",
  moveInReady: "Move-in ready",
};
const aliases: Record<string, string> = {
  beds: "bedrooms",
  baths: "bathrooms",
  mainFloor: "mainFloorLiving",
  access: "yearRoundAccess",
  internet: "highSpeedInternet",
  outdoor: "outdoorLiving",
  condition: "moveInReady",
};
export function configOf(value: unknown): ProfileConfig {
  const c = value as Partial<ProfileConfig> | null;
  return {
    ...defaultConfig,
    ...c,
    price: { ...defaultConfig.price, ...c?.price },
    criteria: { ...defaultConfig.criteria, ...c?.criteria },
  };
}
export function validateProfile(body: any): string | null {
  if (
    typeof body?.name !== "string" ||
    !body.name.trim() ||
    body.name.trim().length > 100
  )
    return "Enter a profile name of 1–100 characters.";
  const c = body.criteria;
  if (
    !c ||
    !Number.isFinite(c.price?.min) ||
    !Number.isFinite(c.price?.max) ||
    c.price.min < 0 ||
    c.price.max < c.price.min ||
    c.price.max > 2147483647
  )
    return "Enter a valid price range; maximum must be at least minimum.";
  if (
    !c.criteria ||
    typeof c.criteria !== "object" ||
    Array.isArray(c.criteria)
  )
    return "Criteria are required.";
  for (const v of Object.values(c.criteria) as any[]) {
    if (!v || !Number.isFinite(v.weight) || v.weight < 0 || v.weight > 10)
      return "Importance must be between 0 and 10.";
    if (
      v.target !== undefined &&
      (!Number.isFinite(v.target) || v.target < 0 || v.target > 100)
    )
      return "Enter valid bedroom and bathroom targets.";
  }
  return null;
}
export function inPriceRange(l: Listing, c: ProfileConfig) {
  return !l.price || (l.price >= c.price.min && l.price <= c.price.max);
}
export function profileCriteria(
  l: Listing,
  evidence: CriterionResult[],
  cfg: ProfileConfig,
): CriterionResult[] {
  const mapped = new Map(
    evidence.map((c) => {
      const key = aliases[c.key] || c.key;
      return [
        key,
        {
          ...c,
          key,
          label: criterionLabels[key] || c.label,
          weight: cfg.criteria[key]?.weight ?? c.weight,
        },
      ];
    }),
  );
  for (const [key, value] of Object.entries(cfg.criteria))
    if (!mapped.has(key))
      mapped.set(key, {
        key,
        label: criterionLabels[key] || key,
        weight: value.weight,
        score: null,
        status: "unknown",
      });
  mapped.set("price", {
    key: "price",
    label: "Price range",
    weight: 10,
    score: l.price ? (inPriceRange(l, cfg) ? 100 : 0) : null,
    status: l.price ? "confirmed" : "unknown",
    evidence: l.price ? "Source asking price; verify with listing" : undefined,
  });
  for (const [key, count, fallback] of [
    ["bedrooms", l.beds, 4],
    ["bathrooms", l.baths, 3],
  ] as const) {
    const target = cfg.criteria[key]?.target ?? fallback;
    mapped.set(key, {
      key,
      label: `${target}+ ${key} preferred`,
      weight: cfg.criteria[key]?.weight ?? 6,
      score: count
        ? count >= target
          ? 100
          : count >= target - (key === "bedrooms" ? 1 : 0.5)
            ? 65
            : 25
        : null,
      status: count ? "confirmed" : "unknown",
      evidence: count ? `${count} ${key}` : undefined,
    });
  }
  return [...mapped.values()].map((c) =>
    c.status === "unknown" ? { ...c, score: null } : c,
  );
}
