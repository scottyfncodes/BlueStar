# Verification pass — 27 September 2026

**Who this is for:** Scott, building Blue Star In-Home Pediatrics with no prior
healthcare-business experience.
**What this is:** a plain-language record of what was checked, what changed, and
what to do next. Every claim below is also in the app's Evidence view with its
source URL (records EV-031 to EV-043).

**Honesty note first.** The government and legal websites were blocked again in
this session, exactly as in the first build. Everything here was reached through
search-engine summaries of the real documents, cross-checked against several
independent summaries where possible. Nothing was read off a source PDF. Where I
say "confirmed" I mean "three or more unrelated sources say the same thing", not
"I opened the document". The list at the end tells you which documents to open
yourself.

---

## 1. The five things that change the plan

### 1a. New home health agencies are frozen out of Medicare, nationwide

On **13 May 2026** CMS (the federal Medicare/Medicaid agency) stopped accepting
Medicare enrollments from **new home health agencies** anywhere in the United
States. It lasts six months, can be extended six months at a time, and the
stated reason is fraud in the sector. It was published in the Federal Register on
15 May 2026 and reported identically by CMS, the hospital association, both major
accreditors and several law firms.

**Why it matters to you:** Colorado Medicaid will not enroll a home health
agency unless it is *also* enrolled in Medicare (see 1b). So the "licensed home
care agency" lane — the one the whole $143-a-visit model is built on — cannot
even be applied for until at least mid-November 2026, and possibly later.

> **Plain English:** the door your plan assumed you would walk through is
> locked for now. Not forever, but for now.

### 1b. That lane also needs Medicare certification, and Medicare needs nurses

Two facts stacked together:

1. **HCPF (Colorado Medicaid) says** a home health agency must hold a Class A
   licence *and* be Medicare certified (via an accreditation survey by ACHC,
   CHAP or the Joint Commission) *and* be enrolled in Medicare before it can
   bill Colorado Medicaid for home health.
2. **Federal law says** a Medicare home health agency must provide **skilled
   nursing plus at least one other service** (PT, OT, speech, social work or
   aides). A therapy-only agency does not qualify.

**Why it matters:** "a pediatric therapy agency billing the home health benefit"
cannot exist on its own. To earn the flat per-visit rate for therapy you would
have to run a nursing agency too — hire nurses, supervise nurses, comply with
nursing rules. That is a different company from the one described in the plan.

Also hiding in the Medicare rules: you must **treat 10 patients (7 still
active) before the certification survey** — paid some other way, or not paid —
and prove **three months of operating cash** in the bank at application.

> **Plain English:** Ellen's employer can bill $143 a visit because it is a
> Medicare-certified nursing-and-therapy agency. Blue Star as planned is not
> that, and cannot become that quickly, cheaply, or (right now) at all.

### 1c. A therapist working entirely alone is exempt from the licence

Colorado's home care agency law (C.R.S. 25-27.5-103) has a list of exemptions.
One of them is **"an individual who is not employed by or affiliated with a home
care agency and who acts alone, without employees or contractors."** A CDPHE
compliance page quotes the same exemption.

**Why it matters:** the first phase of your Founder Ramp — Ellen, alone, $0
owner pay, cash building up — appears to be lawful *without any facility licence
at all*, enrolled with Medicaid as an outpatient PT and billing by the 15-minute
unit with the home as the place of service.

**The catch, and it is a real one:** the law says "individual". Whether the
exemption still holds when Ellen practises through Blue Star LLC is a question
only a Colorado healthcare attorney can answer. And the exemption ends the
moment a second clinician is engaged — even a contractor, even part-time. It is
an on-ramp, not a destination. I added it to decision D-001 as option D.

### 1d. The rate cut has a cause, and it validates the number

The plan noticed the pediatric PT rate fell from $145.31 to $143.02 and flagged
it as a mystery. It is not a mystery. In **August 2025 the Governor declared a
state revenue shortfall**; in **September 2025 HCPF took back the 1.6% increase**
the legislature had granted for the year, effective **1 October 2025**.

Check the arithmetic: $145.31 ÷ 1.016 = **$143.02**. Exactly. So the FY2026-27
figure in the model is very likely right — and it has probably applied since
October 2025, not July 2026.

> **Lessons:** Colorado Medicaid rates follow the state budget, not inflation.
> They can be cut mid-year with about a month's notice. Any plan that needs a
> rate increase to work is not a plan.

### 1e. In the outpatient lane you are paid by the 15-minute unit — and the rate is blank

