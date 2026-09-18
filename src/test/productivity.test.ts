import { describe, it, expect } from 'vitest';
import {
  visitCycle, scheduleFeasibility, capacityVolume, staffingScenarios,
  revenueBreakdown, annualModel, loadedClinicianCost, type ScenarioInputs,
} from '../model/economics';
import { defaultScenario, ELLEN_BASELINE } from '../model/defaults';
import { assumptionsById } from '../data/assumptions';
import { evidenceById } from '../data/evidence';

/** Ellen's observed baseline, as reported. */
const ellen: ScenarioInputs = {
  ...defaultScenario(),
  clinicianSalary: 100000,
};

describe("Ellen's observed baseline flows into the model", () => {
  it('defaults to 8 visits/day from AS-002', () => {
    expect(defaultScenario().visitsPerDay).toBe(8);
    expect(assumptionsById.get('AS-002')!.value).toBe(8);
  });

  it('defaults to 45 minutes patient-facing time from AS-013', () => {
    // Previously hard-coded at 60 with no assumption record behind it.
    expect(defaultScenario().visitLengthMinutes).toBe(45);
    expect(assumptionsById.get('AS-013')!.value).toBe(45);
  });

  it('defaults to 15 minutes travel from AS-006', () => {
    expect(defaultScenario().travelMinutesPerVisit).toBe(15);
    expect(assumptionsById.get('AS-006')!.value).toBe(15);
  });

  it('defaults to 5 minutes documentation from AS-007', () => {
    expect(defaultScenario().documentationMinutesPerVisit).toBe(5);
    expect(assumptionsById.get('AS-007')!.value).toBe(5);
  });

  it('defaults to an 8-hour workday from AS-014', () => {
    // Previously the literal 480, hard-coded in two places and uneditable.
    expect(defaultScenario().workdayHours).toBe(8);
    expect(assumptionsById.get('AS-014')!.value).toBe(8);
  });

  it("labels the productivity assumptions as Ellen's, not industry benchmarks", () => {
    for (const id of ['AS-002', 'AS-006', 'AS-007', 'AS-013', 'AS-014']) {
      const a = assumptionsById.get(id)!;
      expect(a.kind, `${id} kind`).toBe('USER_PROVIDED');
      expect(a.source, `${id} source`).toBe("Ellen's current observed workload");
      expect(a.evidenceIds, `${id} evidence`).toContain('EV-025');
    }
  });

  it('marks documentation concurrency as a MODELLING assumption, not observed behaviour', () => {
    // Ellen said "most", not "all". The 100% figure is a modelling convenience
    // and must not inherit the authority of her first-hand report.
    const a = assumptionsById.get('AS-015')!;
    expect(a.kind).toBe('ASSUMPTION');
    expect(a.confidence).toBe('Unverified');
    expect(a.source).toMatch(/MODELLING ASSUMPTION/);
    expect(a.evidenceIds).toContain('EV-025');
  });

  it('records the baseline as first-hand, not external research', () => {
    const e = evidenceById.get('EV-025')!;
    expect(e.retrieval).toBe('user-reported');
    // Must not be dressed up as an industry standard.
    expect(e.notes).toMatch(/NOT an industry productivity standard/i);
  });

  it('keeps the baseline constant separate from the editable model inputs', () => {
    expect(ELLEN_BASELINE.visitsPerDay).toBe(8);
    expect(ELLEN_BASELINE.cycleMinutes).toBe(60);
    expect(ELLEN_BASELINE.caveat).toMatch(/not an industry productivity standard/i);
  });
});

describe('visit cycle arithmetic', () => {
  it('is 60 minutes at the baseline: 45 patient-facing + 15 travel', () => {
    const c = visitCycle(ellen);
    expect(c.patientFacingMinutes).toBe(45);
    expect(c.travelMinutes).toBe(15);
    expect(c.cycleMinutes).toBe(60);
  });

  it('absorbs documentation into the visit when it is done concurrently', () => {
    // This is WHY 8 visits fit an 8-hour day.
    const c = visitCycle(ellen);
    expect(c.concurrentDocumentationMinutes).toBe(5);
    expect(c.additionalDocumentationMinutes).toBe(0);
  });

  it('extends the cycle when documentation moves to after the visit', () => {
    const c = visitCycle({ ...ellen, documentationConcurrency: 0 });
    expect(c.additionalDocumentationMinutes).toBe(5);
    expect(c.cycleMinutes).toBe(65);
  });

  it('handles partial concurrency', () => {
    const c = visitCycle({ ...ellen, documentationConcurrency: 0.6 });
    expect(c.concurrentDocumentationMinutes).toBeCloseTo(3, 6);
    expect(c.additionalDocumentationMinutes).toBeCloseTo(2, 6);
    expect(c.cycleMinutes).toBeCloseTo(62, 6);
  });

  it('clamps concurrency to the 0..1 range', () => {
    expect(visitCycle({ ...ellen, documentationConcurrency: 5 }).additionalDocumentationMinutes).toBe(0);
    expect(visitCycle({ ...ellen, documentationConcurrency: -3 }).additionalDocumentationMinutes).toBe(5);
  });
});

