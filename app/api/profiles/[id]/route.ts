import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { validateProfile } from "../../../../lib/profile-config";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const p = await db.searchProfile.findUnique({ where: { id } });
  return p
    ? NextResponse.json(p)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
async function save(req: Request, context: Context, copy: boolean) {
  const { id } = await context.params;
  const source = await db.searchProfile.findUnique({ where: { id } });
  if (!source)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => null);
  if (!b)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const body = {
    name: b.name ?? (copy ? source.name + " Copy" : source.name),
    criteria: b.criteria ?? source.criteria,
  };
  const error = validateProfile(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const data = { name: body.name.trim(), criteria: body.criteria };
    const p = copy
      ? await db.searchProfile.create({ data })
      : await db.searchProfile.update({ where: { id }, data });
    return NextResponse.json(p, { status: copy ? 201 : 200 });
  } catch {
    return NextResponse.json(
      { error: "Could not save the profile. Please try again." },
      { status: 503 },
    );
  }
}
export const PATCH = (req: Request, context: Context) =>
  save(req, context, false);
export const POST = (req: Request, context: Context) =>
  save(req, context, true);