This is the one that matters most *today*. If the agency lane is closed (1a,
1b) and the solo/outpatient lane is open (1c), then Blue Star's real revenue per
visit is **not $143.02**. It is (units × rate per unit):

| Visit | Units billed | Revenue |
|---|---|---|
| 30-minute non-EI visit | 2 | 2 × *rate* |
| 60-minute EI visit | 4 | 4 × *rate* |
| Daily cap per child | 5 | — |

The *rate* lives in the Health First Colorado Physician Fee Schedule, which this
session could not open. **I did not guess it**, because Medicaid therapy rates
differ between states by more than 2×, and a guess here would poison every number
downstream. The assumption register now holds it as **AS-032 = unknown**, and
roadmap task **T-008** is "look it up" — an afternoon's work, and the single most
valuable afternoon in the plan right now.

**A twist to notice:** under per-unit pay, the visit-mix lever *reverses*. In
the flat-rate model a 60-minute EI visit was a capacity drain (same money, twice
the time). Under per-unit billing it earns twice as much. Ellen's 11 EI children
go from being the worst visits to the best-paid ones.

---

## 2. Smaller things confirmed or corrected

| Topic | What the plan said | What I found | Status |
|---|---|---|---|
| PAR dates for pediatric LTHH therapy | Required 4 May 2026, enforced 1 June 2026 | Same dates, multiple summaries | Confirmed (still summary) |
| Class A agency insurance minimum | $500K / $3M | Same in the LII copy of the rule | Confirmed (still summary) |
| FAMLI 2026 | 0.88% total, 0.44/0.44, employer share waived under 10 staff | Same across three payroll vendors | Confirmed |
| Unemployment insurance wage base | $30,600 | Same | Confirmed; new-employer rate still not found, but the whole line is bounded at roughly $220–$1,400 per employee per year, so it barely moves the model |
| IRS mileage | "not verified" | 72.5¢ Jan–Jun 2026, **76¢ Jul–Dec 2026** | Rate verified; your $12/visit implies ~16 miles round trip, which is a guess |
| Medicare/Medicaid enrollment fee | "not established" | **$750** for 2026, institutional providers only; likely not payable in the outpatient lane | Added as C-004 |
| Clinician pay | three aggregators disagree | a fourth aggregator ($100K average) disagrees too; **one Denver posting pays $65–$95 per visit** | Still unknown; per-visit pay is a structure the model can't yet express |
| Home health eligibility | assumed any child at home | the rule requires the record to show the child **cannot be treated as an outpatient** | Narrows the agency lane further |
| Early Intervention children | assumed billed like any visit | billed according to the *provider's* lane, not the child's; Medicaid is billed first, EI funds pay only what Medicaid won't | Ask Ellen how her employer bills them |

---

## 3. What I changed in the app

- **Evidence:** 13 new records (EV-031 to EV-043), each with source, URL,
  confidence and an honest retrieval label. Cross-check notes added to EV-002,
  EV-004, EV-013, EV-018.
- **Assumptions:** AS-001 now carries the rate-cut cross-check and a warning
  that it is agency-lane-only. AS-003 adds the 2026 data point. AS-010 now cites
  the verified mileage rate. **New AS-032** (outpatient revenue per visit) is
  deliberately null.
- **Decision D-001:** option A (agency) now lists Medicare certification,
  skilled nursing, the moratorium, the capital test and the pre-survey patients
  as requirements. Option B notes the individual exemption and the missing
  per-unit rate. **New option D**: Ellen alone under the exemption.
- **Unknown unknowns:** UU-002 (rate cut) marked "Understood" with its cause.
  **New UU-007 to UU-010** for the moratorium, the nursing requirement, the
  blank per-unit rate, and the solo exemption.
- **Open questions:** Q-010 (look up the per-unit rate), Q-011 (ask Ellen how
  she is paid and how EI children are billed), Q-012 (has Colorado mirrored the
  moratorium; when does it lift).
- **Roadmap:** T-008 (price a 30- and 60-minute outpatient visit) and T-009
  (the two Ellen questions), both Phase 0; T-007 now waits on T-008.
- **Costs:** C-004 ($750 fee), C-005 (accreditation, unknown), C-006 (three
  months of reserve cash, unknown) — all agency-lane-only.
- **Dashboard** callout rewritten so the first screen says what changed.
- All **269 tests pass**; the production build succeeds.

I did **not** change the financial model's formulas. Every revenue figure in the
Simulator, Staffing and Founder Ramp screens still uses $143.02 per visit. That
is now clearly labelled as an agency-lane figure, but the honest state is: **the
app cannot yet show you what a Blue Star launch would earn**, because AS-032 is
blank. Filling it is T-008.

