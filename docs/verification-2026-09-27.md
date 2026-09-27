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

---

## Addendum, later the same day: three primary documents read directly

You uploaded the FY2026-27 Home Health Fee Schedule and HCPF's therapy
training deck, and pasted the licensing statute. All three are now in
`docs/sources/` and were read in full. These are the first figures in the
system that do not rest on a search summary.

### The modelling rate was wrong, and is now right

The fee schedule has **two columns**. The $143.02 the app was using is the
rate **effective 1 October 2025**. The rate **effective 1 July 2026** is
**$140.16**. The state cut rates again, 2.0% across the board, through
HB 26-1410 in the 2026 session.

| Pediatric discipline | FY2025-26 | From 1 Oct 2025 | From 1 Jul 2026 |
|---|---|---|---|
| Physical therapy (rev. code 421) | $145.31 | $143.02 | **$140.16** |
| Occupational therapy (431) | $146.31 | $144.01 | **$141.13** |
| Speech (441) | $157.97 | $155.48 | **$152.37** |

Every arithmetic cross-check lands exactly (÷1.016, then ×0.98), which also
retro-confirms the FY2025-26 figures the first build found. Cumulative: about
**-3.5% in nine months**, from two separate budget actions. That is the pattern
to plan for. AS-001 is updated, the dashboard says so, and the one test that
pinned the old number was moved.

> Reminder: this rate only exists in the agency lane, which is closed to new
> entrants under the Medicare freeze. It is now the *correct* number for a
> business you cannot currently be.

### The outpatient lane, from the source

The training deck (dated 13 May 2026) is the operating manual for the lane
that *is* open. What it settles:

- **Unit counts are confirmed.** 23 to 37 minutes bills 2 units; 53 to 67
  minutes bills 4. So a 30-minute visit is 2 units and a 60-minute EI visit is
  4. Only the dollar rate per unit is still missing (that is the Physician Fee
  Schedule, still on the list).
- **Travel and documentation are explicitly not billable.** The deck says so
  in plain words. In the agency lane they were absorbed into a flat rate; here
  they are pure cost.
- **Enrollment path:** the practice enrolls first as a group (Provider Type
  48, Specialty 397, with the FEIN), then each PT enrolls as Provider Type 17,
  Specialty 451 with their SSN and affiliates to the group.
- **Every child needs a physician, PA or NP order** (an IFSP counts), care
  must start within 28 days, and the plan of care is limited to 90 days and
  must be re-signed every 90 days. That is a recurring paperwork loop per child.
- **PAR timing:** 48 PT+OT units per rolling year before a PAR. A weekly
  60-minute patient uses that in about 12 weeks; a weekly 30-minute patient in
  about 24. Retroactive PARs are not allowed, except for EI children aged 0 to 4.
- **Documentation is heavier than Ellen's 5-minute note.** Encounter notes
  must carry start and stop times, timed minutes per code, units billed and
  SOAP elements. AS-007 now carries that warning.
- **A PT may supervise up to four assistants.** PTAs cannot enroll or bill on
  their own, but they can deliver visits under Ellen's NPI. None of the
  strategy paths considers this. New question Q-013.
- **School-age children with an IEP** are paid by the school district, not
  fee-for-service. That bounds the referral base.

### The statute: one correction and one warning

The text you pasted is section 103. It contains the licence requirement and the
penalties, and **no exemptions**. My earlier record placed the "individual acting
alone" exclusion in 103(1)(b)(III); that was wrong. Subsection (1)(b) is the
civil-penalty clause. The exclusion lives in the **definition of "home care
agency" in section 102**, which is the next thing worth pasting.

Two things the direct read added:

- **The penalty is concrete:** a misdemeanor with a $50 to $500 fine, plus a
  civil penalty of **up to $10,000 per violation**. In a visit-based business,
  "per violation" is a phrase to take seriously.
- **Subsection (1.5)** says an entity that contracts with a service agency and
  itself meets the definition of a home care agency is *not* relieved of its
  own licence duty. That closes the "we just contract with therapists" idea
  before anyone has it.

