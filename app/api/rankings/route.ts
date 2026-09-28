import { NextResponse } from "next/server";
import { getReviewQueue, pageLimit } from "../../../lib/review-queue";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const profileId = u.searchParams.get("profileId") || "mountain-house";
  const limit = pageLimit(u.searchParams.get("limit") ?? 40);
  const value = Number(u.searchParams.get("offset") || 0);
  const offset =
    Number.isInteger(value) && value >= 0 ? Math.min(value, 40) : 0;
  try {
    const queue = await getReviewQueue(profileId);
    if (!queue)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    // Keep the original array response while exposing pagination metadata in headers.
    const rows = queue.listings
      .slice(offset, offset + limit)
      .map((l) => ({
        profileId,
        listingId: l.id,
        listing: l,
        score: l.score,
        coverage: l.coverage,
        criteria: l.criteria,
      }));
    return NextResponse.json(rows, {
      headers: {
        "X-Total-Count": String(queue.listings.length),
        "X-Matching-Count": String(queue.matchingCount),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Rankings temporarily unavailable" },
      { status: 503 },
    );
  }
}
