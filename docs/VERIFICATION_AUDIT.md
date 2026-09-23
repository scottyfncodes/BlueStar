# Blue Star Navigator: Verification Audit

**Audit date:** 2026-09-23
**Commit audited:** `9eabab8` (tip of both `claude/blue-star-navigator-research-eokrhc` and this branch at audit time)
**Scope:** every data file, every model function, every view that states a number, and every external claim I could re-check.

## How this was checked

1. **Internal arithmetic.** I ran the model at its default inputs, and at all three salary test points, through a throwaway probe. The probe called the real functions (`visitCycle`, `scheduleFeasibility`, `weeklySchedule`, `annualModel`, `viabilityCheck`, `founderRamp`, `rampMilestones`, `cashCalendar`, `capitalRequirement`). I did not re-derive anything by hand. Every number quoted below is model output.
2. **Cross-module consistency.** I checked that the same quantity (capacity, cancellations, overhead, visit frequency) is computed the same way everywhere it appears.
3. **Narrative vs. current data.** I compared the prose in evidence records, assumptions, code comments and views against what the model now outputs. Several passages were written before later corrections and were never updated.
4. **External facts.** I re-checked these against the web. Direct access to `hcpf.colorado.gov`, `sos.state.co.us`, `law.cornell.edu` and several news sites is still blocked by the egress proxy (HTTP 403), so every external check below is a **search-summary**, the same retrieval level as the original build. None of it is a direct read.

The existing suite (269 tests) passes and `tsc` is clean. The problems below are ones the tests do not cover.

---

## Severity 1: findings that change the conclusions

### 1.1 The agency lane requires Medicare certification, and the system never mentions it

Health First Colorado's home health provider requirements, summarised from HCPF's Home Health Billing Manual and 10 CCR 2505-10 §8.520, call for **all** of the following:

- a Class A home care agency license;
- **Medicare certification**, or deemed status from an accepted accreditor (Joint Commission, CHAP or ACHC);
- enrollment as a Medicare provider.

The word "Medicare" appears nowhere in the decisions, roadmap, costs, capital model or unknown-unknowns. It appears only in a competitor description (Spark Home Health).

**Why it matters.** Option D-001-A ("Licensed home care agency (Class A)") lists its requirements as license, administrator, policies, insurance and a longer pre-revenue period. Medicare certification or accreditation is a separate, costly and slow step, and it sits on the critical path to the $143.02/visit benefit. Every pre-revenue-month figure, every capital figure and every agency-lane timeline in the app is therefore understated by an unknown amount. It also makes the outpatient-lane question (D-001-B/C, Q-001) even more valuable than the app already says.

**Retrieval:** search-summary. It must be confirmed by opening the Home Health Billing Manual.

### 1.2 Early Intervention visits are probably not paid at the home health per-visit rate

The model applies AS-001 ($143.02 per home health PT visit) to **every** visit, including the 60-minute EI visits. Several conclusions depend on that:

- "a 60-minute EI visit earns exactly what a 30-minute visit earns" (EV-027, AS-013, AS-019, `Simulator.tsx:216`);
- "an all-EI caseload cannot reach break-even" (Q-009);
- the whole visit-mix sensitivity as a profitability lever.

What the search summaries show:

- Early Intervention Colorado is the IDEA Part C program, run by the Colorado Department of Early Childhood through local programs (often Community Centered Boards). It serves children from birth up to age 3.
- HCPF has a **separate Early Intervention Billing Manual** with its own procedure-code table. Summaries of it say providers are paid a **negotiated hourly rate**, and travel time is generally built into that hourly rate.
- In 2025 the EI program had a reported $4M shortfall. Proposed cost containment included a cap of four hours of IFSP services per month. It was later paused, but it shows the EI funding stream carries its own policy risk, separate from the home health fee schedule.

**If EI is paid hourly, the mix finding flips.** A 60-minute EI visit would earn roughly twice a 30-minute one, not the same amount. Q-009's recommendation to steer referrals away from EI could then point the wrong way.

Nothing in the evidence base establishes how Ellen's employer bills EI, or how Blue Star would. **This needs a new evidence record and a question for Ellen before the mix analysis is used for any decision.**

**Retrieval:** search-summary.

### 1.3 The Founder Ramp books a full-time caseload while Ellen still works her full-time job

The launch scenario (EV-028, AS-026) is that Ellen keeps her current job and moves to Blue Star later. That job fills 9 to 5, four clinical days plus a makeup day (EV-029).

The ramp nevertheless gives Blue Star her **entire** clinical capacity from month 1: 8 visits/day × 4 days (`founderRamp.ts:153-154`). No pre-transition capacity limit exists anywhere.