### What is still missing, in order

1. **Physician Fee Schedule** (1 Jan and 1 Apr 2026 versions) for the per-unit
   rates. With the unit counts now confirmed, this one document turns the open
   lane into a number.
2. **C.R.S. 25-27.5-102**, the definitions, for the exact wording of the
   individual exclusion.
3. Everything else on the earlier list, unchanged.

---

## Second addendum: five more documents read directly

You uploaded the home care agency rule (6 CCR 1011-1 Chapter 26, effective
1 July 2025), the Federal Register moratorium notice, HCPF's October 2025
rate-reduction bulletin, OM 25-037, and CDPHE's 2026 fee transition sheet.
Thirteen evidence records now rest on a direct read. Three findings are new.

### 1. The state licence does not require nursing. Medicare does.

The rule contemplates a therapy-only Class A agency in plain words: "other
healthcare services shall be under the supervision and direction of a
physician, registered nurse, **or other licensed healthcare professional**"
(6.5), and when a non-nursing service is the only one ordered, that
professional does the initial assessment (6.7). So a licensed Class A therapy
agency is lawful in Colorado. The plan had merged two different things:

| | State Class A licence | Medicaid home health enrollment |
|---|---|---|
| Who requires it | CDPHE | HCPF, via Medicare certification |
| Nursing required | No | Yes (federal definition) |
| Under the moratorium | No | Yes |
| What it lets you bill | Outpatient per-unit rates, with employees, lawfully | The $140.16 flat per-visit rate |

A Class A licence without Medicare is a middle path nobody had named: employ
therapists, treat in homes lawfully, bill outpatient rates. Whether the licence
is worth it at outpatient revenue is the question. Recorded as UU-012.

### 2. Early Intervention providers are excluded from licensing entirely

Rule 2.10(B)(9): a home care agency "does not include services provided by a
qualified early intervention service provider." Eleven of Ellen's twenty-five
children are EI. That is a third lane, licence-free at any team size, for the
birth-to-three population. Two things nobody has looked up: how a provider
becomes "qualified" with Early Intervention Colorado, and what EI pays per
visit (an older HCPF memo suggests well below home health). Added as option E
on D-001, unknown UU-011 and question Q-014, and folded into your referral
conversations (T-006).

### 3. What a Class A agency must actually have

From the rule, read directly:

- **A physical business office in Colorado** capable of day-to-day business
  (5.1). D-003 is decided by regulation in the agency lane. Whether a home
  office counts is the remaining question for CDPHE (Q-006, reworded).
- **An administrator** who is a licensed healthcare professional or has health
  administration experience, with two years of healthcare administration
  including one supervisory year in home care, plus 24 training hours in year
  one and 12 a year after (6.4). Ellen plausibly qualifies.
- **Fingerprint checks** for every owner and administrator, so you as well as
  Ellen (4.2(D)).
- **$500K / $3M liability insurance, or a surety bond in lieu** (4.2(B)).
- **A list of contiguous counties** you will serve (4.2(C)).
- **Fees** set by a separate schedule the rule points to; the transition sheet
  you sent is only an index of which schedule applies. C-002 stays unknown.

### Corrections and confirmations

- **OM 25-037 is not what the first build said it was.** It is the RN/CNA
  go-live memo. It confirms therapy PARs restarted 1 July 2025 as a "fresh
  start" with every child re-reviewed by April 2026, and it shows HCPF's
  enforcement ladder ending in payment withholding. The "4 May / 1 June 2026"
  dates the first build attributed to it are not in it; they came from
  summaries of some other document and are now marked unverified.
- **The moratorium notice, read in full**, adds: applications received before
  13 May 2026 are exempt; when it lifts, anyone applying within six months gets
  the strictest screening tier; states decide for Medicaid; and CMS names "low
  start-up costs" as what makes home health attractive to fraud.
