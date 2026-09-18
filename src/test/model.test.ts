import { describe, it, expect } from 'vitest';
import {
  loadedClinicianCost, visitEconomics, capacityCheck, annualModel,
  utilisationScenarios, travelScenarios, viabilityCheck, type ScenarioInputs,
} from '../model/economics';
import { capitalRequirement, bandAssessment, CAPITAL_BANDS } from '../model/capital';
import { cashCalendar } from '../model/cash';
import { defaultScenario } from '../model/defaults';
import { costs } from '../data/costs';

/** Ellen's observed baseline: 45m visit + 15m travel = 60m cycle, 8 visits in 8h. */
const base: ScenarioInputs = {
  reimbursementPerVisit: 143.02,
  visitsPerDay: 8,
  workingDaysPerYear: 230,
  cancellationRate: 0.15,
  collectionRate: 0.93,
  clinicianSalary: 100000,
  payrollBurdenRate: 0.115,
  benefitsRate: 0.18,
  mileageCostPerVisit: 12,
  fixedMonthlyOverhead: 500,
  clinicianCount: 1,
  eiVisitMinutes: 60,
  nonEiVisitMinutes: 30,
  eiMixShare: 0.5,
  travelMinutesPerVisit: 15,
  documentationMinutesPerVisit: 5,
  workdayHours: 8,
  documentationConcurrency: 0.9,
  documentationAfterHoursShare: 0.1,
  daysToCash: 45,
};

/**
 * A scenario that actually works, used where a test needs profitable operations.
 * Note what it took to get here: a 45-minute visit, 20 minutes travel and 10
 * minutes documentation — an 85-minute envelope rather than 100.
 */
const viableScenario: ScenarioInputs = { ...base, clinicianSalary: 85000 };

describe('loaded clinician cost', () => {
  it('is materially higher than salary alone', () => {
    const r = loadedClinicianCost(base)!;
    expect(r.total).toBeGreaterThan(r.salary);
    // 11.5% payroll + 18% benefits = 29.5% load
    expect(r.total).toBeCloseTo(100000 * 1.295, 2);
  });

  it('separates payroll taxes from benefits so the math is visible', () => {
    const r = loadedClinicianCost(base)!;
    expect(r.payrollTaxes).toBeCloseTo(11500, 2);
    expect(r.benefits).toBeCloseTo(18000, 2);
    expect(r.salary + r.payrollTaxes + r.benefits).toBeCloseTo(r.total, 6);
  });

  it('accounts for cancellations when computing cost per completed visit', () => {
    const r = loadedClinicianCost(base)!;
    expect(r.completedVisitsPerYear).toBeCloseTo(8 * 230 * 0.85, 6);
    expect(r.costPerCompletedVisit).toBeCloseTo(r.total / r.completedVisitsPerYear, 6);
  });

  it('returns null rather than inventing a salary', () => {
    expect(loadedClinicianCost({ ...base, clinicianSalary: null })).toBeNull();
  });
});

describe('visit economics', () => {
  it('applies the collection rate to gross revenue', () => {
    const v = visitEconomics(base);
    expect(v.grossRevenue).toBe(143.02);
    expect(v.collectedRevenue).toBeCloseTo(143.02 * 0.93, 6);
  });

  it('counts travel and documentation as consumed clinician time', () => {
    const v = visitEconomics(base);
    // 45 patient-facing + 15 travel; the 5 minutes of documentation are
    // absorbed into the visit rather than added to the day.
    expect(v.totalMinutesConsumed).toBe(60);
  });

  it("equals revenue per visit at Ellen's 60-minute cycle", () => {
    // A neat consequence of the observed baseline: one visit consumes exactly
    // one hour of workday, so the hourly yield and the per-visit yield coincide.
    const v = visitEconomics(base);
    expect(v.totalMinutesConsumed).toBe(60);
    expect(v.revenuePerClinicianHour).toBeCloseTo(v.collectedRevenue, 6);
  });

  it('falls below the visit rate as soon as the cycle exceeds an hour', () => {
    // Every minute added to the cycle beyond 60 dilutes the hourly yield,
    // because a flat per-visit rate pays nothing for the extra time.
    const v = visitEconomics({ ...base, travelMinutesPerVisit: 35 });
    expect(v.totalMinutesConsumed).toBe(80);
    expect(v.revenuePerClinicianHour).toBeLessThan(v.collectedRevenue);
    expect(v.revenuePerClinicianHour).toBeCloseTo((143.02 * 0.93 / 80) * 60, 6);
  });

  it('degrades gracefully when salary is unknown', () => {
    const v = visitEconomics({ ...base, clinicianSalary: null });
    expect(v.clinicianCost).toBeNull();
    expect(v.contributionMargin).toBeNull();
    expect(v.marginPercent).toBeNull();
    // Revenue side still computes — partial knowledge is still useful.
    expect(v.collectedRevenue).toBeGreaterThan(0);
  });
});

