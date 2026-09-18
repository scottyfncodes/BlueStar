import { describe, it, expect } from 'vitest';
import {
  documentationSensitivity, concurrencyThreshold, CONCURRENCY_LEVELS,
  visitCycle, scheduleFeasibility, capacityVolume, annualModel,
  staffingScenarios, type ScenarioInputs,
} from '../model/economics';
import { cashCalendar } from '../model/cash';
import { defaultScenario, SALARY_TEST_POINTS } from '../model/defaults';

const base: ScenarioInputs = {
  ...defaultScenario(),
  clinicianSalary: SALARY_TEST_POINTS[1].value,
};

const at = (c: number): ScenarioInputs => ({ ...base, documentationConcurrency: c });

describe('documentation concurrency — effective visit cycle', () => {
  it('adds no schedule time at 100%', () => {
    const c = visitCycle(at(1));
    expect(c.additionalDocumentationMinutes).toBe(0);
    expect(c.cycleMinutes).toBe(60);
  });

  it('adds the non-concurrent share progressively', () => {
    // 5 minutes of documentation, so each 25% drop adds 1.25 minutes.
    expect(visitCycle(at(0.75)).cycleMinutes).toBeCloseTo(61.25, 6);
    expect(visitCycle(at(0.5)).cycleMinutes).toBeCloseTo(62.5, 6);
    expect(visitCycle(at(0.25)).cycleMinutes).toBeCloseTo(63.75, 6);
    expect(visitCycle(at(0)).cycleMinutes).toBeCloseTo(65, 6);
  });

  it('splits documentation into concurrent and additional at every level', () => {
    for (const c of CONCURRENCY_LEVELS) {
      const cy = visitCycle(at(c));
      expect(cy.concurrentDocumentationMinutes + cy.additionalDocumentationMinutes)
        .toBeCloseTo(base.documentationMinutesPerVisit, 6);
    }
  });
});

describe('the 8-visit day diagnostic', () => {
  const rows = documentationSensitivity(base, CONCURRENCY_LEVELS, 8);

  it('closes ONLY at 100% concurrency', () => {
    // The headline result: 8 x 60 = 480 against a 480-minute day is exact,
    // so the schedule has zero slack to absorb any spillover at all.
    const closes = rows.filter((r) => r.baselineDayCloses).map((r) => r.concurrency);
    expect(closes).toEqual([1]);
  });

  it('reports total modelled time, available time and overage', () => {
    const full = rows.find((r) => r.concurrency === 1)!;
    expect(full.baselineMinutesRequired).toBe(480);
    expect(full.workdayMinutes).toBe(480);
    expect(full.baselineOverageMinutes).toBe(0);

    const zero = rows.find((r) => r.concurrency === 0)!;
    expect(zero.baselineMinutesRequired).toBe(520);
    expect(zero.baselineOverageMinutes).toBe(40);
  });

  it('never reports negative overage', () => {
    for (const r of rows) expect(r.baselineOverageMinutes).toBeGreaterThanOrEqual(0);
  });

  it('drops the ceiling from 8 to 7 the moment concurrency slips below 100%', () => {
    expect(scheduleFeasibility(at(1)).maxVisitsPerDay).toBe(8);
    expect(scheduleFeasibility(at(0.99)).maxVisitsPerDay).toBe(7);
  });

  it('holds the ceiling at 7 all the way down to 0%', () => {
    // A cliff, not a slope: floor() keeps 7 until the cycle passes 68.57 min,
    // which 5 minutes of documentation can never reach.
    for (const c of [0.75, 0.5, 0.25, 0]) {
      expect(scheduleFeasibility(at(c)).maxVisitsPerDay, `at ${c}`).toBe(7);
    }
  });
});

describe('the concurrency threshold, computed from the model', () => {
  const t = concurrencyThreshold(base, 8)!;

  it('finds the crossing point at 100%', () => {
    expect(t.closesAtFullConcurrency).toBe(true);
    expect(t.closesAtZeroConcurrency).toBe(false);
    expect(t.threshold).toBeCloseTo(1, 6);
  });

  it('agrees with a direct feasibility check either side of the threshold', () => {
    const closes = (c: number) =>
      8 * visitCycle(at(c)).cycleMinutes <= scheduleFeasibility(at(c)).workdayMinutes;
    expect(closes(t.threshold)).toBe(true);
    expect(closes(t.threshold - 1e-6)).toBe(false);
  });

  it('returns null when the day closes at every level', () => {
    // A shorter visit gives real slack, so there is no crossing to find.
    expect(concurrencyThreshold({ ...base, visitLengthMinutes: 30 }, 8)).toBeNull();
  });

  it('moves when the workday lengthens', () => {
    // A 9-hour day absorbs all spillover, so 8 visits close everywhere.
    expect(concurrencyThreshold({ ...base, workdayHours: 9 }, 8)).toBeNull();
  });
});