- **The October 2025 bulletin** confirms the 1.6% rollback exactly as
  summarised, and shows that targeted cuts can be much larger: pediatric
  behavioral therapy codes were cut up to about 48% in one month.
- **Class A definitions, the insurance minimum, and the "individual acting
  alone" exclusion** are all now read directly from the rule.

### Still missing, in order

1. Physician Fee Schedule (1 Jan and 1 Apr 2026) for the per-unit rates.
2. Early Intervention Colorado provider qualification and payment (Q-014).
3. C.R.S. 25-27.5-102, the statutory definitions.
4. The HCA fee schedule 2026/2027 page itself, for the Class A amount.
5. Whatever HCPF document carries the 2026 pediatric LTHH PAR dates.

---

## Third addendum: the outpatient rates, read directly

You sent the January 2026 Physician Fee Schedule. It is 156 pages; the
therapy codes are on pages 94 and 103. Its rate column is labelled
"10-01-2025 rates", so it predates the July 2026 2% cut. Everything below is
therefore about 2% high, and the July 2026 schedule is the one remaining
download for this question.

### The rates

| Code | What it is | Per unit / session |
|---|---|---|
| 97530 | Therapeutic activities (15 min) | $34.97 |
| 97110 | Therapeutic exercise (15 min) | $32.14 |
| 97112 | Neuromuscular re-education (15 min) | $33.55 |
| 97140 | Manual therapy (15 min) | $29.98 |
| 97161–97163 | PT evaluation, any complexity | $87.52 |
| 97164 | PT re-evaluation | $60.52 |
| 97165–97167 | OT evaluation | $88.12–$90.05 |
| 92507 | Speech treatment, per session, any length | $72.01 |
| 92523 | Speech and language evaluation | $197.61 |

### What a visit is worth, lane by lane

Using the 8-minute rule from the training deck (30 minutes = 2 units,
60 minutes = 4) and 97530:

| Visit | Outpatient lane | Home health lane | Ratio |
|---|---|---|---|
| 60-minute EI visit | $139.88 | $140.16 | ~100% |
| 30-minute visit | $69.94 | $140.16 | ~50% |
| Weighted, Ellen's mix (11 of 33 EI) | $93.25 | $140.16 | ~67% |
| Gross per week, 33 visits | $3,077 | $4,625 | ~67% |

At 97110 instead of 97530, subtract about 8%.

Three things to take from this:

1. **The open lane is a real business, not a hobby.** A 60-minute visit pays
   the same as home health. The plan's worry that outpatient rates might be a
   fraction of home health was right only for short visits.
2. **The visit-mix lever has reversed.** Under the flat rate, Ellen's eleven
   60-minute EI children were the capacity drain. Under per-unit pay they are
   the best-paid visits, and the 30-minute children are the thin ones. Every
   conclusion in the Simulator's mix sensitivity is about the *closed* lane.
3. **Evaluations matter.** Every new child starts with an $87.52 evaluation
   that sits outside the 48-unit allowance. Intake is not just paperwork; it
   is revenue.

Speech is the exception: a speech session is a flat $72.01 regardless of
length in the outpatient lane against $152.37 in home health, so a speech
therapist's economics differ sharply by lane. That bears on D-004.

### What changed in the app

- EV-050 records the rates; AS-032 (97530), AS-033 (97110) and AS-034 (PT
  evaluation) are filled, marked "Strong evidence" rather than "Confirmed"
  because the July 2026 cut is not yet reflected.
- A small new model, `src/model/outpatient.ts`, applies the 8-minute rule and
  compares the lanes. It holds no rate of its own; rates come from the
  register. Nine new tests cover it.
- The dashboard now shows the two-lane comparison at the top. The Simulator,
  Staffing and Founder Ramp screens still run on the home health rate, and
  say so.
- UU-009 is marked understood, Q-010 answered, T-008 done.

### Still missing

