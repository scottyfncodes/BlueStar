import { describe, it, expect } from 'vitest';
import {
  weightedPatientFacingMinutes, visitMixSensitivity, EI_MIX_LEVELS,
  visitCycle, scheduleFeasibility, viabilityCheck, capacityVolume, annualModel,
  staffingScenarios, type ScenarioInputs,
} from '../model/economics';
import { cashCalendar } from '../model/cash';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';
import { assumptionsById } from '../data/assumptions';
import { evidenceById } from '../data/evidence';

const base: ScenarioInputs = { ...defaultScenario(), clinicianSalary: SALARY_TEST_POINTS[1].value };
const atMix = (ei: number): ScenarioInputs => ({ ...base, eiMixShare: ei });

describe('weighted patient-facing time is derived from the mix', () => {
  it('produces 45 minutes at the observed 50/50 split', () => {
    // 45 must be the RESULT of (0.5 x 60) + (0.5 x 30), never an input.
    expect(weightedPatientFacingMinutes(base)).toBe(45);
  });

  it('produces the pure non-EI length at 0% EI', () => {
    expect(weightedPatientFacingMinutes(atMix(0))).toBe(30);
  });

  it('produces the pure EI length at 100% EI', () => {
    expect(weightedPatientFacingMinutes(atMix(1))).toBe(60);
  });

  it('interpolates linearly between the two visit types', () => {
    expect(weightedPatientFacingMinutes(atMix(0.25))).toBeCloseTo(37.5, 6);
    expect(weightedPatientFacingMinutes(atMix(0.75))).toBeCloseTo(52.5, 6);
  });

  it('treats non-EI share as the automatic complement of EI share', () => {
    for (const r of visitMixSensitivity(base)) {
      expect(r.eiMixShare + r.nonEiMixShare, r.label).toBeCloseTo(1, 9);
    }
  });

  it('clamps the mix share to 0..1', () => {
    expect(weightedPatientFacingMinutes(atMix(5))).toBe(60);
    expect(weightedPatientFacingMinutes(atMix(-2))).toBe(30);
  });

  it('responds to a change in either visit length', () => {
    expect(weightedPatientFacingMinutes({ ...base, eiVisitMinutes: 90 })).toBe(60);
    expect(weightedPatientFacingMinutes({ ...base, nonEiVisitMinutes: 20 })).toBe(40);
  });

  it('feeds the visit cycle rather than a standalone assumption', () => {
    expect(visitCycle(base).patientFacingMinutes).toBe(45);
    expect(visitCycle(atMix(1)).patientFacingMinutes).toBe(60);
  });
});

describe('capacity at the observed baseline', () => {
  it('gives a 60-minute cycle and a ceiling of 8', () => {
    const c = visitCycle(base);
    const f = scheduleFeasibility(base);
    expect(c.cycleMinutes).toBe(60);
    expect(f.maxVisitsPerDay).toBe(8);
  });

  it('closes the 8-visit day exactly, with no overage', () => {
    const f = scheduleFeasibility(base);
    expect(f.minutesRequired).toBe(480);
    expect(f.workdayMinutes).toBe(480);
    expect(f.feasible).toBe(true);
    expect(f.clamped).toBe(false);
  });

  it('leaves break-even below the ceiling', () => {
    const v = viabilityCheck(base);
    expect(v.breakEvenIsAchievable).toBe(true);
    expect(v.breakEvenVisitsPerDay!).toBeLessThan(v.maxFeasibleVisitsPerDay);
    expect(v.headroomVisitsPerDay!).toBeGreaterThan(0);
  });
});

