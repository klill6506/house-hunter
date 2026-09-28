import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import { factualCriteria, rankListing } from "../../../lib/rank";
import { configOf, profileCriteria } from "../../../lib/profile-config";
import type { CriterionResult, Listing } from "../../../lib/types";
import ScoreBreakdown from "../../../components/ScoreBreakdown";
import ReactionButtons from "../../../components/ReactionButtons";
export const dynamic = "force-dynamic";
export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ profile?: string }>;
}) {
  const { id } = await params;
  const { profile: profileId = "mountain-house" } = await searchParams;
  const [row, profile] = await Promise.all([
    db.listing.findUnique({
      where: { id },
      include: {
        scores: { orderBy: { scoredAt: "desc" }, take: 1 },
        sightings: { orderBy: { discoveredAt: "desc" }, take: 1 },
      },
    }),
    db.searchProfile.findUnique({ where: { id: profileId } }),
  ]);
  if (!row || !profile) notFound();
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
  const evidence = row.scores[0]?.criteria as CriterionResult[] | undefined;
  const r = rankListing(
    l,
    profileCriteria(
      l,
      evidence || factualCriteria(l),
      configOf(profile.criteria),
    ),
  );
  return (
    <main className="editorPage">
      <a
        className="backLink"
        href={`/?profile=${encodeURIComponent(profileId)}`}
      >
        ← Back to {profile.name}
      </a>
      <p className="eyebrow">PROPERTY REVIEW</p>
      <h1>{l.address}</h1>
      <h2>
        {l.city}, {l.state}
      </h2>
      <div className="heroScore">
        <b>{r.score}%</b>
        <span>current match</span>
        <small>{r.coverage}% researched</small>
      </div>
      <p>
        {l.price
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(l.price)
          : "Price unknown"}{" "}
        · {l.beds || "Unknown"} bedrooms · {l.baths || "Unknown"} bathrooms
        {l.sqft ? ` · ${l.sqft.toLocaleString()} sq ft` : ""}
      </p>
      <ReactionButtons id={l.id} profileId={profileId} />
      <h2 style={{ marginTop: 32 }}>Why it scored this way</h2>
      <ScoreBreakdown criteria={r.criteria} />
      <p className="note">
        Unknown evidence is not a failed criterion. Source prices and
        availability may have changed. Verify view quality, drive time, and
        other important details before relying on this match.
      </p>
      {l.url && /^https?:\/\//i.test(l.url) && (
        <a
          className="button sourceLink"
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open source listing ↗
        </a>
      )}
      <p className="muted">
        {l.source}
        {row.sightings[0]
          ? ` · Discovered ${row.sightings[0].discoveredAt.toLocaleDateString("en-US", { timeZone: "UTC" })}`
          : ""}{" "}
        · Availability unverified
      </p>
    </main>
  );
}
