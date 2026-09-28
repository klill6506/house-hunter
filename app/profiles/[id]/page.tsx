import { db } from "../../../lib/db";
import { notFound } from "next/navigation";
import ProfileEditor from "../../../components/ProfileEditor";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await db.searchProfile.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <main className="editorPage">
      <a className="backLink" href={`/?profile=${encodeURIComponent(p.id)}`}>
        ← Back to results
      </a>
      <p className="eyebrow">REFINE YOUR SEARCH</p>
      <h1>{p.name}</h1>
      <p className="muted">
        Adjust your preferences to re-rank the shared collection, or save a
        separate profile.
      </p>
      <ProfileEditor profile={p} />
    </main>
  );
}
