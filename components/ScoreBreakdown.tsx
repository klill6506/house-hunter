import type { CriterionResult } from "../lib/types";
import { safeSource } from "../lib/research";
export default function ScoreBreakdown({
  criteria,
}: {
  criteria: CriterionResult[];
}) {
  return (
    <div className="breakdown">
      {criteria.map((c) => (
        <div className="scoreRow" key={c.key}>
          <div>
            <b>{c.label}</b>
            <small>
              {c.status === "confirmed"
                ? "Source states"
                : c.status === "inferred"
                  ? "Partial evidence — check further"
                  : "Needs checking"}
              {c.evidence ? ` · ${c.evidence}` : ""}
            </small>
            {safeSource(c.sourceUrl) && (
              <small>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                  View evidence ↗
                </a>
                {c.checkedAt && Number.isFinite(Date.parse(c.checkedAt))
                  ? ` · Reviewed ${new Date(c.checkedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`
                  : ""}
              </small>
            )}
          </div>
          <strong>
            {c.score === null ? "Unknown" : `${Math.round(c.score)}%`}
          </strong>
        </div>
      ))}
    </div>
  );
}