---

## 4. What to do next, in order

1. **T-008 — look up the per-unit rates (you, one afternoon).** Open the
   Physician Fee Schedule PDF linked in EV-043, or use the HCPF code lookup.
   Write down the rate for 97110, 97530, 97140, 97161–97163, 97165–97167,
   92507, 92523. Multiply by 2 and by 4. That is your revenue per visit in the
   lane that is actually open.
2. **T-009 — two questions for Ellen (ten minutes).** How is she paid — salary,
   hourly, or per visit, and at what rate? And are her 11 EI children billed as
   home health visits or something else? While there: is it 23 or 25 patients,
   32 or 33 visits?
3. **T-002 / T-003 — the lawyer and CDPHE, reframed.** The question is now
   sharper: *does the "individual acting alone" exemption in 25-27.5-103 cover
   Ellen practising through Blue Star LLC, and what exactly ends it?* A tightly
   scoped question is cheaper than a general engagement.
4. **T-001 — open the two fee-schedule PDFs** and confirm $143.02, even though
   the arithmetic now supports it. Five minutes.
5. **Diary note for 13 November 2026:** check whether the Medicare home health
   moratorium was lifted or extended (Q-012). Until then, the agency lane is not
   a decision, it is a date.

---

## 5. Words you will keep meeting

- **HCPF** — Colorado Department of Health Care Policy & Financing. Runs
  Colorado Medicaid, branded *Health First Colorado*.
- **CDPHE** — Colorado Department of Public Health & Environment. Issues the
  home care agency licence.
- **CMS** — the federal Centers for Medicare & Medicaid Services.
- **Class A licence** — CDPHE licence for agencies providing *skilled* care
  (nursing, therapy). Class B is non-medical personal care.
- **Medicare certification / deemed status** — proof an agency meets federal
  Conditions of Participation, usually obtained by passing a survey from an
  accreditor (ACHC, CHAP, Joint Commission).
- **Moratorium** — a temporary freeze on new enrollments.
- **PAR** — Prior Authorization Request. Permission from Medicaid *before* care
  is delivered. Required for pediatric long-term home health therapy since
  May/June 2026; required in the outpatient lane after 48 units in 12 months.
- **CPT code / unit** — the billing codes for outpatient therapy. Most are
  timed in 15-minute units (97110 = therapeutic exercise, 97530 = therapeutic
  activities, 9716x = PT evaluation).
- **Per-visit rate** — the flat home health payment (e.g. $143.02) for one visit
  of up to 2.5 hours, regardless of length.
- **EI / IFSP** — Early Intervention (birth to 3) and its Individualized Family
  Service Plan. Medicaid is billed first; EI funds are the payer of last resort.
- **FAMLI** — Colorado's paid family and medical leave premium.
- **SUTA / UI premium** — state unemployment insurance, charged on the first
  $30,600 of each employee's wages.
- **Loaded cost** — salary plus payroll taxes plus benefits; the real cost of an
  employee, roughly 30% above salary.

---

## 6. Documents to open yourself (the human verification pass)

Direct fetches were blocked, so these remain unread. Each is linked in the
Evidence view.

1. HCPF Home Health Fee Schedule FY2026-27 PDF — confirm $143.02 (EV-007).
2. HCPF Physician Fee Schedule, 1 Jan 2026 and 1 Apr 2026 PDFs — the per-unit
   rates (EV-043).
3. HCPF Home Health Billing Manual, "Provider Eligibility" — the Medicare
   certification requirement (EV-031).
4. Federal Register 2026-09717 — the moratorium notice (EV-033).
5. C.R.S. 25-27.5-103 — the exemption text (EV-034).
6. 6 CCR 1011-1 Chapter 26, rule version 12016 — current insurance minimums and
   any physical-location requirement (EV-002).
7. HCPF Special Provider Bulletin B2500528 — the October 2025 cut (EV-037).
8. CDPHE Facility Fees page — the Class A initial fee, still unknown (C-002).

If you want future sessions to read these directly, the environment's network
policy needs these hosts allowed: `hcpf.colorado.gov`, `cdphe.colorado.gov`,
`www.sos.state.co.us`, `leg.colorado.gov`, `cdle.colorado.gov`, `www.cms.gov`,
`www.ecfr.gov`, `www.federalregister.gov`, `www.irs.gov`,
`www.law.cornell.edu`, `law.justia.com`.
