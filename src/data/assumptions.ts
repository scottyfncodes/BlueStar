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
    value: 5,
    unit: 'visits/day',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'A placeholder mid-point for a home-based pediatric caseload with travel between homes. Chosen so the model runs, not because evidence supports it.',
    confidence: 'Unknown',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'Ellen\'s direct experience of realistic daily caseload in Denver-metro pediatric home health. She is the authoritative source and has not been asked.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-10-01',
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
    name: 'Average one-way travel time between visits',
    value: 25,
    unit: 'minutes',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'Denver-metro driving between homes. Drives the visits-per-day ceiling, which under a flat per-visit rate is the primary determinant of profitability.',
    confidence: 'Unknown',
    financialImpact: 'Critical',
    operationalImpact: 'Critical',
    whatWouldInvalidate:
      'Actual routing data once a caseload exists. Until then, test the model across a 15/25/40 minute band rather than trusting a point estimate.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
  },
  {
    id: 'AS-007',
    name: 'Documentation time per visit',
    value: 15,
    unit: 'minutes',
    kind: 'ASSUMPTION',
    source: 'Modelling assumption — NOT researched',
    evidenceIds: [],
    whyThisValue:
      'Point-of-care documentation in the home versus catching up in the evening is one of the largest drivers of clinician burnout in home health. Modelled explicitly so its cost is visible.',
    confidence: 'Unknown',
    financialImpact: 'Medium',
    operationalImpact: 'High',
    whatWouldInvalidate: 'Ellen\'s experience; EMR selection materially changes this.',
    lastVerified: '2026-09-17',
    revisitDate: '2026-11-01',
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
];

export const assumptionsById = new Map(assumptions.map((a) => [a.id, a]));

/** Numeric lookup that refuses to silently substitute a value for a null. */
export function assumptionValue(id: string): number | null {
  return assumptionsById.get(id)?.value ?? null;
}