describe('capacity sanity check — 8 visits in a 9-to-5 day', () => {
  it('fits exactly: 8 x 60 minutes = 480 minutes = 8 hours', () => {
    const f = scheduleFeasibility(ellen);
    expect(f.cycleMinutes).toBe(60);
    expect(f.workdayMinutes).toBe(480);
    expect(f.minutesRequired).toBe(480);
    expect(f.maxVisitsPerDay).toBe(8);
    expect(f.feasible).toBe(true);
    expect(f.clamped).toBe(false);
  });

  it('stops fitting if documentation moves to end of day', () => {
    // 65-minute cycle => 8 visits needs 520 minutes, only 7 fit.
    const f = scheduleFeasibility({ ...ellen, documentationConcurrency: 0 });
    expect(f.maxVisitsPerDay).toBe(7);
    expect(f.clamped).toBe(true);
    expect(f.effectiveVisitsPerDay).toBe(7);
  });

  it('loses capacity as travel time grows', () => {
    expect(scheduleFeasibility({ ...ellen, travelMinutesPerVisit: 30 }).maxVisitsPerDay).toBe(6);
    expect(scheduleFeasibility({ ...ellen, travelMinutesPerVisit: 45 }).maxVisitsPerDay).toBe(5);
  });
});

describe('impossible schedules are refused, not priced', () => {
  it('caps 12 one-hour cycles in an 8-hour day at 8', () => {
    const f = scheduleFeasibility({ ...ellen, visitsPerDay: 12 });
    expect(f.requestedVisitsPerDay).toBe(12);
    expect(f.effectiveVisitsPerDay).toBe(8);
    expect(f.clamped).toBe(true);
    expect(f.explanation).toMatch(/Capped at 8/);
  });

  it('does not book revenue against the impossible visits', () => {
    // The core guard: 12 visits/day must not out-earn 8 visits/day.
    const eight = annualModel(ellen);
    const twelve = annualModel({ ...ellen, visitsPerDay: 12 });
    expect(twelve.completedVisits).toBeCloseTo(eight.completedVisits, 6);
    expect(twelve.grossRevenue).toBeCloseTo(eight.grossRevenue, 6);
  });

  it('does not let an impossible schedule flatter cost per visit', () => {
    const eight = loadedClinicianCost(ellen)!;
    const twelve = loadedClinicianCost({ ...ellen, visitsPerDay: 12 })!;
    expect(twelve.costPerCompletedVisit).toBeCloseTo(eight.costPerCompletedVisit!, 6);
  });

  it('allows a higher visit count ONLY when the workday is explicitly lengthened', () => {
    // The legitimate escape hatch: an explicit decision about someone's day.
    const f = scheduleFeasibility({ ...ellen, visitsPerDay: 10, workdayHours: 10 });
    expect(f.effectiveVisitsPerDay).toBe(10);
    expect(f.clamped).toBe(false);
    expect(annualModel({ ...ellen, visitsPerDay: 10, workdayHours: 10 }).grossRevenue)
      .toBeGreaterThan(annualModel(ellen).grossRevenue);
  });

  it('a shorter workday reduces capacity', () => {
    const f = scheduleFeasibility({ ...ellen, workdayHours: 4 });
    expect(f.maxVisitsPerDay).toBe(4);
    expect(f.effectiveVisitsPerDay).toBe(4);
  });
});

describe('visit volume per day / week / month', () => {
  it('derives working days per week from the existing annual assumption', () => {
    // 230 working days/year is already net of PTO and holidays, so the weekly
    // average sits below a nominal 5-day week. Not a separately invented number.
    const v = capacityVolume(ellen);
    expect(v.workingDaysPerWeek).toBeCloseTo(230 / 52, 6);
    expect(v.workingDaysPerWeek).toBeLessThan(5);
  });

  it('scales day to week to month to year consistently', () => {
    const v = capacityVolume(ellen);
    expect(v.visitsPerDay).toBe(8);
    expect(v.visitsPerWeek).toBeCloseTo(8 * (230 / 52), 6);
    expect(v.visitsPerYear).toBe(8 * 230);
    expect(v.visitsPerMonth).toBeCloseTo((8 * 230) / 12, 6);
  });

  it('separates patient-facing, travel and documentation hours', () => {
    const v = capacityVolume(ellen);
    const weeks = 230 / 52;
    expect(v.patientFacingHoursPerWeek).toBeCloseTo((8 * weeks * 45) / 60, 6);
    expect(v.travelHoursPerWeek).toBeCloseTo((8 * weeks * 15) / 60, 6);
    expect(v.documentationHoursPerWeek).toBeCloseTo((8 * weeks * 5) / 60, 6);
  });

  it('nets out cancellations for completed visits', () => {
    const v = capacityVolume(ellen);
    expect(v.completedVisitsPerYear).toBeCloseTo(8 * 230 * 0.85, 6);
  });
});