1. Physician Fee Schedule effective 1 July 2026, for the post-cut figures.
2. Early Intervention Colorado provider qualification and payment (Q-014).
3. C.R.S. 25-27.5-102.
4. The HCA fee schedule 2026/2027 page.
5. Provider Bulletin B2600538 (May 2026) for the pediatric LTHH PAR dates.

---

## Fourth addendum: the April 2026 schedule, and it is not a 2% story

You sent the Physician Fee Schedule effective 1 April 2026. It lists 2,881
codes, and the therapy treatment codes on it were cut hard, not trimmed:

| Code | Jan 2026 (Oct 2025 rates) | Apr 2026 | Change |
|---|---|---|---|
| 97110 Therapeutic exercise | $32.14 | **$25.15** | -21.7% |
| 97530 Therapeutic activities | $34.97 | **$30.37** | -13.2% |
| 97140 Manual therapy | $29.98 | **$23.73** | -20.8% |
| 97112 Neuromuscular re-education | $33.55 | **$27.98** | -16.6% |
| 97161–97163 PT evaluation | $87.52 | **$85.57** | -2.2% |
| 92507 Speech session | $72.01 | **$65.37** | -9.2% |
| 92523 Speech evaluation | $197.61 | **$194.68** | -1.5% |

Search summaries of HCPF's budget material and an April 2026 CPR news report
say this was a state budget action setting most fee-for-service rates to 85%
of Medicare. That explanation is from summaries, not a document; the rates
themselves are read directly.

### The lane comparison, recomputed

| Visit | Outpatient (97530) | Home health | Ratio |
|---|---|---|---|
| 60-minute EI visit | $121.48 | $140.16 | 87% |
| 30-minute visit | $60.74 | $140.16 | 43% |
| Weighted, Ellen's mix | $80.99 | $140.16 | 58% |
| Gross per week, 33 visits | $2,673 | $4,625 | 58% |

At 97110 instead of 97530, subtract about 17%. The July 2026 2% cut is still
not in these figures; the July schedule is published as an Excel file
(`01_CO_Fee Schedule_Health First Colorado_07012026 v1.1.xlsx` on the HCPF
provider rates page) and is the one remaining download for this question.

### What this means

- **Three cuts in nine months:** October 2025 (-1.6%), April 2026 (targeted,
  13–22% on the codes you would bill), July 2026 (-2.0%). Evaluations were
  spared; treatment minutes were not. Any outpatient plan has to survive
  double-digit rate moves on a quarter's notice.
- **The lane gap widened.** In the January figures the outpatient lane earned
  about two-thirds of home health on Ellen's mix; on April figures it is
  58%. The 60-minute visit still holds up (87%); the 30-minute visit is now
  under half.
- **Evaluations are relatively more valuable** than they were, since they
  were cut 2% while treatment was cut 13–22%.
- **Speech took a 9% hit** on its per-session rate, widening the gap with the
  home health speech rate ($152.37) to more than 2×.

The register (AS-032 to AS-034), the dashboard card, the lane-comparison tests
and the unknowns are all updated to the April figures.

---

## Fifth addendum: the PAR dates verified, an easier plan-of-care rule, and the EI standard

Three more documents read directly (the second copy of the April fee schedule
was identical to the one already stored).

### May 2026 Provider Bulletin (B2600538)

- **The 2026 pediatric LTHH dates are now verified.** PARs required for every
  new and existing child from 4 May 2026; fully enforced from 1 June 2026.
  This is the document the first build should have cited instead of
  OM 25-037. The dates were right; the attribution was wrong.
- **PARs got faster and stricter in January 2026.** One pend per request,
  seven calendar days to answer it, technical denial otherwise; standard
  turnaround seven days; everything done within 21. The packet has to be
  complete the first time.
- **Good news for the outpatient lane.** From 15 May 2026 a physician's
  signature on the plan of care is no longer required when an order or
  referral exists and the therapist documents delivering the plan to the
  physician within 30 days of the initial evaluation. That loosens the 90-day
  re-signature loop in the therapy training deck.
