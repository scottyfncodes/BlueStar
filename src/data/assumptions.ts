import type { Assumption } from '../types';

/**
 * The assumption register. Every number the financial model uses comes from
 * here, so that changing a belief changes the model — and so that no figure
 * can quietly acquire the authority of a fact.
 *
 * value: null is a legitimate, deliberate state. It means "we do not know".
 * The model must handle nulls rather than have someone invent a placeholder.
 */
export const assumptions: Assumption[] = [
  {
    id: 'AS-001',
    name: 'Medicaid pediatric PT reimbursement per home health visit',
    value: 143.02,
    unit: 'USD per visit',
    kind: 'LIVE_RESEARCH',
    source: 'HCPF Home Health Fee Schedule FY2026-27',
    evidenceIds: ['EV-007', 'EV-006'],
    whyThisValue:
      'Current-year published fee schedule rate for pediatric PT, revenue code 421. Used instead of the prior-year $145.31 because the current year governs.',
    confidence: 'Strong evidence',
    financialImpact: 'Critical',
    operationalImpact: 'High',
    whatWouldInvalidate:
      'Reading the actual FY2026-27 PDF and finding a different figure; a mid-year fee schedule revision; choosing the outpatient CPT lane instead, where revenue is per-unit not per-visit.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-10-15',
  },
  {
    id: 'AS-002',
    name: 'Billable visits per clinician per working day',
    value: 8,
    unit: 'visits/day',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      "Ellen's actual current average in pediatric home-health PT: 8 visits across a 9-5 day. This replaces the previous placeholder of 5/day, which was a guess with no evidence behind it.",
    confidence: 'Strong evidence',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'A different geography or caseload mix; a clinician who is not Ellen. This is ONE experienced clinician\'s observed baseline, not an industry standard and not a productivity target for others.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-003',
    name: 'Clinician base salary — experienced pediatric PT, full time',
    value: null,
    unit: 'USD per year',
    kind: 'ASSUMPTION',
    source: 'UNKNOWN — sources disagree by more than $56,000',
    evidenceIds: ['EV-020'],
    whyThisValue:
      'Deliberately left null. Aggregators reported $78,825, $113,401 and $135,278 for overlapping roles. Picking one would be fabrication dressed as analysis.',
    confidence: 'Unknown',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'Primary data: live Colorado job postings (pay ranges are legally required to be disclosed), plus Ellen\'s knowledge of actual market pay.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-10-01',
  },
  {
    id: 'AS-004',
    name: 'Payroll tax and statutory burden on wages',
    value: 0.115,
    unit: 'fraction of wages',
    kind: 'ASSUMPTION',
    source: 'Composed from FICA 7.65% plus FUTA/SUTA/FAMLI estimates',
    evidenceIds: ['EV-018', 'EV-019'],
    whyThisValue:
      'FICA employer share is 7.65% and is firm. The remainder (FUTA, Colorado SUTA at an unknown new-employer rate, FAMLI admin) is estimated at ~3.85%. Under 10 employees the FAMLI employer share does not apply.',
    confidence: 'Reasonable estimate',
    financialImpact: 'High',
    operationalImpact: 'Low',
    whatWouldInvalidate:
      'The actual Colorado new-employer SUTA rate for the relevant NAICS code, which was not established.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-12-15',
  },
  {
    id: 'AS-005',
    name: 'Cancellation / no-show rate',
    value: 0.15,
    unit: 'fraction of scheduled visits',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'Pediatric home visits are cancelled for child illness, family schedule and access problems. 15% is a plausible planning figure with no Colorado-specific evidence behind it.',
    confidence: 'Unknown',
    financialImpact: 'High',
    operationalImpact: 'High',
    whatWouldInvalidate:
      'Ellen\'s observed rate in current practice. This is a high-leverage number: in a flat per-visit reimbursement model, a cancelled visit destroys the revenue but not the travel or salary cost.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-10-01',
  },
  {
    id: 'AS-006',
    name: 'Average travel time between visits',
    value: 15,
    unit: 'minutes',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      "Ellen's observed average drive time between consecutive visits. Replaces the previous 25-minute guess. Combined with a 45-minute visit this produces the 60-minute cycle that makes 8 visits fit an 8-hour day exactly.",
    confidence: 'Strong evidence',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'A wider service radius, a less dense caseload, or worse routing. Travel is the single most sensitive lever in a flat per-visit model: every extra minute of driving comes straight out of capacity.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-007',
    name: 'Documentation time per visit',
    value: 5,
    unit: 'minutes',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      "Ellen's observed documentation time, roughly 5 minutes per visit. Replaces the previous 15-minute guess. Crucially, see AS-015: most of this happens DURING the visit, so it does not lengthen the workday.",
    confidence: 'Strong evidence',
    financialImpact: 'Medium',
    operationalImpact: 'High',
    whatWouldInvalidate:
      'A different EMR, heavier documentation requirements under PAR enforcement, or a clinician who documents after hours. Documentation that moves out of the visit and into the evening is the classic driver of home-health burnout.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-008',
    name: 'Effective collection rate on billed charges',
    value: 0.93,
    unit: 'fraction of billed revenue collected',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: ['EV-004'],
    whyThisValue:
      'Medicaid fee-for-service pays a published rate with no patient balance, so collection should be high. The loss is denials — chiefly authorization and documentation failures, which the PAR regime makes more likely.',
    confidence: 'Unknown',
    financialImpact: 'High',
    operationalImpact: 'High',
    whatWouldInvalidate:
      'Actual denial experience in the first 90 days of billing. This is the number most likely to be optimistic for a new biller.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
  },
  {
    id: 'AS-009',
    name: 'Days from service date to cash received',
    value: 45,
    unit: 'days',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: ['EV-004'],
    whyThisValue:
      'Covers claim submission lag, payer adjudication and payment cycle. Drives the working capital requirement, which is the reason startups with profitable unit economics still fail.',
    confidence: 'Unknown',
    financialImpact: 'Critical',
    operationalImpact: 'Medium',
    whatWouldInvalidate:
      'Actual Health First Colorado remittance timing. Note this excludes the PAR approval delay BEFORE care starts, which lengthens the real cash cycle further.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
  },
  {
    id: 'AS-010',
    name: 'Mileage cost per visit',
    value: 12,
    unit: 'USD per visit',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'Roughly 17 miles round trip at the IRS standard rate. The IRS rate for the current year was NOT verified in this session.',
    confidence: 'Unknown',
    financialImpact: 'Medium',
    operationalImpact: 'Medium',
    whatWouldInvalidate:
      'The current IRS standard mileage rate, plus real route data. Whether Blue Star reimburses mileage at all is a compensation policy decision, not a given.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
  },
  {
    id: 'AS-011',
    name: 'Benefits load (health, retirement, PTO) as fraction of wages',
    value: 0.18,
    unit: 'fraction of wages',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'Placeholder covering employer health contribution, retirement match and paid time off. Highly sensitive to the benefits package actually offered, which is undecided.',
    confidence: 'Unknown',
    financialImpact: 'High',
    operationalImpact: 'High',
    whatWouldInvalidate:
      'Real small-group health insurance quotes in Colorado, and a decision on what benefits Blue Star offers. Benefits are also a retention lever, so this is not purely a cost question.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
  },
  {
    id: 'AS-012',
    name: 'Working days per clinician per year',
    value: 230,
    unit: 'days',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption',
    evidenceIds: [],
    whyThisValue:
      '260 weekdays less roughly 15 days PTO, 8 holidays and 7 days sick/CEU. Reasonable but unverified against any Blue Star policy, which does not exist yet.',
    confidence: 'Reasonable estimate',
    financialImpact: 'High',
    operationalImpact: 'Medium',
    whatWouldInvalidate: 'The PTO policy Blue Star actually adopts.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-12-01',
  },
  {
    id: 'AS-013',
    name: 'Patient-facing visit time',
    value: 45,
    unit: 'minutes',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      'Implied by the observed 60-minute visit cycle less 15 minutes of travel. Previously this was the ONLY scenario input with no assumption record behind it — it was hard-coded at 60 minutes in the model defaults, which both overstated visit length and broke the capacity arithmetic.',
    confidence: 'Strong evidence',
    financialImpact: 'High',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'Longer evaluations, complex patients, or a payer requiring a minimum visit duration. Note that under flat per-visit reimbursement, a longer visit earns no more revenue but consumes capacity.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-014',
    name: 'Clinician workday length',
    value: 8,
    unit: 'hours',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      "Ellen works 9:00am-5:00pm. Previously the 8-hour day was hard-coded as the literal number 480 in two places in the capacity model and could not be changed. It is now an editable input, which is what makes the feasibility guard meaningful.",
    confidence: 'Strong evidence',
    financialImpact: 'High',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'A part-time clinician, a deliberately shorter day as a retention offer, or paid overtime. Raising this is the ONLY legitimate way to justify a higher visit count — see AS-015 and the feasibility guard.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-015',
    name: 'Share of documentation completed during the visit',
    value: 1,
    unit: 'fraction (0 = all after hours, 1 = all during the visit)',
    kind: 'USER_PROVIDED',
    source: "Ellen's current observed workload",
    evidenceIds: ['EV-025'],
    whyThisValue:
      'Ellen reports that MOST documentation is completed during the patient visit rather than as separate end-of-day admin time. Modelled at 1.0 because that is what the stated 60-minute cycle (45 visit + 15 travel) implies arithmetically. This is the hinge of the whole capacity model: at 1.0 the cycle is 60 minutes and 8 visits fit exactly in 8 hours; at 0.0 the cycle becomes 65 minutes and the same 8 visits need 8.7 hours.',
    confidence: 'Reasonable estimate',
    financialImpact: 'Medium',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      '"Most" is not "all", so the true figure is likely slightly below 1.0. Lower this to test how quickly the schedule stops closing — it is the fastest way to see how fragile an 8-visit day really is.',
    lastVerified: '2026-09-18',
    revisitDate: '2027-03-01',
  },
  {
    id: 'AS-016',
    name: 'New clinician productivity relative to Ellen, during ramp',
    value: null,
    unit: 'fraction of Ellen\'s visits/day',
    kind: 'ASSUMPTION',
    source: 'UNKNOWN — deliberately not invented',
    evidenceIds: ['EV-025'],
    whyThisValue:
      'Deliberately left null. Ellen is an experienced pediatric home-health PT with an established caseload and known routes. A newly hired PT will not start at 8 visits/day, but nothing in the available evidence says what they WOULD start at, or how long they take to get there. Picking a number here would silently inflate every multi-clinician revenue projection.',
    confidence: 'Unknown',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      "Ellen's judgement on how long a new pediatric home-health PT takes to reach full caseload, or observed data once the first hire is made. Until then, all multi-clinician scenarios in this system are explicitly labelled as FULL-PRODUCTIVITY UPPER BOUNDS, not forecasts.",
    lastVerified: '2026-09-18',
    revisitDate: '2026-11-01',
  },
];

export const assumptionsById = new Map(assumptions.map((a) => [a.id, a]));

/** Numeric lookup that refuses to silently substitute a value for a null. */
export function assumptionValue(id: string): number | null {
  return assumptionsById.get(id)?.value ?? null;
}
