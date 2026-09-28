import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { validateProfile, defaultConfig } from "../../../lib/profile-config";
export async function GET() {
  return NextResponse.json(
    await db.searchProfile.findMany({ orderBy: { createdAt: "asc" } }),
  );
}
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const body = b ? { ...b, criteria: b.criteria ?? defaultConfig } : null;
  const error = validateProfile(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const p = await db.searchProfile.create({
      data: { name: body.name.trim(), criteria: body.criteria },
    });
    // The review queue applies the new profile immediately, without re-querying Jev.
    return NextResponse.json(p, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save the profile. Please try again." },
      { status: 503 },
    );
  }
}