- From 18 May 2026, claims from a provider whose DORA licence has expired in
  the payer's records deny automatically. Licence tracking is a billing
  matter, not just an HR one.

### Acentra's pediatric LTHH therapy training (April 2026)

The agency-lane authorization machine in detail: a 10-day window after the
first visit to submit the PAR; a plan of care on the HCFA-485 that a therapist
may author but a physician must sign before the last claim of the period;
units requested for the whole certification period up front (2 visits a week
for 26 weeks = 52); one pend, seven days; expedited reviews in 72 hours. Two
lessons carry to any lane: have the packet ready before the first visit, and
ask for all the units you will need because revisions after expiry are refused.

### EI Colorado personnel standards

The qualification half of Q-014 is answered, and it is light. A physical
therapist qualifies with a Colorado licence, training in the state's
evaluation tools, and EI Colorado's 13-module online provider course with a
final exam, certificate uploaded to the EI Provider Portal before billing.
Ellen may already have done this through her employer; worth asking. What the
document does not say is how an organisation contracts with the local EI
program or what EI pays per visit. Those remain open.

### The payslip

A payslip was uploaded alongside these documents and, at your instruction,
disregarded. It is not stored, nothing from it is recorded in the knowledge
base, and the record briefly made from it has been removed.

### Still missing

1. July 2026 Physician Fee Schedule (Excel) for the post-cut rates.
2. How an organisation contracts with the Denver-area EI program, and EI pay.
3. C.R.S. 25-27.5-102.
4. The home care agency fee schedule 2026/2027 page.

---

## Sixth addendum: the Early Intervention rule (8 CCR 1405-1)

The rule PDF you sent this time is the Early Intervention Colorado program
rule, not the home care agency rule. Read in full. It answers the
organisational half of Q-014.

- **Who you contract with.** One Certified Early Intervention Service Broker
  per service area, normally the Community Centered Board. It keeps a
  registry of qualified providers drawn from the EI Provider Database, may
  deliver services itself or subcontract, assigns children, and is the
  provider of record for everything it contracts. For Denver that is the
  local EI program.
- **How Medicaid children are paid.** The rule's funding hierarchy: families
  pay nothing; private insurance first, with consent; then Medicaid, billed
  with Medicaid codes by the EI provider; federal Part C money last. A
  qualified provider may bill Medicaid directly rather than through the
  broker. So for a Medicaid-enrolled EI child, the revenue is the outpatient
  per-unit figure already in the register: about $121 for a 60-minute visit.
- **How the rest is paid.** The broker sets its own purchase-of-service rate
  for the state-funded portion, from local usual-and-customary practice,
  written down and applied consistently, capped by the Department. The rule
  contains no numbers. The Denver broker's rate sheet is the one piece still
  missing, and it only matters for non-Medicaid children and uncovered
  services.
- **Fees.** A broker may charge a contracted agency a documented fee for
  managing billing, but the fee cannot depend on collections.

Put together with the earlier documents, the Early Intervention lane now
looks like this: a licence-free way (EV-047) to serve birth-to-three children
with a team, entered by a light personnel standard (EV-054) plus a broker
contract (EV-056), paid at outpatient Medicaid rates for Medicaid children
(EV-051) and at a broker-set rate otherwise. UU-011 is marked understood;
Q-014 is narrowed to the broker's rate sheet and application.

### Still missing

1. July 2026 Physician Fee Schedule (Excel) for the post-cut rates.
2. The Denver-area EI broker's provider application and rate sheet.
3. C.R.S. 25-27.5-102.
4. The home care agency fee schedule 2026/2027 page.

---

## Seventh addendum: the statutory definitions (C.R.S. 25-27.5-102)

You pasted section 102. Read in full and stored. It matches the CDPHE rule
word for word on the definition of a home care agency and its ten
exclusions, which means the "individual acting alone" and Early Intervention
exclusions are statutory, not merely regulatory. The correct citation for
the individual exclusion is 25-27.5-102(3)(b)(III).

