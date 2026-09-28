import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { mergeDiscoveries, type DiscoveryHit } from "../../../lib/discovery";
import { validResearch, mergeListingFacts } from "../../../lib/research";
export async function POST(req: Request) {
  const token = process.env.HOUSE_HUNTER_JOB_TOKEN;
  if (token && req.headers.get("authorization") !== `Bearer ${token}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const hits = body?.hits as DiscoveryHit[];
  if (!Array.isArray(hits) || !hits.length || hits.length > 500)
    return NextResponse.json(
      { error: "Provide 1–500 discovery hits." },
      { status: 400 },
    );
  for (const hit of hits) {
    if (hit?.research !== undefined && !validResearch(hit.research))
      return NextResponse.json(
        {
          error:
            "Research needs valid criteria, evidence, source links, and review dates.",
        },
        { status: 400 },
      );
    if (
      !hit ||
      !hit.address ||
      !hit.source ||
      !hit.city ||
      !hit.state ||
      !Number.isFinite(Date.parse(hit.discoveredAt))
    )
      return NextResponse.json(
        {
          error:
            "Each hit needs an address, city, state, source, and discovery date.",
        },
        { status: 400 },
      );
    try {
      if (!["https:", "http:"].includes(new URL(hit.sourceUrl).protocol))
        throw new Error();
    } catch {
      return NextResponse.json(
        { error: "Source links must be http or https URLs." },
        { status: 400 },
      );
    }
    for (const key of ["price", "beds", "baths", "sqft"] as const)
      if (
        hit[key] !== undefined &&
        (!Number.isFinite(hit[key]) || hit[key]! < 0 || hit[key]! > 2147483647)
      )
        return NextResponse.json(
          { error: "Listing facts must be valid nonnegative numbers." },
          { status: 400 },
        );
  }
  const candidates = mergeDiscoveries(hits);
  for (const c of candidates) {
    const l = c.listing;
    // Reuse existing identities and reactions when another source rediscovers a home.
    const existing = await db.listing.findFirst({
      where: {
        OR: [
          { url: l.url },
          { address: l.address, city: l.city, state: l.state },
        ],
      },
    });
    const source = new URL(l.url!);
    const zpid = /(^|\.)zillow\.com$/.test(source.hostname)
      ? source.pathname.match(/\/(\d+)_zpid\//)?.[1]
      : undefined;
    const id = existing?.id || (zpid ? `z-${zpid}` : l.id);
    const data = {
      address: l.address,
      city: l.city,
      state: l.state,
      price: l.price || existing?.price || null,
      beds: l.beds || existing?.beds || null,
      baths: l.baths || existing?.baths || null,
      sqft: l.sqft || existing?.sqft || null,
      url: l.url,
      source: l.source,
      description: l.description,
      facts: mergeListingFacts(existing?.facts, l.facts) as any,
    };
    await db.listing.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    for (const s of c.sightings) {
      const prior = await db.sourceSighting.findFirst({
        where: {
          listingId: id,
          sourceUrl: s.sourceUrl,
          discoveredAt: new Date(s.discoveredAt),
        },
      });
      if (!prior)
        await db.sourceSighting.create({
          data: {
            listingId: id,
            source: s.source,
            sourceUrl: s.sourceUrl,
            discoveredAt: new Date(s.discoveredAt),
            facts: s as any,
          },
        });
    }
  }
  return NextResponse.json({
    imported: candidates.length,
    candidates: candidates.length,
  });
}