describe('visit mix sensitivity', () => {
  const rows = visitMixSensitivity(base, EI_MIX_LEVELS, 8);

  it('raises the ceiling as the caseload shifts away from EI', () => {
    const byMix = Object.fromEntries(rows.map((r) => [r.eiMixShare, r.maxVisitsPerDay]));
    expect(byMix[0]).toBe(10);
    expect(byMix[0.25]).toBe(9);
    expect(byMix[0.5]).toBe(8);
    expect(byMix[0.75]).toBe(7);
    expect(byMix[1]).toBe(6);
  });

  it('puts the observed 50/50 mix exactly at the edge of an 8-visit day', () => {
    // At 50% EI the day closes precisely; any further shift toward EI breaks it.
    const closes = rows.filter((r) => r.baselineDayCloses).map((r) => r.eiMixShare);
    expect(closes).toEqual([0, 0.25, 0.5]);
    expect(rows.find((r) => r.eiMixShare === 0.5)!.baselineOverageMinutes).toBeCloseTo(0, 6);
  });

  it('makes an all-EI caseload unable to reach break-even', () => {
    // Break-even needs ~6.46 visits/day but only 6 fit in the day.
    const allEi = rows.find((r) => r.eiMixShare === 1)!;
    expect(allEi.capacityVsBreakEven).toBe('Not feasible');
    expect(allEi.breakEvenIsAchievable).toBe(false);
    expect(allEi.operatingProfit!).toBeLessThan(0);
  });

  it('keeps break-even unchanged, because it depends on cost not visit length', () => {
    const values = rows.map((r) => r.breakEvenVisitsPerDay!);
    for (const v of values) expect(v).toBeCloseTo(values[0], 6);
  });

  it('adds capacity headroom rather than revenue below the observed mix', () => {
    // Requested visits/day stays at 8, so a higher ceiling is slack, not income.
    const lighter = rows.filter((r) => r.eiMixShare < 0.5);
    const baseline = rows.find((r) => r.eiMixShare === 0.5)!;
    for (const r of lighter) {
      expect(r.maxVisitsPerDay).toBeGreaterThan(baseline.maxVisitsPerDay);
      expect(r.collectedRevenue).toBeCloseTo(baseline.collectedRevenue, 6);
    }
  });

  it('loses revenue above the observed mix, as the ceiling falls below 8', () => {
    const heavier = rows.filter((r) => r.eiMixShare > 0.5);
    const baseline = rows.find((r) => r.eiMixShare === 0.5)!;
    for (const r of heavier) expect(r.collectedRevenue).toBeLessThan(baseline.collectedRevenue);
  });

  it('matches a direct run of the model at each level', () => {
    for (const r of rows) {
      const inputs = atMix(r.eiMixShare);
      expect(r.cycleMinutes).toBeCloseTo(visitCycle(inputs).cycleMinutes, 9);
      expect(r.maxVisitsPerDay).toBe(scheduleFeasibility(inputs).maxVisitsPerDay);
      expect(r.collectedRevenue).toBeCloseTo(annualModel(inputs).collectedRevenue, 6);
    }
  });
});

describe('mix changes propagate through the single model path', () => {
  it('moves annual volume and revenue', () => {
    const baseline = annualModel(base);
    const allEi = annualModel(atMix(1));
    expect(allEi.completedVisits).toBeLessThan(baseline.completedVisits);
    expect(allEi.collectedRevenue).toBeLessThan(baseline.collectedRevenue);
    expect(allEi.operatingProfit!).toBeLessThan(baseline.operatingProfit!);
  });

  it('moves weekly and monthly capacity', () => {
    const a = capacityVolume(base);
    const b = capacityVolume(atMix(1));
    expect(b.visitsPerWeek).toBeLessThan(a.visitsPerWeek);
    expect(b.visitsPerMonth).toBeLessThan(a.visitsPerMonth);
  });

  it('moves staffing scenarios', () => {
    const baseline = staffingScenarios(base);
    const allEi = staffingScenarios(atMix(1));
    for (const s of allEi) {
      const b = baseline.find((x) => x.id === s.id)!;
      expect(s.visitsPerDay, s.label).toBeLessThan(b.visitsPerDay);
      expect(s.visitsPerDay).toBe(6 * s.clinicianCount);
    }
  });

  it('moves the cash calendar', () => {
    const mk = (ei: number) => cashCalendar({
      scenario: atMix(ei), oneTimeStartup: 5000, monthlyOverhead: 500,
      preRevenueMonths: 4, rampMonths: 6, startingCash: 50000, horizonMonths: 24,
    });
    const a = mk(0.5).months.reduce((t, m) => t + m.cashIn, 0);
    const b = mk(1).months.reduce((t, m) => t + m.cashIn, 0);
    expect(b).toBeLessThan(a);
  });

  it('still lets documentation concurrency propagate independently', () => {
    const a = scheduleFeasibility(base);
    const b = scheduleFeasibility({ ...base, documentationConcurrency: 0.5 });
    expect(b.maxVisitsPerDay).toBeLessThan(a.maxVisitsPerDay);
  });
});