Two things the rule did not spell out:

- **"Owner" is defined at fifty percent.** If you and Ellen each hold half of
  Blue Star, you are both owners for the agency-lane fingerprinting
  requirement. A 51/49 split would put one of you outside the definition.
  That is a detail for the attorney and CPA conversation about entity
  structure (T-010), not a reason to choose a split.
- **The definition turns on an entity that "manages and offers" services.**
  An LLC is a "legal or commercial entity". The moment it offers Ellen's
  services it fits the definition unless an exclusion applies, and the
  individual exclusion is written for a person acting alone. That is exactly
  the question to put to counsel, now with the precise wording in hand.

Both licensing statute sections and the rule are now read directly. The
regulatory picture is complete except for the fee amount.

### Still missing

1. July 2026 Physician Fee Schedule (Excel) for the post-cut rates.
2. The Denver-area EI broker's provider application and rate sheet.
3. The home care agency fee schedule 2026/2027 page.

---

## Eighth addendum: the fee transition sheet as a spreadsheet

The Excel version of CDPHE's fee transition guidance carries the hyperlinks
the PDF dropped. The home care agency fee schedules are Google Sheets:

- Home Care Agencies (HCA/HHA), Fee Schedule 2026/2027:
  https://docs.google.com/spreadsheets/d/1EF7K8FcNJvaQYSSc78JNXxYODNvYrzhiv_u5hlyIaE0/
- Home Care Agencies and Placement Agencies, Fee Schedule 2025/2026:
  https://docs.google.com/spreadsheets/d/1DegT82UDVUwDbEgOGjFlvdAajpaRdHTcS_1PisTuK6I/

Google Docs is blocked from this session as well, so I could not open them.
Open the first one in a browser, use File, Download, and send it as .xlsx or
PDF. It should contain the Class A initial licence fee, which is the last
unknown on the agency-lane cost list (C-002).

### Still missing

1. July 2026 Physician Fee Schedule (Excel) for the post-cut rates.
2. The HCA fee schedule 2026/2027 Google Sheet above, downloaded.
3. The Denver-area EI broker's provider application and rate sheet.

---

## Ninth addendum: the Class A licence fee

You downloaded the Home Care Agencies fee schedule for 1 July 2026 to
30 June 2027. Read directly. The last unknown on the agency-lane cost list
is filled.

| Item | Amount |
|---|---|
| Initial licence, Class A (medical) | $3,709.49 |
| Initial licence, Class B (non-medical) | $2,720.30 |
| Annual renewal base, Class A | $1,916.58 |
| Per branch / per workstation | $247.30 / $61.83 |
| Volume fee at 50 to 99 / 100+ annual admissions | $123.65 / $247.30 |
| Medicaid- or Medicare-certified discount | $100 off the base renewal |
| Accreditation discount | 10% off the base renewal |
| Change of ownership | same as initial, $3,709.49 |
| Provisional licence | 15% of the initial fee per term |
| Revisit for an uncorrected deficiency | 100% of the applicable fee, each time |

Three things to take from it:

- **The fee was never the barrier.** Under $4,000 to apply and under $2,000 a
  year to keep. The barrier in the agency lane is Medicare certification, the
  nursing requirement and the moratorium, not CDPHE's price.
- **The timeline has one fixed point.** A complete application must be in at
  least 90 days before the intended start date, before any survey time.
- **Two traps.** A renewal 90 days late invalidates the licence outright and
  forces a fresh application. A repeat inspection for the same deficiency
  costs a full licence fee every time.

C-002 is now $3,709.49 and a new line C-007 carries the annual renewal. The
capital model's "unpriced required lines" count drops by one. None of this
applies in the outpatient or Early Intervention lanes.

### Still missing

1. July 2026 Physician Fee Schedule (Excel) for the post-cut outpatient rates.
2. The Denver-area EI broker's provider application and rate sheet.

Every regulatory and rate document on the original list has now been read
from the source, except the July 2026 outpatient schedule.