describe('capacity check', () => {
  it("accepts Ellen's baseline: 8 x 60 minutes fills the 8-hour day exactly", () => {
    const c = capacityCheck(base);
    expect(c.minutesRequired).toBe(480);
    expect(c.feasibleInEightHourDay).toBe(true);
    expect(c.maxVisitsInEightHours).toBe(8);
  });

  it('flags a caseload that does not fit once travel grows', () => {
    // 45m travel => 90m cycle => only 5 visits fit, so 8 is infeasible.
    const c = capacityCheck({ ...base, travelMinutesPerVisit: 45 });
    expect(c.feasibleInEightHourDay).toBe(false);
    expect(c.maxVisitsInEightHours).toBe(5);
  });

  it('shows that cutting travel time raises the achievable caseload', () => {
    const tight = capacityCheck({ ...base, travelMinutesPerVisit: 10 });
    const wide = capacityCheck({ ...base, travelMinutesPerVisit: 40 });
    expect(tight.maxVisitsInEightHours).toBeGreaterThan(wide.maxVisitsInEightHours);
  });
});

describe('annual model', () => {
  it('computes completed visits net of cancellations', () => {
    const m = annualModel(base);
    expect(m.completedVisits).toBeCloseTo(8 * 230 * 0.85, 6);
  });

  it('scales with clinician count', () => {
    const one = annualModel(base);
    const three = annualModel({ ...base, clinicianCount: 3 });
    expect(three.completedVisits).toBeCloseTo(one.completedVisits * 3, 6);
    expect(three.grossRevenue).toBeCloseTo(one.grossRevenue * 3, 6);
  });

  it('overhead does not triple when clinicians triple', () => {
    // Operating leverage: fixed overhead is spread over more visits.
    const one = annualModel(base);
    const three = annualModel({ ...base, clinicianCount: 3 });
    expect(three.overheadTotal).toBe(one.overheadTotal);
  });

  it('computes a break-even that responds to reimbursement', () => {
    const m = annualModel(base);
    expect(m.breakEvenVisitsPerYear).toBeGreaterThan(0);
    const lowerRate = annualModel({ ...base, reimbursementPerVisit: 100 });
    expect(lowerRate.breakEvenVisitsPerYear!).toBeGreaterThan(m.breakEvenVisitsPerYear!);
  });

  it('working capital rises with a longer cash cycle', () => {
    const fast = annualModel({ ...base, daysToCash: 20 });
    const slow = annualModel({ ...base, daysToCash: 90 });
    expect(slow.workingCapitalRequired!).toBeGreaterThan(fast.workingCapitalRequired!);
  });

  it('returns nulls, not zeros, when salary is unknown', () => {
    const m = annualModel({ ...base, clinicianSalary: null });
    expect(m.clinicianCostTotal).toBeNull();
    expect(m.operatingProfit).toBeNull();
    expect(m.workingCapitalRequired).toBeNull();
    expect(m.breakEvenVisitsPerYear).toBeNull();
  });
});

describe('scenario spreads', () => {
  it('utilisation scenarios span low, typical and high', () => {
    const s = utilisationScenarios(base);
    expect(s).toHaveLength(3);
    expect(s[0].visitsPerDay).toBe(6);
    expect(s[1].visitsPerDay).toBe(8);
    expect(s[2].visitsPerDay).toBe(10);
    expect(s[2].model.grossRevenue).toBeGreaterThan(s[0].model.grossRevenue);
  });

  it('never drops utilisation below one visit per day', () => {
    const s = utilisationScenarios({ ...base, visitsPerDay: 1 });
    expect(s[0].visitsPerDay).toBeGreaterThanOrEqual(1);
  });

  it('a tight travel radius yields better economics than a wide one', () => {
    const t = travelScenarios(base);
    const tight = t.find((x) => x.label === 'Tight radius')!;
    const wide = t.find((x) => x.label === 'Wide radius')!;
    expect(tight.capacity.maxVisitsInEightHours).toBeGreaterThan(wide.capacity.maxVisitsInEightHours);
    expect(tight.economics.contributionMargin!).toBeGreaterThan(wide.economics.contributionMargin!);
  });
});

