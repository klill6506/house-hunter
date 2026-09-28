import type { CriterionResult } from "../lib/types";

export default function PreferenceEvidence({
  criteria,
}: {
  criteria: CriterionResult[];
}) {
  const active = criteria.filter((criterion) => criterion.weight > 0);
  const known = active.filter((criterion) => criterion.score !== null).length;
  const partial = active.filter(
    (c) => c.score !== null && c.status === "inferred",
  ).length;
  return (
    <div className="evidenceSummary">
      <span>
        Details available:{" "}
        <b>
          {known} of {active.length}
        </b>{" "}
        preferences
      </span>
      {partial > 0 && (
        <small>
          {known - partial} source-stated · {partial} partial clues ·{" "}
          {active.length - known} still unknown
        </small>
      )}
    </div>
  );
}
