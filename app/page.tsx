import ProfilePicker from "../components/ProfilePicker";
import ListingResults from "../components/ListingResults";
import { db } from "../lib/db";
import { getReviewQueue } from "../lib/review-queue";
import { criterionLabels } from "../lib/profile-config";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string; saved?: string }>;
}) {
  const q = await searchParams;
  const profileId = q.profile || "mountain-house";
  let queue: Awaited<ReturnType<typeof getReviewQueue>>;
  let profiles: { id: string; name: string }[];
  try {
    [queue, profiles] = await Promise.all([
      getReviewQueue(profileId),
      db.searchProfile.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
  } catch {
    return (
      <main>
        <p className="brand">⌂ HOUSE HUNTER</p>
        <section className="empty">
          <h1>We couldn’t load your homes.</h1>
          <p>
            The listing database is temporarily unavailable. Please try again
            shortly.
          </p>
          <a className="button" href="/">
            Try again
          </a>
        </section>
      </main>
    );
  }
  if (!queue) notFound();
  const { profile, config, listings, inventoryCount, matchingCount } = queue;
  const active = Object.entries(config.criteria).filter(
    ([, c]) => c.weight > 0,
  );
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="/">
          ⌂ HOUSE HUNTER
        </a>
        <span>A place worth finding.</span>
      </nav>
      <header className="hero">
        <div className="heroCopy">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>{profile.name}</h1>
          <p>
            A little less searching.
            <br />A little closer to home.
          </p>
          <div className="heroTags">
            <span>
              {money(config.price.min)} – {money(config.price.max)}
            </span>
            <span>
              {config.criteria.bedrooms?.target ?? 4}+ beds ·{" "}
              {config.criteria.bathrooms?.target ?? 3}+ baths preferred
            </span>
          </div>
        </div>
        <ProfilePicker current={profileId} profiles={profiles} />
      </header>
      {q.saved && (
        <p className="notice" role="status">
          Profile saved. You’re viewing {profile.name}.
        </p>
      )}
      <section className="stats" aria-label="Search summary">
        <div>
          <b>
            {listings.length}
            <small> / 40</small>
          </b>
          <span>Homes in your review queue</span>
        </div>
        <div>
          <b>{inventoryCount}</b>
          <span>Homes in the shared collection</span>
        </div>
        <div>
          <b>{active.length}</b>
          <span>Preferences shaping your search</span>
        </div>
      </section>
      <div className="grid">
        <section>
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">THE SHORTLIST</p>
              <h2>Your top matches</h2>
            </div>
            <span className="subtleBadge">Ranked for you</span>
          </div>
          <p className="muted">
            Up to 40 homes, ranked by your preferences. A high match with little
            research is a promising lead, not a verified fit.
          </p>
          <ListingResults
            key={profileId}
            listings={listings}
            profileId={profileId}
            matchingCount={matchingCount}
            inventoryCount={inventoryCount}
          />
        </section>
        <aside>
          <div className="sectionHeading">
            <h2>Your wish list</h2>
            <a href={`/profiles/${encodeURIComponent(profileId)}`}>Edit</a>
          </div>
          <div className="criterion">
            <span>Budget</span>
            <strong>
              {money(config.price.min)}–{money(config.price.max)}
            </strong>
          </div>
          {active.map(([key, c]) => (
            <div className="criterion" key={key}>
              <span>{criterionLabels[key] || key}</span>
              <strong>
                {c.target !== undefined
                  ? `${c.target}+ preferred`
                  : `${c.weight}/10`}
              </strong>
            </div>
          ))}
          {config.anchor && (
            <p className="note">
              Search area: around {config.anchor}
              {config.driveHoursApprox
                ? `, roughly ${config.driveHoursApprox} hours away`
                : ""}
              . Drive times and view quality still need checking.
            </p>
          )}
          <div className="scoreGuide">
            <h3>Read the scores</h3>
            <p>
              <b>Match</b> measures how well known facts fit your preferences.
            </p>
            <p>
              <b>Researched</b> measures how much of your wish list has
              supporting evidence. Unknowns stay unknown.
            </p>
          </div>
          <a
            className="button buttonSecondary fullWidth"
            href={`/profiles/new?from=${encodeURIComponent(profileId)}`}
          >
            Create your own profile ↗
          </a>
        </aside>
      </div>
      <footer>
        HOUSE HUNTER{" "}
        <span>
          Public search leads · Check price and availability on the source
          listing.
        </span>
      </footer>
    </main>
  );
}