describe('impossible-schedule guard survives the mix change', () => {
  it('12 visits/day earns exactly the feasible ceiling, never more', () => {
    // The guard caps at what FITS the day, not at what was requested. Below
    // 50% EI the ceiling exceeds Ellen's 8, so 12 legitimately clamps to 9 or
    // 10 and earns more — that is real capacity, not fabricated revenue.
    for (const ei of EI_MIX_LEVELS) {
      const f = scheduleFeasibility({ ...atMix(ei), visitsPerDay: 12 });
      const overstated = annualModel({ ...atMix(ei), visitsPerDay: 12 });
      const atCeiling = annualModel({ ...atMix(ei), visitsPerDay: f.maxVisitsPerDay });
      expect(f.effectiveVisitsPerDay, `at ${ei}`).toBe(f.maxVisitsPerDay);
      expect(overstated.collectedRevenue, `at ${ei}`).toBeCloseTo(atCeiling.collectedRevenue, 6);
      expect(overstated.completedVisits).toBeCloseTo(atCeiling.completedVisits, 6);
    }
  });

  it('never lets 12 visits/day exceed what the workday physically allows', () => {
    for (const ei of EI_MIX_LEVELS) {
      const f = scheduleFeasibility({ ...atMix(ei), visitsPerDay: 12 });
      expect(f.effectiveVisitsPerDay * f.cycleMinutes, `at ${ei}`)
        .toBeLessThanOrEqual(f.workdayMinutes);
    }
  });

  it('clamps an all-EI day to its 6-visit ceiling', () => {
    const f = scheduleFeasibility({ ...atMix(1), visitsPerDay: 12 });
    expect(f.effectiveVisitsPerDay).toBe(6);
    expect(f.clamped).toBe(true);
  });
});

describe('provenance for the visit mix', () => {
  it('records visit lengths and mix as Ellen-observed', () => {
    for (const id of ['AS-013', 'AS-018', 'AS-019']) {
      const a = assumptionsById.get(id)!;
      expect(a.kind, id).toBe('USER_PROVIDED');
      expect(a.evidenceIds, id).toContain('EV-027');
    }
    expect(evidenceById.get('EV-027')!.retrieval).toBe('user-reported');
  });

  it('labels the 50/50 mix as approximate rather than settled', () => {
    const mix = assumptionsById.get('AS-019')!;
    expect(mix.confidence).toBe('Reasonable estimate');
    expect(mix.source).toMatch(/approximate/i);
    expect(mix.whyThisValue).toMatch(/APPROXIMATELY/);
  });

  it('exposes the mix on the baseline constant with 45 marked as derived', () => {
    expect(ELLEN_BASELINE.eiMixShare).toBe(0.5);
    expect(ELLEN_BASELINE.eiVisitMinutes).toBe(60);
    expect(ELLEN_BASELINE.nonEiVisitMinutes).toBe(30);
    expect(
      ELLEN_BASELINE.eiVisitMinutes * ELLEN_BASELINE.eiMixShare
        + ELLEN_BASELINE.nonEiVisitMinutes * (1 - ELLEN_BASELINE.eiMixShare),
    ).toBe(ELLEN_BASELINE.patientFacingMinutes);
  });
});
