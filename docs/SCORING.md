# Explainable scoring

Every criterion has:
- score: 0–100 or null
- weight
- status: confirmed / inferred / unknown
- evidence

Unknown is excluded from the weighted denominator. Evidence coverage is reported separately.

This means a sparse listing can score highly but show low coverage. It should then be enriched rather than assumed to be a strong match.

Evidence precedence:
1. confirmed structured/external fact
2. supported inference from text or images
3. unknown

Conflicting evidence is retained in source/enrichment records for review rather than silently overwritten.