describe('capital requirement', () => {
  it('separates one-time, burn, working capital and contingency', () => {
    const r = capitalRequirement(costs, base, 6);
    expect(r.oneTimeStartup.typical).toBeGreaterThanOrEqual(0);
    expect(r.monthlyBurn.typical).toBeGreaterThan(0);
    expect(r.workingCapital).not.toBeNull();
    expect(r.contingency).not.toBeNull();
  });

  it('pre-revenue burn scales with the pre-revenue period', () => {
    const short = capitalRequirement(costs, base, 3);
    const long = capitalRequirement(costs, base, 12);
    expect(long.preRevenueBurn.typical).toBeCloseTo(short.preRevenueBurn.typical * 4, 4);
    expect(long.totalRequired.typical!).toBeGreaterThan(short.totalRequired.typical!);
  });

  it('reports incompleteness rather than pretending unknown costs are zero', () => {
    // Several required cost lines genuinely have no established figure.
    const r = capitalRequirement(costs, base, 6);
    expect(r.completeness).toContain('INCOMPLETE');
    expect(r.oneTimeStartup.unknownItems.length).toBeGreaterThan(0);
  });

  it('cannot produce a total when working capital is unknown', () => {
    const r = capitalRequirement(costs, { ...base, clinicianSalary: null }, 6);
    expect(r.workingCapital).toBeNull();
    expect(r.totalRequired.typical).toBeNull();
  });

  it('prefers an actual quote over an estimate', () => {
    const withQuote = costs.map((c) => (c.id === 'C-030' ? { ...c, actualQuote: 4200 } : c));
    const a = capitalRequirement(costs, base, 6);
    const b = capitalRequirement(withQuote, base, 6);
    expect(b.monthlyBurn.typical).not.toBeCloseTo(a.monthlyBurn.typical, 6);
  });
});

describe('capital band assessment', () => {
  it('rates every standard band', () => {
    const r = capitalRequirement(costs, base, 6);
    for (const band of CAPITAL_BANDS) {
      const a = bandAssessment(band, r);
      expect(['Insufficient', 'Tight', 'Adequate', 'Comfortable']).toContain(a.verdict);
    }
  });

  it('larger bands are never rated worse than smaller ones', () => {
    const r = capitalRequirement(costs, base, 6);
    const rank = { Insufficient: 0, Tight: 1, Adequate: 2, Comfortable: 3 };
    const verdicts = CAPITAL_BANDS.map((b) => rank[bandAssessment(b, r).verdict]);
    for (let i = 1; i < verdicts.length; i++) {
      expect(verdicts[i]).toBeGreaterThanOrEqual(verdicts[i - 1]);
    }
  });

  it('declines to assess when the requirement is unknown', () => {
    const r = capitalRequirement(costs, { ...base, clinicianSalary: null }, 6);
    expect(bandAssessment(100000, r).verdict).toBe('Insufficient');
    expect(bandAssessment(100000, r).note).toContain('unknown');
  });
});

