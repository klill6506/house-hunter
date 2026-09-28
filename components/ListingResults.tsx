"use client";
import { useState } from "react";
import ReactionButtons from "./ReactionButtons";
import ResearchNotes from "./ResearchNotes";
import PreferenceEvidence from "./PreferenceEvidence";
import type { RankedListing } from "../lib/types";
const PAGE_SIZE = 10;
export default function ListingResults({
  listings,
  profileId,
  matchingCount,
  inventoryCount,
}: {
  listings: (RankedListing & { discoveredAt: string | null })[];
  profileId: string;
  matchingCount: number;
  inventoryCount: number;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const count = Math.min(visible, listings.length);
  if (!listings.length)
    return (
      <div className="empty">
        <h3>
          {inventoryCount
            ? "No homes in this price range yet"
            : "Your collection is ready for homes"}
        </h3>
        <p>
          {inventoryCount
            ? "Try widening the budget in Edit criteria. Your other preferences rank homes rather than hide them."
            : "No listings have been imported yet. New discoveries will appear here once added to the collection."}
        </p>
        <a
          className="button"
          href={`/profiles/${encodeURIComponent(profileId)}`}
        >
          Edit criteria
        </a>
      </div>
    );
  return (
    <>
      <p className="resultCount" aria-live="polite">
        Showing {count} of {listings.length} top matches · {matchingCount} homes
        within budget
      </p>
      <div id="listing-results">
        {listings.slice(0, count).map((l, i) => (
          <article className="card" key={l.id}>
            <div className="cardTop">
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="location">
                {l.city}, {l.state}
              </span>
              <span className="matchPill">
                {l.score}% {l.coverage < 40 ? "early match" : "match"}
              </span>
            </div>
            <div className="cardBody">
              <div className="propertyHeading">
                <h3>
                  <a
                    href={`/listing/${encodeURIComponent(l.id)}?profile=${encodeURIComponent(profileId)}`}
                  >
                    {l.address}
                  </a>
                </h3>
                <strong className="price">
                  {l.price
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(l.price)
                    : "Price unknown"}
                </strong>
              </div>
              <p className="propertyFacts">
                <span>
                  <b>{l.beds || "?"}</b> beds
                </span>
                <span>
                  <b>{l.baths || "?"}</b> baths
                </span>
                {l.sqft && (
                  <span>
                    <b>{l.sqft.toLocaleString()}</b> sq ft
                  </span>
                )}
                {l.acres && (
                  <span>
                    <b>{l.acres}</b> acres
                  </span>
                )}
              </p>
              <ResearchNotes facts={l.facts} />
              <div className="research">
                <PreferenceEvidence criteria={l.criteria} />
                <a
                  href={`/listing/${encodeURIComponent(l.id)}?profile=${encodeURIComponent(profileId)}`}
                >
                  See score details
                </a>
              </div>
              <p className="sourceMeta">
                {l.source}
                {l.discoveredAt
                  ? ` · Found ${new Date(l.discoveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`
                  : " · Discovery date unknown"}{" "}
                · Availability unverified
              </p>
              <div className="cardButtons">
                <ReactionButtons id={l.id} profileId={profileId} />
                {l.url && /^https?:\/\//i.test(l.url) && (
                  <a
                    className="viewButton"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View listing ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="loadMore">
        {count < listings.length ? (
          <button
            className="button"
            aria-controls="listing-results"
            onClick={() => setVisible((n) => n + PAGE_SIZE)}
          >
            Show {Math.min(PAGE_SIZE, listings.length - count)} more homes ↓
          </button>
        ) : (
          <p>
            You’ve reached{" "}
            {listings.length < 40
              ? "all available matches"
              : "the end of your Top 40"}
            .
          </p>
        )}
        <small>
          {listings.length < 40
            ? "The queue grows as more homes are discovered. We don’t fill it with sample listings."
            : "Change your criteria to explore a different ranking of the collection."}
        </small>
      </div>
    </>
  );
}
