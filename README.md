# Blue Star Navigator

Planning and operating system for **Blue Star In-Home Pediatrics** — a pediatric
in-home therapy business in Colorado.

**Live app: https://scottyfncodes.github.io/BlueStar/**

Not a business-plan generator. It is an evidence-backed decision system built
around one loop:

```
GOAL → OPTIONS → CONSEQUENCES → DECISION → ROADMAP → EXECUTE → RECORD → REASSESS
```

## The rule that shapes everything

A **fact**, an **estimate**, and a **quote** are different things, and the system
never lets them blur. Every number carries its provenance, and where nothing
defensible is known the value stays `null` — the model reports what it cannot
compute rather than inventing a placeholder.

Source categories are kept distinct: `LIVE_RESEARCH`, `SAVED_EVIDENCE`,
`USER_PROVIDED`, `ACTUAL_QUOTE`, `ASSUMPTION`.

Each evidence record also declares **how it was retrieved** — `direct-read`,
`search-summary` or `not-accessed` — because reading a fee-schedule PDF is not
the same as reading a search engine's summary of it.

## Provenance warning for the current build

The session that produced this build had network egress to `colorado.gov`,
`sos.state.co.us` and several legal-reference hosts blocked (HTTP 403 at the
proxy). Every record was therefore reached through a **search index summarising
the primary document**, not by opening the document. The URLs are correct
primary sources, but **no figure here has been read off a source PDF**. One
human verification pass is required before any of it drives a real decision.

Update, later on 2026-09-27: Scott supplied eight primary documents, now stored
under `docs/sources/` and read directly — the FY2026-27 Home Health Fee Schedule,
HCPF's therapy specialty training deck, C.R.S. 25-27.5-103, the home care agency
rule 6 CCR 1011-1 Chapter 26 (effective 2025-07-01), the Federal Register HHA
moratorium notice, HCPF's October 2025 rate-reduction bulletin, OM 25-037,
CDPHE's 2026 fee transition sheet, the January and April 2026 Physician Fee
Schedules, the May 2026 Provider Bulletin, Acentra's pediatric LTHH training,
the EI Colorado personnel standards, the Early Intervention rule 8 CCR 1405-1
both licensing statute sections (25-27.5-102 and -103) and the CDPHE home
care agency fee schedule. Twenty-one evidence records now carry
`retrieval: 'direct-read'`, the modelling
rate AS-001 was corrected from $143.02 to $140.16, and the outpatient per-unit
rates (AS-032 to AS-034) are filled — the dashboard now compares both lanes.

## Verification pass — 2026-09-27

A second session re-checked the knowledge base against multiple independent
search summaries (primary hosts were still blocked). The plain-language write-up
is in [`docs/verification-2026-09-27.md`](docs/verification-2026-09-27.md).
The short version: the home health agency lane requires Medicare certification,
Medicare certification requires skilled nursing, and new home health agencies are
under a nationwide Medicare enrollment freeze since May 13, 2026 — so the
per-visit rate the model is built on describes a business Blue Star cannot
currently be. The outpatient lane is open, and its revenue figure is not yet in
the system. See decision D-001, unknowns UU-007 to UU-010, and roadmap T-008.

## Structure

```
src/
  types.ts            Domain model — Evidence, Assumption, Decision, CostItem, …
  data/               The knowledge base (plain TypeScript, no database)
    evidence.ts       57 records with source, URL, dates, confidence, retrieval
    assumptions.ts    Every number the financial model uses
    decisions.ts      Decision log — options, consequences, reversibility
    roadmap.ts        11 phases, tasks as a dependency graph
    costs.ts          Cost database with Overhead Kill List scoring
    paths.ts          Five strategy paths, deliberately unranked
    automation.ts     AI / automation audit with explicit human floors
    misc.ts           Competitors, unknown unknowns, open questions, EV levers
  model/              Pure, tested financial functions
    economics.ts      Visit economics, loaded clinician cost, viability check
    outpatient.ts     Per-unit (8-minute rule) revenue and the two-lane comparison
    capital.ts        Five-bucket capital requirement
    cash.ts           Month-by-month cash calendar
  views/              One screen per area of the system
  test/               269 tests — data integrity + model correctness
```

## Commands

```bash
npm install
npm test        # 269 tests
npm run build   # typecheck + production build
npm run dev     # local dev server
```

## What the tests actually enforce

Not just that the math works, but that the knowledge base stays honest:

- No evidence record may claim `Confirmed` confidence unless it was read directly
- An assumption with no evidence cannot claim high confidence
- A `null` assumption must be explained and marked `Unknown`
- A cost with no figures must be marked `Unknown`, never silently treated as zero
- Roadmap dependencies must resolve, must be acyclic, and must never point forward
- Any process rated unacceptable-to-automate must stay classified `HUMAN` with an
  explicit human floor
- No strategy path may be labelled "best" or "recommended"

## Deployment

Pushing to the branch named in `.github/workflows/deploy.yml` runs tests, builds,
and deploys to GitHub Pages. Other branches are not deployed until they are
merged or added to that list. Base path is `/BlueStar/`; routing is
hash-based so deep links work without server rewrites.
