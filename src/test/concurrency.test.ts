import { describe, it, expect } from 'vitest';
import {
  documentationSensitivity, concurrencyThreshold, CONCURRENCY_LEVELS,
  visitCycle, scheduleFeasibility, capacityVolume, annualModel,
  staffingScenarios, type ScenarioInputs,
} from '../model/economics';
import { viabilityCheck } from '../model/economics';
import { cashCalendar } from '../model/cash';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';
import { assumptions, assumptionsById } from '../data/assumptions';
import { evidence } from '../data/evidence';

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

  it('adds only the share that is neither absorbed nor after-hours', () => {
    // After-hours stays at Ellen's observed 10%, so a drop in in-workday
    // documentation is what pushes minutes into the clinical schedule.
    expect(visitCycle(at(0.9)).cycleMinutes).toBeCloseTo(60, 6);
    expect(visitCycle(at(0.75)).cycleMinutes).toBeCloseTo(60.75, 6);
    expect(visitCycle(at(0.5)).cycleMinutes).toBeCloseTo(62, 6);
    expect(visitCycle(at(0.25)).cycleMinutes).toBeCloseTo(63.25, 6);
    expect(visitCycle(at(0)).cycleMinutes).toBeCloseTo(64.5, 6);
  });

  it('accounts for every documented minute across the three buckets', () => {
    for (const c of CONCURRENCY_LEVELS) {
      const cy = visitCycle(at(c));
      expect(
        cy.concurrentDocumentationMinutes + cy.afterHoursDocumentationMinutes
          + cy.additionalDocumentationMinutes,
        `at ${c}`,
      ).toBeCloseTo(base.documentationMinutesPerVisit, 6);
    }
  });
});

describe('the 8-visit day diagnostic', () => {
  const rows = documentationSensitivity(base, CONCURRENCY_LEVELS, 8);

  it("closes at Ellen's observed 90%, because the other 10% happens at home", () => {
    // Run 6 concluded the day closed only at 100%. With the real three-way
    // split the 10% never enters the clinical schedule, so 90% closes too.
    const closes = rows.filter((r) => r.baselineDayCloses).map((r) => r.concurrency);
    expect(closes).toEqual([1, 0.9]);
    expect(rows.find((r) => r.concurrency === 0.9)!.baselineOverageMinutes).toBeCloseTo(0, 6);
  });

  it('reports total modelled time, available time and overage', () => {
    const full = rows.find((r) => r.concurrency === 1)!;
    expect(full.baselineMinutesRequired).toBe(480);
    expect(full.workdayMinutes).toBe(480);
    expect(full.baselineOverageMinutes).toBe(0);

    const ellen = rows.find((r) => r.concurrency === 0.9)!;
    expect(ellen.baselineMinutesRequired).toBeCloseTo(480, 6);
    expect(ellen.baselineOverageMinutes).toBeCloseTo(0, 6);

    const zero = rows.find((r) => r.concurrency === 0)!;
    expect(zero.baselineMinutesRequired).toBeCloseTo(516, 6);
    expect(zero.baselineOverageMinutes).toBeCloseTo(36, 6);
  });

  it('never reports negative overage', () => {
    for (const r of rows) expect(r.baselineOverageMinutes).toBeGreaterThanOrEqual(0);
  });

  it("drops the ceiling from 8 to 7 just below Ellen's observed 90%", () => {
    expect(scheduleFeasibility(at(0.9)).maxVisitsPerDay).toBe(8);
    expect(scheduleFeasibility(at(0.89)).maxVisitsPerDay).toBe(7);
  });

  it('holds the ceiling at 7 all the way down to 0%', () => {
    // Still a cliff rather than a slope, just one step lower than Run 6 found.
    for (const c of [0.75, 0.5, 0.25, 0]) {
      expect(scheduleFeasibility(at(c)).maxVisitsPerDay, `at ${c}`).toBe(7);
    }
  });
});

