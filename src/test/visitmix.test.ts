import { describe, it, expect } from 'vitest';
import {
  weightedPatientFacingMinutes, visitMixSensitivity, EI_MIX_LEVELS,
  visitCycle, scheduleFeasibility, viabilityCheck, capacityVolume, annualModel,
  staffingScenarios, type ScenarioInputs,
} from '../model/economics';
import { cashCalendar } from '../model/cash';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';
import { assumptionsById } from '../data/assumptions';
import { caseloadComposition } from '../model/caseload';
import { evidenceById } from '../data/evidence';

const base: ScenarioInputs = { ...defaultScenario(), clinicianSalary: SALARY_TEST_POINTS[1].value };
const atMix = (ei: number): ScenarioInputs => ({ ...base, eiMixShare: ei });

describe('weighted patient-facing time is derived from the mix', () => {
  it('produces 40 minutes at the observed ~33% EI visit share', () => {
    // 40 must be the RESULT of (1/3 x 60) + (2/3 x 30), never an input.
    expect(weightedPatientFacingMinutes(base)).toBeCloseTo(40, 6);
    expect(weightedPatientFacingMinutes(atMix(0.5))).toBe(45);
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
    expect(weightedPatientFacingMinutes({ ...base, eiVisitMinutes: 90 })).toBeCloseTo(50, 6);
    expect(weightedPatientFacingMinutes({ ...base, nonEiVisitMinutes: 15 })).toBeCloseTo(30, 6);
  });

  it('feeds the visit cycle rather than a standalone assumption', () => {
    expect(visitCycle(base).patientFacingMinutes).toBeCloseTo(40, 6);
    expect(visitCycle(atMix(1)).patientFacingMinutes).toBe(60);
  });
});

describe('capacity at the observed baseline', () => {
  it('gives a 55-minute cycle and a ceiling of 8', () => {
    const c = visitCycle(base);
    const f = scheduleFeasibility(base);
    expect(c.cycleMinutes).toBeCloseTo(55, 6);
    expect(f.maxVisitsPerDay).toBe(8);
  });

  it('closes the 8-visit day with 40 minutes to spare', () => {
    const f = scheduleFeasibility(base);
    expect(f.minutesRequired).toBeCloseTo(440, 6);
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
    const at = (m: number) => rows.find((r) => Math.abs(r.eiMixShare - m) < 1e-9)!.maxVisitsPerDay;
    expect(at(0)).toBe(10);
    expect(at(0.25)).toBe(9);
    expect(at(1 / 3)).toBe(8);
    expect(at(0.5)).toBe(8);
    expect(at(0.75)).toBe(7);
    expect(at(1)).toBe(6);
  });

  it('closes an 8-visit day up to and including a 50% EI share', () => {
    // 50% is the last level that fits; beyond it the day breaks.
    const closes = rows.filter((r) => r.baselineDayCloses).map((r) => r.eiMixShare);
    expect(closes).toEqual([0, 0.25, 1 / 3, 0.5]);
    expect(rows.find((r) => r.eiMixShare === 0.5)!.baselineOverageMinutes).toBeCloseTo(0, 6);
  });

  it("leaves slack at Ellen's observed share, unlike the earlier 50/50 estimate", () => {
    const observed = rows.find((r) => r.eiMixShare === 1 / 3)!;
    const fiftyFifty = rows.find((r) => r.eiMixShare === 0.5)!;
    expect(observed.cycleMinutes).toBeCloseTo(55, 6);
    expect(observed.baselineMinutesRequired).toBeLessThan(fiftyFifty.baselineMinutesRequired);
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
    const baseline = rows.find((r) => r.eiMixShare === 0.5)!;
    for (const r of rows.filter((x) => x.eiMixShare < 1 / 3)) {
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
    // At a 50% EI mix the cycle is 60 min, where concurrency still binds.
    const a = scheduleFeasibility(atMix(0.5));
    const b = scheduleFeasibility({ ...atMix(0.5), documentationConcurrency: 0.5 });
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
      // Visit lengths trace to EV-027; the mix is now measured in EV-030.
      const refs = a.evidenceIds.map((e) => evidenceById.get(e)!);
      expect(refs.some((r) => r.retrieval === 'user-reported'), id).toBe(true);
    }
    expect(evidenceById.get('EV-027')!.retrieval).toBe('user-reported');
    expect(evidenceById.get('EV-030')!.retrieval).toBe('user-reported');
  });

  it('upgrades the mix from an estimate to a measurement', () => {
    // It was 50/50 and "Reasonable estimate"; the caseload cohorts measure it.
    const mix = assumptionsById.get('AS-019')!;
    expect(mix.confidence).toBe('Strong evidence');
    expect(mix.kind).toBe('USER_PROVIDED');
    expect(mix.value!).toBeCloseTo(1 / 3, 9);
    expect(mix.whyThisValue).toMatch(/DERIVED/);
  });

  it('keeps the visit share and the patient share as separate assumptions', () => {
    const visitShare = assumptionsById.get('AS-019')!.value!;
    const patientShare = assumptionsById.get('AS-031')!.value!;
    expect(visitShare).not.toBeCloseTo(patientShare, 3);
    expect(assumptionsById.get('AS-031')!.whyThisValue).toMatch(/separate assumption from AS-019/);
  });

  it('exposes the mix on the baseline constant with duration marked as derived', () => {
    expect(ELLEN_BASELINE.eiMixShare).toBeCloseTo(1 / 3, 9);
    expect(ELLEN_BASELINE.eiVisitMinutes).toBe(60);
    expect(ELLEN_BASELINE.nonEiVisitMinutes).toBe(30);
    expect(
      ELLEN_BASELINE.eiVisitMinutes * ELLEN_BASELINE.eiMixShare
        + ELLEN_BASELINE.nonEiVisitMinutes * (1 - ELLEN_BASELINE.eiMixShare),
    ).toBeCloseTo(ELLEN_BASELINE.patientFacingMinutes, 9);
  });
});