At default inputs (1 new patient/week, observed frequencies, $90k target, $10k reserve), the ramp picks **month 4** as the transition month. At that point Blue Star's census is 14 patients, demanding **18.5 visits/week**. Before transition, those visits would sit on top of the 32–33 visits/week she already does for her employer, about 51 visits/week in total. So the "first eligible month" is reached on volume that cannot be delivered.

A related gap: the pre-transition phase has no line on the employer's non-compete, non-solicitation or conflict-of-interest terms. Serving a competing caseload in the same market while employed is a legal question, not just a scheduling one.

**What this needs:** an explicit pre-transition capacity input (Blue Star visits/week Ellen can do outside her job), probably with a default of null or unknown. The ramp should clamp to it until the transition month.

### 1.4 The Founder Ramp counts revenue as cash in the month care is delivered

`founderRamp.ts:187-199` adds `collectedRevenue / 12` to cash in the same month the visits happen. The rest of the system assumes 45 days to cash (AS-009), and the cash calendar applies a 2-month lag. The ramp also has no licensure or enrollment pre-revenue period, and no PAR approval delay before a new patient's first billable visit.

The cash criterion (`cumulativeCash ≥ minimumCashReserve`) is therefore met earlier than it could be in reality. At defaults that is the month-4 transition above.

### 1.5 Three modules compute capacity or volume three different ways

| Where | Weekly capacity basis | Cancellations | Result at defaults |
|---|---|---|---|
| `annualModel` / Simulator / Staffing | 8/day × 4 days = 32 | makeup day recovers 100% → 0% loss | $16,316/mo collected |
| `patientsAtCapacity` (Founder Ramp) | `maxVisitsPerWeek` = ⌊1920/55⌋ = **34** | n/a | "capacity ≈ 26 patients" |
| `founderRamp` month loop | 8/day × 4 = **32** | same as annualModel | overflow starts at 24.2 patients |
| `cashCalendar` (Capital view) | 32/week | **raw 15% lost**, no makeup recovery (`cash.ts:50`) | $13,868/mo collected |

What this produces:

- The Founder Ramp milestone table shows a **"Clinical capacity" row that is itself over capacity**: 25.76 patients, 8.5 visits/day, 0.5 visits/day overflow. The headline stat says "≈ 26 active patients", but the ramp's own ceiling is reached at about 24.
- The Capital view's cash calendar collects **15% less revenue** than the Simulator for the same inputs, because it ignores the makeup-day recovery that EV-029 describes as structurally important.
- `deriveFrequencyFromCaseload` also uses the 34/week ceiling rather than delivered visits. Entering Ellen's real caseload of 25 gives 1.36 visits/patient/week, against the observed 1.32. It also forces an equal EI/non-EI patient split at ratio 1.0, which yields 0.91 EI and 1.81 non-EI visits/patient/week. That contradicts the observed 1.0 and 1.57.

### 1.6 The "makeup day eliminates cancellation loss" claim rests on an unstated 100% recovery assumption

`weeklySchedule` assumes every cancelled visit that fits in makeup capacity actually gets rescheduled and delivered. Together with AS-005 (15%, labelled "NOT researched"), that gives an effective cancellation rate of **exactly 0%**. EV-029 then concludes that the assumed cancellation loss "was largely illusory".

That conclusion is only as strong as two unobserved inputs: the raw cancellation rate, and the share of cancellations families actually reschedule. A sick child, the most common reason for cancelling, is often still sick later that week. Neither input has been observed. Ellen could report how full her makeup day actually runs, which would settle it.

---

## Severity 2: incorrect or internally inconsistent figures