describe('the concurrency threshold, computed from the model', () => {
  const t = concurrencyThreshold(base, 8)!;

  it("finds the crossing point at Ellen's observed 90%", () => {
    expect(t.closesAtFullConcurrency).toBe(true);
    expect(t.closesAtZeroConcurrency).toBe(false);
    expect(t.threshold).toBeCloseTo(0.9, 6);
  });

  it('agrees with a direct feasibility check either side of the threshold', () => {
    const closes = (c: number) =>
      8 * visitCycle(at(c)).cycleMinutes <= scheduleFeasibility(at(c)).workdayMinutes;
    expect(closes(t.threshold)).toBe(true);
    expect(closes(t.threshold - 1e-6)).toBe(false);
  });

  it('returns null when the day closes at every level', () => {
    // A shorter visit gives real slack, so there is no crossing to find.
    expect(concurrencyThreshold({ ...base, eiMixShare: 0, nonEiVisitMinutes: 30 }, 8)).toBeNull();
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
    // 90% matches 100% because neither pushes documentation into the schedule.
    expect(rows.find((r) => r.concurrency === 0.9)!.collectedRevenue)
      .toBeCloseTo(full.collectedRevenue, 6);
    const rest = rows.filter((r) => r.concurrency < 0.9);
    for (const r of rest) {
      expect(r.collectedRevenue).toBeLessThan(full.collectedRevenue);
      expect(r.collectedRevenue).toBeCloseTo(rest[0].collectedRevenue, 6);
    }
  });

  it('annual volume uses the clamped ceiling, not the requested 8', () => {
    for (const c of [0.75, 0.5, 0.25, 0]) {
      expect(capacityVolume(at(c)).visitsPerDay, `at ${c}`).toBe(7);
      expect(annualModel(at(c)).completedVisits).toBeCloseTo(7 * 4 * 46, 6);
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
      .toEqual(['100%', '90%', '75%', '50%', '25%', '0%']);
  });
});

describe("Ellen's observed 90/10 documentation workflow", () => {
  it('is the model default, sourced from her reported workflow', () => {
    const d = defaultScenario();
    expect(d.documentationConcurrency).toBe(0.9);
    expect(d.documentationAfterHoursShare).toBe(0.1);
  });

  it('puts nothing into the clinical schedule, so the 8-visit day closes', () => {
    const cy = visitCycle(base);
    const f = scheduleFeasibility(base);
    expect(cy.additionalDocumentationMinutes).toBeCloseTo(0, 6);
    expect(cy.cycleMinutes).toBeCloseTo(60, 6);
    expect(f.maxVisitsPerDay).toBe(8);
    expect(8 * cy.cycleMinutes).toBeCloseTo(f.workdayMinutes, 6);
    expect(f.clamped).toBe(false);
  });

  it('keeps the observed 8 visits/day distinct from modelled capacity', () => {
    // AS-002 is what Ellen does; maxVisitsPerDay is what the model says fits.
    // They coincide here, but they are different quantities and must stay so.
    expect(assumptionsById.get('AS-002')!.value).toBe(8);
    expect(assumptionsById.get('AS-002')!.kind).toBe('USER_PROVIDED');
    const reduced = scheduleFeasibility(at(0.5));
    expect(reduced.requestedVisitsPerDay).toBe(8);
    expect(reduced.maxVisitsPerDay).toBe(7);
  });
});

describe('after-hours documentation is tracked as burden, not capacity', () => {
  it('does not reduce the visit ceiling', () => {
    // Same documentation minutes, but moved after hours instead of into the day.
    const inDay = scheduleFeasibility({ ...base, documentationConcurrency: 0, documentationAfterHoursShare: 0 });
    const afterHours = scheduleFeasibility({ ...base, documentationConcurrency: 0, documentationAfterHoursShare: 1 });
    expect(inDay.maxVisitsPerDay).toBe(7);
    expect(afterHours.maxVisitsPerDay).toBe(8);
  });

  it('is still counted as real work in the clinician burden figures', () => {
    const cy = visitCycle(base);
    const vol = capacityVolume(base);
    expect(cy.afterHoursDocumentationMinutes).toBeCloseTo(0.5, 6);
    expect(cy.totalClinicianMinutes).toBeGreaterThan(cy.cycleMinutes);
    expect(vol.afterHoursDocumentationMinutesPerDay).toBeCloseTo(4, 6);
    expect(vol.afterHoursDocumentationHoursPerWeek).toBeGreaterThan(0);
    expect(vol.totalClinicianHoursPerWeek).toBeGreaterThan(
      (vol.visitsPerWeek * cy.cycleMinutes) / 60,
    );
  });

  it('grows when more documentation is pushed out of the workday', () => {
    const a = capacityVolume({ ...base, documentationConcurrency: 0.9, documentationAfterHoursShare: 0.1 });
    const b = capacityVolume({ ...base, documentationConcurrency: 0.5, documentationAfterHoursShare: 0.5 });
    expect(b.afterHoursDocumentationHoursPerWeek).toBeGreaterThan(a.afterHoursDocumentationHoursPerWeek);
  });
});

describe('break-even and headroom at the observed baseline', () => {
  it('computes break-even below the feasible ceiling', () => {
    const v = viabilityCheck(base);
    expect(v.breakEvenIsAchievable).toBe(true);
    expect(v.maxFeasibleVisitsPerDay).toBe(8);
    expect(v.breakEvenVisitsPerDay!).toBeLessThan(8);
    expect(v.headroomVisitsPerDay!).toBeGreaterThan(0);
  });

  it('keeps headroom consistent with ceiling minus break-even', () => {
    const v = viabilityCheck(base);
    expect(v.headroomVisitsPerDay!).toBeCloseTo(
      v.maxFeasibleVisitsPerDay - v.breakEvenVisitsPerDay!, 9,
    );
  });
});

describe('StateWise is EMR context only', () => {
  it('is recorded as context and never as an external evidence source', () => {
    const mentions = evidence.filter((e) => JSON.stringify(e).includes('StateWise'));
    expect(mentions.length).toBeGreaterThan(0);
    for (const e of mentions) {
      // First-hand report, not research; and not a citable outside source.
      expect(e.retrieval).toBe('user-reported');
      expect(e.source).toMatch(/^Ellen/);
    }
  });

  it('drives no assumption in the model', () => {
    // No productivity figure may be justified by the choice of EMR.
    for (const a of assumptions) {
      expect(JSON.stringify(a), `${a.id} cites StateWise`).not.toContain('StateWise');
    }
  });

  it('is exposed as context on the baseline constant', () => {
    expect(ELLEN_BASELINE.emr).toBe('StateWise');
  });
});

describe('impossible-schedule guard at the observed baseline', () => {
  it('12 visits/day cannot out-earn the feasible 8-visit ceiling', () => {
    const ceiling = annualModel(base);
    const overstated = annualModel({ ...base, visitsPerDay: 12 });
    expect(overstated.collectedRevenue).toBeCloseTo(ceiling.collectedRevenue, 6);
    expect(scheduleFeasibility({ ...base, visitsPerDay: 12 }).effectiveVisitsPerDay).toBe(8);
  });
});
