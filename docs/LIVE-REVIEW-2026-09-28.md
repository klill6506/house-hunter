# Live app review — September 28, 2026

## Findings
The live header and editor matched the recent profile changes (Search Profile, Edit criteria, Save as new profile). The styling was deployed; it was still the original compact green layout with incremental changes. No production commit identifier was exposed, so an exact running SHA was not asserted.

The live rankings endpoint returned an empty array while the home page displayed five bundled seed listings. The old page silently fell back on seed data both for empty rankings and database errors. The query already allowed 40; this was an inventory/ranking integration problem rather than a five-item page-size cap.

## Changes
- Visible New profile flow with an ordinary named form, validation, save feedback, and separate copy/edit actions.
- Headings, budgets, preference summaries, details, and reactions follow the selected profile.
- A ranked Top 40 from imported database inventory, including factual ranking before an enrichment job runs. Show 10 more reveals ten at a time. Stable score/coverage/ID tie-breaking, no duplicates across pages.
- No silent sample-data fallback. Empty inventory, budget misses, missing profiles, and database failures have distinct behavior.
- Canonical criterion names connect all importance sliders to stored evidence. New profiles reuse existing property research without making paid Jev calls on save.
- Bootstrap now creates Mountain House only if absent, preserving saved criteria across redeployments.
- Refreshed responsive layout, clear price hierarchy, research indicators, source dates, and availability caveats.
- Existing Coolify Docker startup, PostgreSQL schema, Jev endpoint/credentials, and job-token convention are retained. No new secret is needed.

## Discovery batch
data/discovery-2026-09-28.json contains 44 additional leads manually researched from public Zillow search results around Blue Ridge, Ellijay, and Hiawassee. Each has an individual property link, observed facts, and a discovery timestamp. The initial batch focuses on four-bedroom homes; it is not exhaustive market coverage or automatic ongoing discovery. Search-result facts can differ from cached detail pages and need verification.

The original five app leads are retained separately in data/original-leads-2026-09-28.json with their original identifiers preserved on import. Their data is a snapshot of the previously visible app, not a claim of refreshed availability.

No listing photos or full marketing descriptions are copied. Unknown features stay unknown. Jev remains available for meaningful description enrichment through the existing scoring job; profile editing itself only recalculates existing evidence.

## Validation
Automated tests cover edited budgets and targets, slider aliases and zero weights, unknown facts, stable Top 40 ordering, page parameter validation, and invalid profile input. Browser checks cover 10/20/30/40 results, creating a separate budget profile, updated headings and wish lists, profile-aware details, and desktop/mobile layout.

Local integration uses a disposable SQLite copy of the same Prisma schema only for testing; no test database configuration is committed. Production continues to use PostgreSQL.

## Refreshing inventory
Use public search or an authorized feed to produce DiscoveryHit records, then POST {"hits":[...]} to /api/import with the existing server job token if configured. The importer preserves listing identities and records source dates; reimporting the same snapshot is idempotent. Imported homes appear immediately with factual scores. New geographic coverage still requires a new discovery batch. This release does not add a search-provider subscription or a scheduled crawler.
## Release status
Application changes were pushed to main as 55c8550. Production build, TypeScript, 10 unit tests, browser pagination/profile/mobile checks, and local import/idempotent identity handling passed. Existing profile changes survived bootstrap in the local integration check.

After the push, both house-hunter.kenlill.com and coolify.kenlill.com began timing out on HTTPS from this workstation; both resolve to the same host. No HTTP error or deployment log was available. The reason is not established. No production imports have been submitted, and the new deployment has not been verified live. The 44 new leads and five original app leads are committed and ready for import once service returns. No server settings or secrets were changed.

To finish: verify the new header and /profiles/new on the live app, POST each committed discovery JSON batch to /api/import using the existing job-token convention, confirm a 40-row ranked queue and the full collection count, and exercise Show 10 more on production. Do not create QA profiles in production; profile creation was tested only in the disposable local database.