| # | Location | Problem | Evidence |
|---|---|---|---|
| 2.1 | `costs.ts:205` (C-031 workers comp) | `frequency: 'Percent of revenue'`. Workers comp premiums are a rate on **payroll**, not revenue. And because the capital model only sums One-time/Monthly/Annual lines, this required cost is **silently dropped**: it is neither counted nor listed among the "unknown items" in the Capital view's incompleteness warning. | `capitalRequirement` unknown list has 7 items; C-031 is not among them |
| 2.2 | `defaults.ts:23` | `fixedMonthlyOverhead: 500` is a hard-coded constant with no assumption record, which breaks the "no hidden constants" rule. The cost database's own required/recommended monthly lines total **$905/mo typical**. The Simulator, Staffing, Founder Ramp and break-even figures all use $500. | `capitalRequirement(...).monthlyBurn.typical = 905` |
| 2.3 | `cash.ts:44-47` | A null clinician salary becomes **$0 clinician cost** silently, the exact substitution the README says the model never makes. It is not reached in the UI today (the Capital view always passes a test salary), but the function is exported and untested for null. | probe: null-salary cash-out = $1,751/mo (overhead + mileage only) |
| 2.4 | `economics.ts:513-515` | The travel scenarios' "Tight radius" is hard-coded to 15 min, and "Moderate" uses the base, which is now also 15 min. Two of the three rows are identical. | probe output |
| 2.5 | `misc.ts:163` (Q-009) | "An all-EI caseload cannot reach break-even" is stated as fact, but salary (AS-003) is null. It is true at the $113,401 test point (break-even 6.87 vs. 6 max). It is **false** at $78,825 (4.85 vs. 6). At $135,278 the **current 33% mix also fails** (8.14 vs. 8). It is conditional on an unknown, and also on the EI-rate question in 1.2. | `visitMixSensitivity` at each test point |
| 2.6 | `data/caseload.ts` / EV-030 | The stated-totals gap has a cleaner reading than "unreconciled". If every patient is seen 1× or 2× weekly, then 23 patients and 32 visits imply **exactly 9 twice-weekly patients** (x + y + z = 23, x + 2y + z = 32 ⇒ y = 9), not 8. The stated totals are also the ones consistent with 8 visits/day × 4 days = 32. That makes them at least as plausible as the cohort figure of 33, which exceeds the model's own 32-visit week. Worth asking Ellen specifically: "Is it 8 or 9 twice-weekly kids?" | arithmetic |
| 2.7 | Ramp default discharge = 0% | 44% of the observed caseload is EI, which by definition ends by the child's **third birthday**. A 0% monthly discharge default cannot be right for that cohort, and it inflates census growth in every ramp run. AS-023 correctly stays null, but the scenario default and the "needs Ellen" framing should acknowledge the structural age-out. | EI eligibility is birth to age 3 |
| 2.8 | Founder Ramp income criterion | The transition compares business cash flow to the owner's comp target only. It ignores what leaving a W-2 job costs the household: employer health insurance, employer payroll taxes, retirement match and paid leave. EV-017 also says a W-2 Ellen triggers workers comp. A $90k target is not the same as replacing a $90k job. | `founderRamp.ts:201-203` |
| 2.9 | Capital vs. Founder Ramp | These are two different launch models (salaried clinician from day 1 vs. $0 owner comp) and they are never reconciled. The Dashboard says the capital requirement is "UNKNOWN", while the Founder Ramp shows cash turning positive from month 1. Neither view says which launch plan the other assumes. | views |

---

## Severity 3: stale narrative that now contradicts the model

The EI mix was corrected from about 50% to 33% (commit `eed60b5`). That moved average patient-facing time from 45 to **40 minutes** and the cycle from 60 to **55 minutes**. A lot of prose still describes the old numbers. One consequence is significant: **documentation concurrency is no longer a knife-edge.** At 0% in-workday documentation the cycle is 60 minutes and 8 visits still fit exactly (480/480). `concurrencyThreshold` now returns `null`.

Passages that are now wrong:

- **EV-025 interpretation** (`evidence.ts:623`): "45 + 15 = a 60-minute cycle… If documentation were additive the day would run to 8.7 hours and the schedule would not close." It would now close at 8.0 hours.
- **EV-026 interpretation** (`evidence.ts:646`): "100% absorption was the only setting under which an 8-visit day closed". It now closes at every setting.
- **AS-006** (`assumptions.ts:111`): "Combined with a 45-minute visit… the 60-minute cycle".
- **`economics.ts:88-100`, `:282`, `:861`**: comments citing 50/50, 45 minutes, and "annual days ÷ 52".
- **`founderRamp.ts:19-23`** and **`defaults.ts:88`**: say AS-020/AS-021 are null. They are now observed (1.0 and 1.57).
- **`founderRamp.ts:432-442`** (`ELLEN_QUESTIONS`): asks for caseload size, EI/non-EI frequency and "is the 50/50 mix closer to 45/55". All of these are already answered.
- **`FounderRamp.tsx:195, 201, 216`**: slider source labels read "UNKNOWN — needs Ellen" for AS-020, AS-021 and AS-027, which are now observed.
- **`FounderRamp.tsx:29`**: the caseload slider defaults to 30, not the observed 25.
- **`FounderRamp.tsx:412-418`**: "The cheapest one to answer first: how many distinct children…". Already answered.
- **`FounderRamp.tsx:425`**: EI mix is labelled "Approximate — needs confirmation", but it is now cohort-derived.
- **`Simulator.tsx:212`**: pill reads "Ellen's approximate current mix: 50% EI / 50% other". The model uses 33%.
- **Q-004** (`misc.ts:133`): still an open "Critical" question ("4 vs 6 visits/day"), although AS-002 answers it with 8.

---

## External facts: what held up