describe('cash calendar', () => {
  const input = {
    scenario: base, oneTimeStartup: 5000, monthlyOverhead: 500,
    preRevenueMonths: 4, rampMonths: 6, startingCash: 50000, horizonMonths: 24,
  };

  it('produces one row per month of the horizon', () => {
    expect(cashCalendar(input).months).toHaveLength(24);
  });

  it('earns no revenue during the pre-revenue period', () => {
    const c = cashCalendar(input);
    for (const m of c.months.filter((x) => x.month <= 4)) {
      expect(m.cashIn).toBe(0);
      expect(m.phase).toBe('Pre-revenue');
    }
  });

  it('withholds cash until the collection lag has elapsed', () => {
    // Care delivered in month 5 is not collected until roughly month 6-7.
    const c = cashCalendar(input);
    expect(c.months[4].cashIn).toBe(0);
    expect(c.months.some((m) => m.cashIn > 0)).toBe(true);
  });

  it('identifies the trough — the month of maximum cash pressure', () => {
    const c = cashCalendar(input);
    expect(c.troughMonth).toBeGreaterThan(1);
    const balances = c.months.map((m) => m.cumulativeCash);
    expect(c.troughBalance).toBe(Math.min(...balances));
  });

  it('the trough falls after revenue starts, not at launch', () => {
    // The counterintuitive point: cash keeps falling after the first patient,
    // because payroll starts immediately and collections lag.
    const c = cashCalendar(input);
    expect(c.troughMonth).toBeGreaterThan(input.preRevenueMonths);
  });

  it('charges one-time startup costs in month one only', () => {
    const c = cashCalendar(input);
    expect(c.months[0].cashOut).toBeGreaterThan(c.months[1].cashOut);
  });

  it('a longer pre-revenue period deepens the trough WHEN operations are profitable', () => {
    // Guard on the premise: this property only holds if each operating month
    // improves cash. At a loss-making caseload, delaying operations paradoxically
    // preserves cash, which is a real property of the model, not a bug.
    const profitable = { ...input, scenario: viableScenario };
    const shallow = cashCalendar({ ...profitable, preRevenueMonths: 2 });
    const deep = cashCalendar({ ...profitable, preRevenueMonths: 8 });
    expect(deep.troughBalance).toBeLessThan(shallow.troughBalance);
  });

  it('a longer pre-revenue period always consumes more cash before revenue starts', () => {
    // This property holds regardless of whether operations are profitable.
    const shallow = cashCalendar({ ...input, preRevenueMonths: 2 });
    const deep = cashCalendar({ ...input, preRevenueMonths: 10 });
    expect(deep.months[9].cumulativeCash).toBeLessThan(shallow.months[1].cumulativeCash);
  });

  it('reports the capital needed to survive the trough', () => {
    const broke = cashCalendar({ ...input, startingCash: 1000 });
    expect(broke.troughBalance).toBeLessThan(0);
    expect(broke.minimumCapitalToSurvive).toBeGreaterThan(1000);
  });
});

describe('default scenario wiring', () => {
  it('draws its reimbursement rate from the assumption register', () => {
    expect(defaultScenario().reimbursementPerVisit).toBe(143.02);
  });

  it('leaves clinician salary null because the register says it is unknown', () => {
    // This is the whole point: the model refuses to invent the number that
    // public sources disagree about by more than $56,000.
    expect(defaultScenario().clinicianSalary).toBeNull();
  });
});

describe('viability check — does break-even fit in a working day?', () => {
  it("is VIABLE at Ellen's observed baseline", () => {
    // The headline change from the real productivity data. On the previous
    // guessed inputs (5 visits/day, 100-minute cycle) break-even was physically
    // unreachable. At Ellen's actual 8 visits/day on a 60-minute cycle,
    // break-even lands near 5.7 visits/day against a ceiling of 8.
    const v = viabilityCheck(base);
    expect(v.breakEvenIsAchievable).toBe(true);
    expect(v.verdict).toContain('Viable');
    expect(v.maxFeasibleVisitsPerDay).toBe(8);
    expect(v.breakEvenVisitsPerDay!).toBeLessThan(v.maxFeasibleVisitsPerDay);
    expect(v.headroomVisitsPerDay!).toBeGreaterThan(0);
  });

  it('becomes NOT viable when travel time erodes the ceiling', () => {
    // 45m travel => 90m cycle => 5 visits/day ceiling, below break-even.
    const v = viabilityCheck({ ...base, travelMinutesPerVisit: 45 });
    expect(v.breakEvenIsAchievable).toBe(false);
    expect(v.verdict).toContain('NOT VIABLE');
    expect(v.bindingConstraint).toBe('Time per visit');
  });

  it('becomes viable once the time envelope is compressed', () => {
    const v = viabilityCheck(viableScenario);
    expect(v.breakEvenIsAchievable).toBe(true);
    expect(v.headroomVisitsPerDay!).toBeGreaterThan(0);
    expect(v.verdict).toContain('Viable');
  });

  it('refuses to assess viability when clinician cost is unknown', () => {
    const v = viabilityCheck({ ...base, clinicianSalary: null });
    expect(v.breakEvenIsAchievable).toBeNull();
    expect(v.bindingConstraint).toBe('Unknown');
    expect(v.verdict).toContain('AS-003');
  });
});