describe('observed caseload composition', () => {
  const c = caseloadComposition();

  it('sums the cohorts Ellen reported', () => {
    expect(c.totalPatients).toBe(25);
    expect(c.totalVisitsPerWeek).toBe(33);
    expect(c.totalPatientFacingMinutesPerWeek).toBe(1320);
  });

  it('derives the weighted visit length', () => {
    expect(c.weightedVisitMinutes).toBeCloseTo(40, 9);
  });

  it('separates the EI visit share from the EI patient share', () => {
    // 11 of 33 visits, but 11 of 25 patients. The gap exists because EI
    // children are seen weekly and some non-EI children twice weekly.
    expect(c.eiVisitShare).toBeCloseTo(11 / 33, 9);
    expect(c.eiPatientShare).toBeCloseTo(11 / 25, 9);
    expect(c.eiVisitShare).toBeLessThan(c.eiPatientShare);
  });

  it('derives per-type visit frequency', () => {
    expect(c.eiVisitsPerPatientPerWeek).toBeCloseTo(1, 9);
    expect(c.nonEiVisitsPerPatientPerWeek).toBeCloseTo(22 / 14, 9);
    expect(c.nonEiVisitsPerPatientPerWeek).toBeGreaterThan(c.eiVisitsPerPatientPerWeek);
  });

  it('accounts for every patient and visit across the cohorts', () => {
    expect(c.cohorts.reduce((a, x) => a + x.patients, 0)).toBe(c.totalPatients);
    expect(c.cohorts.reduce((a, x) => a + x.visitsPerWeek, 0)).toBe(c.totalVisitsPerWeek);
    expect(c.cohorts.reduce((a, x) => a + x.shareOfVisits, 0)).toBeCloseTo(1, 9);
    expect(c.eiPatients + c.nonEiPatients).toBe(c.totalPatients);
  });

  it('reports the unreconciled gap against the stated totals', () => {
    // Cohorts sum to 25 patients / 33 visits; Ellen stated 23 / 32.
    expect(c.reconciles).toBe(false);
    expect(c.patientCountGap).toBe(2);
    expect(c.visitCountGap).toBe(1);
  });

  it('recomputes cleanly for a hypothetical caseload', () => {
    const alt = caseloadComposition([
      { id: 'X', label: 'All EI', patients: 10, visitsPerPatientPerWeek: 2, visitMinutes: 60, isEarlyIntervention: true },
    ]);
    expect(alt.totalVisitsPerWeek).toBe(20);
    expect(alt.eiVisitShare).toBe(1);
    expect(alt.eiPatientShare).toBe(1);
    expect(alt.weightedVisitMinutes).toBe(60);
    expect(alt.nonEiVisitsPerPatientPerWeek).toBe(0);
  });
});
