import type { CriterionResult } from "../lib/types";

export default function PreferenceEvidence({
  criteria,
}: {
  criteria: CriterionResult[];
}) {
  const active = criteria.filter((criterion) => criterion.weight > 0);
  const known = active.filter((criterion) => criterion.score !== null).length;
  return (
    <span>
      Details available:{" "}
      <b>
        {known} of {active.length}
      </b>{" "}
      preferences
    </span>
  );
}
