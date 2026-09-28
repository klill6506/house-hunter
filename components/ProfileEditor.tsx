"use client";
import { useState } from "react";
import {
  configOf,
  criterionLabels,
  validateProfile,
  type ProfileConfig,
} from "../lib/profile-config";
export default function ProfileEditor({
  profile,
  create = false,
}: {
  profile: { id: string; name: string; criteria: unknown };
  create?: boolean;
}) {
  const [c, setC] = useState<ProfileConfig>(configOf(profile.criteria));
  const [name, setName] = useState(create ? "" : profile.name);
  const [copy, setCopy] = useState(create);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: string, value: object) =>
    setC({
      ...c,
      criteria: { ...c.criteria, [key]: { ...c.criteria[key], ...value } },
    });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateProfile({ name, criteria: c });
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch(
        copy
          ? "/api/profiles"
          : `/api/profiles/${encodeURIComponent(profile.id)}`,
        {
          method: copy ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: name.trim(), criteria: c }),
        },
      );
      const p = await r.json();
      if (!r.ok)
        throw new Error(
          p.error || "Could not save your profile. Please try again.",
        );
      location.href = `/?profile=${encodeURIComponent(p.id)}&saved=1`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile.");
      setBusy(false);
    }
  }
  return (
    <form className="editor" onSubmit={save}>
      <fieldset disabled={busy}>
        <label>
          Profile name
          <input
            required
            maxLength={100}
            placeholder="e.g. Mountain House — Sarah"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="editGrid">
          <label>
            Minimum price
            <input
              type="number"
              min="0"
              required
              value={c.price.min}
              onChange={(e) =>
                setC({
                  ...c,
                  price: { ...c.price, min: e.target.valueAsNumber },
                })
              }
            />
          </label>
          <label>
            Maximum price
            <input
              type="number"
              min={c.price.min}
              required
              value={c.price.max}
              onChange={(e) =>
                setC({
                  ...c,
                  price: { ...c.price, max: e.target.valueAsNumber },
                })
              }
            />
          </label>
          <label>
            Preferred bedrooms
            <input
              type="number"
              min="0"
              max="100"
              required
              value={c.criteria.bedrooms?.target ?? 4}
              onChange={(e) =>
                set("bedrooms", { target: e.target.valueAsNumber })
              }
            />
          </label>
          <label>
            Preferred bathrooms
            <input
              type="number"
              min="0"
              max="100"
              step=".5"
              required
              value={c.criteria.bathrooms?.target ?? 3}
              onChange={(e) =>
                set("bathrooms", { target: e.target.valueAsNumber })
              }
            />
          </label>
        </div>
        <h2>What matters most?</h2>
        <p className="muted">
          0 = don’t care · 10 = extremely important. Preferences rank homes; the
          price range filters them.
        </p>
        {Object.entries(c.criteria)
          .filter(([k]) => !["bedrooms", "bathrooms"].includes(k))
          .map(([key, value]) => (
            <label className="weight" key={key}>
              <span>{criterionLabels[key] || key}</span>
              <input
                type="range"
                min="0"
                max="10"
                value={value.weight}
                onChange={(e) => set(key, { weight: +e.target.value })}
              />
              <output>{value.weight}/10</output>
            </label>
          ))}
        <p className="note">
          {copy
            ? "Creates an independent profile using the shared collection. The original profile and its reactions stay intact."
            : "Updates this shared profile for everyone who selects it."}{" "}
          This changes rankings of homes already discovered; it does not start a
          new geographic search.
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="editorActions">
          <button className="button" type="submit">
            {busy
              ? "Saving…"
              : copy
                ? "Create profile & see matches"
                : "Save & re-rank"}
          </button>
          {!copy && (
            <button
              type="button"
              className="buttonSecondary"
              onClick={() => {
                setCopy(true);
                setName(name + " Copy");
              }}
            >
              Save as a new profile
            </button>
          )}
          <a href={`/?profile=${encodeURIComponent(profile.id)}`}>Cancel</a>
        </div>
      </fieldset>
    </form>
  );
}