describe('revenue is decomposed, not just visits x rate', () => {
  it('never equals a naive visits x reimbursement figure', () => {
    const r = revenueBreakdown(ellen);
    const naive = 8 * 230 * ellen.reimbursementPerVisit;
    // Cancellations and collection losses both sit between the two.
    expect(r.grossClinicalRevenue).toBeLessThan(naive);
    expect(r.collectedRevenue).toBeLessThan(r.grossClinicalRevenue);
  });

  it('shows what is left for overhead and margin after clinical delivery', () => {
    const r = revenueBreakdown(ellen);
    expect(r.remainingForOverheadAndMargin).toBeCloseTo(
      r.collectedRevenue - r.clinicianCompensation! - r.mileage, 6,
    );
    expect(r.operatingMargin).toBeCloseTo(r.remainingForOverheadAndMargin! - r.overhead, 6);
  });

  it('reports nulls rather than zeros when salary is unknown', () => {
    const r = revenueBreakdown({ ...ellen, clinicianSalary: null });
    expect(r.clinicianCompensation).toBeNull();
    expect(r.remainingForOverheadAndMargin).toBeNull();
    expect(r.operatingMargin).toBeNull();
    expect(r.collectedRevenue).toBeGreaterThan(0);
  });
});

describe('staffing scenarios', () => {
  const scenarios = staffingScenarios(ellen);

  it('covers Ellen only through PT/OT/ST expansion', () => {
    expect(scenarios.map((s) => s.label)).toEqual([
      'Ellen only', 'Ellen + 1 PT', 'Ellen + 2 PTs', '3 PTs', '5 PTs',
      'PT / OT / ST expansion (6 clinicians)',
    ]);
  });

  it('scales visit capacity linearly with clinician count', () => {
    const solo = scenarios.find((s) => s.label === 'Ellen only')!;
    const five = scenarios.find((s) => s.label === '5 PTs')!;
    expect(solo.visitsPerDay).toBe(8);
    expect(five.visitsPerDay).toBe(40);
    expect(five.visitsPerWeek).toBeCloseTo(solo.visitsPerWeek * 5, 6);
    expect(five.visitsPerMonth).toBeCloseTo(solo.visitsPerMonth * 5, 6);
  });

  it('scales revenue and clinician cost with headcount', () => {
    const solo = scenarios.find((s) => s.label === 'Ellen only')!;
    const three = scenarios.find((s) => s.label === '3 PTs')!;
    expect(three.collectedRevenue).toBeCloseTo(solo.collectedRevenue * 3, 4);
    expect(three.clinicianCost!).toBeCloseTo(solo.clinicianCost! * 3, 4);
  });

  it('holds overhead flat as headcount grows, so margin can leverage', () => {
    const solo = scenarios.find((s) => s.label === 'Ellen only')!;
    const five = scenarios.find((s) => s.label === '5 PTs')!;
    expect(five.overhead).toBeCloseTo(solo.overhead, 6);
  });

  it('reports travel and documentation burden per scenario', () => {
    const five = scenarios.find((s) => s.label === '5 PTs')!;
    expect(five.travelHoursPerWeek).toBeGreaterThan(0);
    expect(five.documentationHoursPerWeek).toBeGreaterThan(0);
    expect(five.patientFacingHoursPerWeek).toBeGreaterThan(five.travelHoursPerWeek);
  });

  it('uses the same productivity assumptions, so changing the cycle moves every scenario', () => {
    const slower = staffingScenarios({ ...ellen, travelMinutesPerVisit: 45 });
    for (const s of slower) {
      const baseline = scenarios.find((x) => x.id === s.id)!;
      expect(s.visitsPerDay).toBeLessThan(baseline.visitsPerDay);
    }
  });

  it('leaves the new-clinician ramp assumption explicitly unknown', () => {
    // These scenarios are upper bounds. AS-016 must stay null rather than
    // silently assuming every hire performs like Ellen from day one.
    const ramp = assumptionsById.get('AS-016')!;
    expect(ramp.value).toBeNull();
    expect(ramp.confidence).toBe('Unknown');
    expect(ramp.financialImpact).toBe('Critical');
  });
});
