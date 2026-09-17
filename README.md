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

## Structure

```
src/
  types.ts            Domain model — Evidence, Assumption, Decision, CostItem, …
  data/               The knowledge base (plain TypeScript, no database)
    evidence.ts       24 records with source, URL, dates, confidence, retrieval
    assumptions.ts    Every number the financial model uses
    decisions.ts      Decision log — options, consequences, reversibility
    roadmap.ts        11 phases, tasks as a dependency graph
    costs.ts          Cost database with Overhead Kill List scoring
    paths.ts          Five strategy paths, deliberately unranked
    automation.ts     AI / automation audit with explicit human floors
    misc.ts           Competitors, unknown unknowns, open questions, EV levers
  model/              Pure, tested financial functions
    economics.ts      Visit economics, loaded clinician cost, viability check
    capital.ts        Five-bucket capital requirement
    cash.ts           Month-by-month cash calendar
  views/              One screen per area of the system
  test/               80 tests — data integrity + model correctness
```

## Commands

```bash
npm install
npm test        # 80 tests
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

Pushing to the development branch runs tests, builds, and deploys to GitHub Pages
via `.github/workflows/deploy.yml`. Base path is `/BlueStar/`; routing is
hash-based so deep links work without server rewrites.