describe('break-even versus capacity at each level', () => {
  const rows = documentationSensitivity(base, CONCURRENCY_LEVELS, 8);

  it('uses factual labels with no ranking or scoring', () => {
    const allowed = [
      'Capacity exceeds break-even requirement', 'Exactly at capacity',
      'Not feasible', 'Unknown',
    ];
    for (const r of rows) expect(allowed).toContain(r.capacityVsBreakEven);
  });

  it('keeps break-even unchanged, because it depends on cost not cycle time', () => {
    const values = rows.map((r) => r.breakEvenVisitsPerDay!);
    for (const v of values) expect(v).toBeCloseTo(values[0], 6);
  });

  it('remains achievable at every level, but with less headroom', () => {
    for (const r of rows) {
      expect(r.breakEvenIsAchievable, `at ${r.label}`).toBe(true);
      expect(r.capacityVsBreakEven).toBe('Capacity exceeds break-even requirement');
    }
    const full = rows.find((r) => r.concurrency === 1)!;
    const zero = rows.find((r) => r.concurrency === 0)!;
    expect(full.maxVisitsPerDay - full.breakEvenVisitsPerDay!)
      .toBeGreaterThan(zero.maxVisitsPerDay - zero.breakEvenVisitsPerDay!);
  });

  it('reports Not feasible when capacity falls below break-even', () => {
    const rough = documentationSensitivity({ ...base, travelMinutesPerVisit: 45 }, [0], 8);
    expect(rough[0].capacityVsBreakEven).toBe('Not feasible');
    expect(rough[0].breakEvenIsAchievable).toBe(false);
  });
});

describe('downstream models respect feasible capacity at every level', () => {
  it('revenue falls at the cliff and then stays flat', () => {
    const rows = documentationSensitivity(base, CONCURRENCY_LEVELS, 8);
    const full = rows.find((r) => r.concurrency === 1)!;
    const rest = rows.filter((r) => r.concurrency < 1);
    for (const r of rest) {
      expect(r.collectedRevenue).toBeLessThan(full.collectedRevenue);
      expect(r.collectedRevenue).toBeCloseTo(rest[0].collectedRevenue, 6);
    }
  });

  it('annual volume uses the clamped ceiling, not the requested 8', () => {
    for (const c of [0.75, 0.5, 0.25, 0]) {
      expect(capacityVolume(at(c)).visitsPerDay, `at ${c}`).toBe(7);
      expect(annualModel(at(c)).completedVisits).toBeCloseTo(7 * 230 * 0.85, 6);
    }
  });

  it('staffing scenarios inherit the reduced ceiling', () => {
    const full = staffingScenarios(at(1));
    const reduced = staffingScenarios(at(0.5));
    for (const s of reduced) {
      const f = full.find((x) => x.id === s.id)!;
      expect(s.visitsPerDay, s.label).toBeLessThan(f.visitsPerDay);
      expect(s.visitsPerDay).toBe(7 * s.clinicianCount);
    }
  });

  it('the cash calendar inherits the reduced ceiling', () => {
    const mk = (c: number) => cashCalendar({
      scenario: at(c), oneTimeStartup: 5000, monthlyOverhead: 500,
      preRevenueMonths: 4, rampMonths: 6, startingCash: 50000, horizonMonths: 24,
    });
    const fullCash = mk(1).months.reduce((a, m) => a + m.cashIn, 0);
    const reducedCash = mk(0).months.reduce((a, m) => a + m.cashIn, 0);
    expect(reducedCash).toBeLessThan(fullCash);
  });
});

describe('impossible schedules stay impossible at every concurrency level', () => {
  it('12 visits/day never out-earns the feasible ceiling', () => {
    // The Run 5 regression, re-verified across the whole sensitivity range.
    for (const c of CONCURRENCY_LEVELS) {
      const ceiling = annualModel(at(c));
      const overstated = annualModel({ ...at(c), visitsPerDay: 12 });
      expect(overstated.grossRevenue, `at ${c}`).toBeCloseTo(ceiling.grossRevenue, 6);
      expect(overstated.completedVisits).toBeCloseTo(ceiling.completedVisits, 6);
    }
  });

  it('flags the clamp rather than applying it silently', () => {
    for (const c of CONCURRENCY_LEVELS) {
      const f = scheduleFeasibility({ ...at(c), visitsPerDay: 12 });
      expect(f.clamped, `at ${c}`).toBe(true);
      expect(f.requestedVisitsPerDay).toBe(12);
      expect(f.effectiveVisitsPerDay).toBe(f.maxVisitsPerDay);
      expect(f.explanation).toMatch(/Capped at/);
    }
  });

  it('still allows a longer workday as the explicit escape hatch', () => {
    // 65-minute cycle at 0% concurrency; a 9-hour day fits 8 visits again.
    const f = scheduleFeasibility({ ...at(0), workdayHours: 9 });
    expect(f.maxVisitsPerDay).toBe(8);
    expect(f.effectiveVisitsPerDay).toBe(8);
    expect(f.clamped).toBe(false);
  });
});

describe('sensitivity rows come from the real pipeline', () => {
  it('matches a direct run of the model at each level', () => {
    // Guards against a second, simplified formula drifting from the real one.
    for (const r of documentationSensitivity(base, CONCURRENCY_LEVELS, 8)) {
      const inputs = at(r.concurrency);
      expect(r.cycleMinutes).toBeCloseTo(visitCycle(inputs).cycleMinutes, 9);
      expect(r.maxVisitsPerDay).toBe(scheduleFeasibility(inputs).maxVisitsPerDay);
      expect(r.collectedRevenue).toBeCloseTo(annualModel(inputs).collectedRevenue, 6);
      expect(r.completedVisitsPerYear).toBeCloseTo(capacityVolume(inputs).completedVisitsPerYear, 6);
    }
  });

  it('covers the five requested levels in order', () => {
    expect(documentationSensitivity(base).map((r) => r.label))
      .toEqual(['100%', '75%', '50%', '25%', '0%']);
  });
});
