import type { CriterionResult, Listing } from "./types";
const endpoint =
  process.env.JEV_API_URL || "https://jev-agent.com/api/v1/systemone";
type JevAnswer = {
  type: "score";
  score: number;
  confidence?: number;
  legend?: Record<string, string>;
  probabilities?: Record<string, number>;
};
export async function evaluatePropertyText(
  listing: Listing,
): Promise<CriterionResult[]> {
  const key = process.env.JEV_API_KEY;
  if (!key || !listing.description?.trim()) return [];
  const state = [listing.description, JSON.stringify(listing.facts || {})]
    .filter(Boolean)
    .join("\n");
  if (!state) return [];
  const defs = [
    [
      "mountainView",
      "Mountain view",
      10,
      "How strongly does the evidence establish a genuine visible mountain view?",
    ],
    [
      "mainFloor",
      "Main-floor living",
      9,
      "How strongly does the evidence establish primary bedroom/bath, kitchen and main living on the main floor?",
    ],
    [
      "access",
      "Year-round access",
      9,
      "How strongly does the evidence establish easy year-round road and driveway access?",
    ],
    [
      "water",
      "Water feature / lake view",
      8,
      "How strongly does the evidence establish creek, river, waterfall, lake frontage or meaningful lake view?",
    ],
    [
      "outdoor",
      "Outdoor living",
      8,
      "How strongly does the evidence establish quality outdoor living space for enjoying the setting?",
    ],
    [
      "condition",
      "Move-in ready",
      8,
      "How strongly does the evidence establish move-in-ready condition with minimal renovation needed?",
    ],
  ] as const;
  const questions = Object.fromEntries(
    defs.map(([key, , , instructions]) => [
      key,
      {
        type: "score",
        instructions,
        criteria: [
          "No evidence / contradicted",
          "Weak",
          "Some evidence",
          "Strong",
          "Explicit / compelling",
        ],
      },
    ]),
  );
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: "jev-latest", state, questions }),
  });
  if (!res.ok) throw new Error(`Jev HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { answers: Record<string, JevAnswer> };
  return defs.map(([key, label, weight]) => {
    const a = data.answers[key];
    if (!a)
      return { key, label, weight, score: null, status: "unknown" as const };
    const score = Math.max(0, Math.min(100, (a.score / 4) * 100));
    return {
      key,
      label,
      weight,
      score,
      status:
        (a.confidence ?? 0) >= 0.55
          ? ("inferred" as const)
          : ("unknown" as const),
      evidence: `Jev rubric ${a.score.toFixed(2)}/4${a.confidence !== undefined ? `, confidence ${Math.round(a.confidence * 100)}%` : ""}`,
    };
  });
}
