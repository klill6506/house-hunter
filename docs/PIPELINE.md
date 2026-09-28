# Ranking pipeline

1. **Discover broadly** — authorized structured sources plus public indexed discovery.
2. **Deduplicate** — retain all sightings and provenance.
3. **Hard filters** — intentionally minimal. Current hard price band: $500k–$1.2m. Preferences such as 4/3 are not hard filters.
4. **Factual score** — score confirmed structured facts; unknown criteria remain null.
5. **Deep-analysis queue** — keep the best ~100 for text/photo/external enrichment.
6. **Jev text evaluation** — atomic criteria, never a vague one-shot house score.
7. **Vision** — view quality, apparent condition, driveway/access clues, outdoor living.
8. **External enrichment** — broadband, drive time, STR rules, hazards, listing freshness.
9. **Final ranking** — weighted score plus evidence coverage.
10. **Human review queue** — top 40 only.
11. **Feedback** — Love/Like/Pass retained as a tuning signal; no automatic overreaction to a single click.

The system retains lower-ranked inventory so changed preferences can trigger a rescore rather than a full rediscovery.