| Claim | Record | Re-check result |
|---|---|---|
| Class A liability minimum $500K / $3M; Class B $100K / $300K | EV-002 | **Consistent** with search summaries of 6 CCR 1011-1 Ch. 26 |
| FAMLI 2026 = 0.88% (0.44 / 0.44) | EV-018 | **Consistent** (reduced from 0.9% via SB 25-144 per summaries) |
| CO UI wage base $30,600 (2026), up from $27,200 | EV-019 | **Consistent** |
| Outpatient PT/OT: 48 units / rolling 12 months before PAR; evals and orthotics excluded | EV-009 | **Consistent** |
| Outpatient "5 units/day PT + 5 OT" cap | EV-009 | **Not corroborated.** Summaries mention per-code daily limits but not a flat 5-unit cap. Keep as unverified. |
| Colorado Access RAE region | EV-012 | **Resolves the open conflict: Region 4** under ACC Phase III (Denver, Adams, Arapahoe, Douglas). Also note **Region 3 is Colorado Community Health Alliance** and covers the western metro, so a metro-wide practice may deal with **two** RAEs. |
| Home health provider = Class A **+ Medicare certified/accredited** | not recorded | **New:** see 1.1 |
| EI billed separately, hourly | not recorded | **New:** see 1.2 |
| $143.02 FY26-27 / $145.31 FY25-26 pediatric PT rates | EV-006/007 | **Could not re-verify.** Source blocked, and no search result reproduced the figures. Still the highest-priority manual check. |
| SS wage base $184,500 (2026) | EV-018 | Consistent with my knowledge; not separately searched |

---

## What checks out

- The core time arithmetic: cycle, feasibility clamp, weekly ceiling.
- The cohort maths: 25 patients, 33 visits, 40-minute weighted visit, EI 33% of visits / 44% of patients, non-EI 1.571 visits/week.
- The annual model and break-even arithmetic.
- The two-pass transition logic.
- The capital bucket arithmetic.

Null-handling in `annualModel`, `viabilityCheck` and `capitalRequirement` behaves as documented. The honesty scaffolding (retrieval levels, null assumptions, "not a target" caveats, the assigned-caseload caveat) is sound. The problems above are staleness and cross-module drift, plus three modelling premises (EI rate, pre-transition capacity, Medicare certification) that no source ever tested.

---

## Suggested order of work

1. **Ask Ellen four questions:**
   - How is EI billed at her employer: per visit, hourly, and to which payer?
   - Is it 8 or 9 twice-weekly patients?
   - How full does her makeup day actually run?
   - How many Blue Star visits/week could she realistically do while still employed, and what do her non-compete and non-solicitation terms say?
2. **Add evidence and roadmap items** for Medicare certification or accreditation in the agency lane, and for EI provider approval and billing.
3. **Fix the mechanical defects:**
   - one capacity basis for `patientsAtCapacity`, `deriveFrequencyFromCaseload` and the ramp;
   - makeup-day recovery in `cashCalendar`;
   - the collection lag in the ramp;
   - C-031's frequency;
   - an overhead value derived from `costs.ts`;
   - null salary in `cashCalendar`;
   - travel scenario rows.
4. **Sweep the stale prose** listed in Severity 3.
5. **Only then re-read** the mix sensitivity and the Founder Ramp timeline as decision inputs.

## Sources (search summaries; primary pages blocked)

- [HCPF Home Health Billing Manual](https://hcpf.colorado.gov/hh-billing_manual) · [10 CCR 2505-10 §8.520 (LII)](https://www.law.cornell.edu/regulations/colorado/10-CCR-2505-10-8.520_v2)
- [HCPF Early Intervention Billing Manual](https://hcpf.colorado.gov/early-intervention-manual) · [CDEC Early Intervention](https://cdec.colorado.gov/early-intervention-for-infants-and-toddlers) · [CPR News, EI budget shortfall (Feb 2025)](https://www.cpr.org/2025/02/27/budget-shortfall-colorado-developmentally-delayed-children/) · [CDEC EI budget press release](https://cdec.colorado.gov/press-release/cdec-listens-to-community-proposes-early-intervention-budget-solutions-to-protect)
- [6 CCR 1011-1 Ch. 26 (SOS)](https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12016&fileName=6+CCR+1011-1+Chapter+26)
- [Jackson Lewis, Colorado FAMLI 2026](https://www.jacksonlewis.com/insights/colorado-famli-new-changes-new-year-impact-process-duration-more) · [501(c) Services, CO wage base $30,600](https://501c.com/colorado-taxable-wage-base-reaches-30600-in-2026/)
- [Health First Colorado outpatient PT/OT FAQ](https://www.healthfirstcolorado.com/frequently-asked-questions/health-first-colorado-outpatient-therapy-benefits-frequently-asked-questions/)
- [Colorado Access, ACC Phase III updates](https://www.coaccess.com/accphaseiiiupdates/) · [HCPF ACC Phase III](https://hcpf.colorado.gov/accphaseIII)
