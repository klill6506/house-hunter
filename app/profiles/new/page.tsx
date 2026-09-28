import { db } from "../../../lib/db";
import { defaultConfig } from "../../../lib/profile-config";
import ProfileEditor from "../../../components/ProfileEditor";
export const dynamic = "force-dynamic";
export default async function NewProfile({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from = "mountain-house" } = await searchParams;
  const source = await db.searchProfile.findUnique({ where: { id: from } });
  return (
    <main className="editorPage">
      <a
        className="backLink"
        href={`/?profile=${encodeURIComponent(source?.id || "mountain-house")}`}
      >
        ← Back to results
      </a>
      <p className="eyebrow">MAKE IT YOURS</p>
      <h1>Create a new profile</h1>
      <p className="muted">
        Start with {source?.name || "Mountain House"}’s preferences. Give your
        search a name and change only what matters to you.
      </p>
      <ProfileEditor
        create
        profile={{
          id: source?.id || "mountain-house",
          name: "",
          criteria: source?.criteria || defaultConfig,
        }}
      />
    </main>
  );
}
