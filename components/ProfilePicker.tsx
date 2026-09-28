"use client";
export default function ProfilePicker({
  current,
  profiles,
}: {
  current: string;
  profiles: { id: string; name: string }[];
}) {
  return (
    <div className="profilePicker">
      <label htmlFor="profile-select">Search profile</label>
      <select
        id="profile-select"
        value={current}
        onChange={(e) =>
          (location.href = `/?profile=${encodeURIComponent(e.target.value)}`)
        }
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="profileLinks">
        <a href={`/profiles/${encodeURIComponent(current)}`}>Edit criteria</a>
        <a
          className="button buttonAccent"
          href={`/profiles/new?from=${encodeURIComponent(current)}`}
        >
          + New profile
        </a>
      </div>
    </div>
  );
}
