import { describe, it, expect } from 'vitest';
import {
  founderRamp, patientsAtCapacity, rampMilestones, rampSensitivity, rampNarrative,
  referralSources, ELLEN_QUESTIONS, deriveFrequencyFromCaseload, type FounderRampInputs,
} from '../model/founderRamp';
import {
  scheduleFeasibility, capacityVolume, annualModel, weightedPatientFacingMinutes,
} from '../model/economics';
import { defaultScenario, RAMP_SCENARIO_DEFAULTS } from '../model/defaults';
import { assumptionsById } from '../data/assumptions';

const scenario = { ...defaultScenario(), clinicianSalary: 0 };

const inputs: FounderRampInputs = {
  scenario,
  startingActivePatients: 1,
  growthMode: 'weekly',
  newPatientsPerWeek: 1,
  newPatientsPerMonth: 4,
  manualMonthlyAdditions: [],
  eiVisitsPerPatientPerWeek: 1,
  nonEiVisitsPerPatientPerWeek: 1,
  monthlyDischargeRate: 0,
  clinicianCount: 1,
  ownerCompBeforeTransition: 0,
  targetOwnerCompAfterTransition: 90000,
  minimumCashReserve: 10000,
  transitionMonthOverride: null,
  startingCash: 0,
  horizonMonths: 24,
  censusTarget: 25,
};

describe('patients produce visits via frequency, not a flat revenue figure', () => {
  it('turns one patient into the modelled visit frequency', () => {
    const r = founderRamp({ ...inputs, newPatientsPerWeek: 0 });
    expect(r.months[0].activePatients).toBe(1);
    expect(r.months[0].demandVisitsPerWeek).toBeCloseTo(1, 6);
  });

  it('scales linearly with census', () => {
    const one = founderRamp({ ...inputs, startingActivePatients: 1, newPatientsPerWeek: 0 });
    const two = founderRamp({ ...inputs, startingActivePatients: 2, newPatientsPerWeek: 0 });
    expect(two.months[0].demandVisitsPerWeek).toBeCloseTo(one.months[0].demandVisitsPerWeek * 2, 6);
  });

  it('responds to visit frequency independently of census', () => {
    const a = founderRamp({ ...inputs, newPatientsPerWeek: 0 });
    const b = founderRamp({
      ...inputs, newPatientsPerWeek: 0,
      eiVisitsPerPatientPerWeek: 2, nonEiVisitsPerPatientPerWeek: 2,
    });
    expect(b.months[0].demandVisitsPerWeek).toBeCloseTo(a.months[0].demandVisitsPerWeek * 2, 6);
  });

  it('splits the census by the existing EI mix assumption', () => {
    const r = founderRamp({ ...inputs, startingActivePatients: 10, newPatientsPerWeek: 0 });
    const m = r.months[0];
    expect(m.eiMixShare).toBe(scenario.eiMixShare);
    expect(m.eiPatients + m.nonEiPatients).toBeCloseTo(m.activePatients, 6);
    expect(m.eiPatients).toBeCloseTo(10 * scenario.eiMixShare, 6);
  });

  it('uses EI and non-EI frequencies separately', () => {
    const r = founderRamp({
      ...inputs, startingActivePatients: 10, newPatientsPerWeek: 0,
      eiVisitsPerPatientPerWeek: 2, nonEiVisitsPerPatientPerWeek: 1,
    });
    // 5 EI x 2 + 5 non-EI x 1 = 15
    expect(r.months[0].demandVisitsPerWeek).toBeCloseTo(15, 6);
  });
});

describe('census growth and discharge', () => {
  it('adds patients on the weekly rate, converted on a 52/12 basis', () => {
    const r = founderRamp({ ...inputs, newPatientsPerWeek: 1 });
    expect(r.months[1].newPatients).toBeCloseTo(52 / 12, 6);
    expect(r.months[1].activePatients).toBeCloseTo(1 + 52 / 12, 6);
  });

  it('supports monthly acquisition', () => {
    const r = founderRamp({ ...inputs, growthMode: 'monthly', newPatientsPerMonth: 3 });
    expect(r.months[1].newPatients).toBe(3);
    expect(r.months[1].activePatients).toBeCloseTo(4, 6);
  });

  it('supports manual month-by-month additions, so real results can replace scenarios', () => {
    const r = founderRamp({
      ...inputs, growthMode: 'manual', manualMonthlyAdditions: [0, 2, 0, 5],
    });
    expect(r.months[1].newPatients).toBe(2);
    expect(r.months[2].newPatients).toBe(0);
    expect(r.months[3].newPatients).toBe(5);
    expect(r.months[3].activePatients).toBeCloseTo(8, 6);
  });

  it('reduces census by the discharge rate', () => {
    const none = founderRamp({ ...inputs, newPatientsPerWeek: 0, monthlyDischargeRate: 0 });
    const churn = founderRamp({ ...inputs, newPatientsPerWeek: 0, monthlyDischargeRate: 0.1 });
    expect(churn.months[5].activePatients).toBeLessThan(none.months[5].activePatients);
  });

  it('never lets census go negative', () => {
    const r = founderRamp({ ...inputs, newPatientsPerWeek: 0, monthlyDischargeRate: 1 });
    for (const m of r.months) expect(m.activePatients).toBeGreaterThanOrEqual(0);
  });
});

describe('capacity guard — demand above capacity stays visible', () => {
  it('never serves more than the clinical ceiling', () => {
    const r = founderRamp({ ...inputs, startingActivePatients: 200, newPatientsPerWeek: 0 });
    const m = r.months[0];
    expect(m.demandVisitsPerDay).toBeGreaterThan(m.capacityVisitsPerDay);
    expect(m.servedVisitsPerDay).toBeCloseTo(m.capacityVisitsPerDay, 6);
  });

  it('reports overflow rather than hiding it', () => {
    const r = founderRamp({ ...inputs, startingActivePatients: 200, newPatientsPerWeek: 0 });
    const m = r.months[0];
    expect(m.overflowVisitsPerDay).toBeCloseTo(m.demandVisitsPerDay - m.capacityVisitsPerDay, 6);
    expect(m.overflowVisitsPerDay).toBeGreaterThan(0);
    expect(m.atCapacity).toBe(true);
  });

  it('draws its ceiling from the existing scheduleFeasibility, not a local copy', () => {
    const r = founderRamp(inputs);
    expect(r.capacityVisitsPerDay).toBe(scheduleFeasibility(scenario).maxVisitsPerDay);
  });

  it('inherits a reduced ceiling when the visit mix shifts toward EI', () => {
    const allEi = founderRamp({ ...inputs, scenario: { ...scenario, eiMixShare: 1 } });
    expect(allEi.capacityVisitsPerDay).toBe(6);
    expect(founderRamp(inputs).capacityVisitsPerDay).toBe(8);
  });

  it('scales the ceiling with clinician count', () => {
    const two = founderRamp({ ...inputs, clinicianCount: 2 });
    expect(two.capacityVisitsPerDay).toBe(16);
  });

  it('revenue stops growing once capacity binds', () => {
    const at = founderRamp({ ...inputs, startingActivePatients: 100, newPatientsPerWeek: 0 });
    const beyond = founderRamp({ ...inputs, startingActivePatients: 400, newPatientsPerWeek: 0 });
    expect(beyond.months[0].monthlyRevenue).toBeCloseTo(at.months[0].monthlyRevenue, 6);
  });
});

describe('owner compensation and the $0 launch scenario', () => {
  it('takes no compensation before transition', () => {
    const r = founderRamp({ ...inputs, transitionMonthOverride: 12 });
    for (const m of r.months.filter((x) => x.month < 12)) {
      expect(m.ownerCompensation).toBe(0);
      expect(m.transitioned).toBe(false);
    }
  });

  it('begins compensation at the transition month', () => {
    const r = founderRamp({ ...inputs, transitionMonthOverride: 12 });
    const after = r.months.find((m) => m.month === 12)!;
    expect(after.transitioned).toBe(true);
    expect(after.ownerCompensation).toBeCloseTo(90000 / 12, 6);
  });

  it('honours a manual transition month override', () => {
    const early = founderRamp({ ...inputs, transitionMonthOverride: 8 });
    const late = founderRamp({ ...inputs, transitionMonthOverride: 12 });
    expect(early.transitionMonth).toBe(8);
    expect(late.transitionMonth).toBe(12);
    const m9early = early.months.find((m) => m.month === 9)!;
    const m9late = late.months.find((m) => m.month === 9)!;
    expect(m9early.ownerCompensation).toBeGreaterThan(m9late.ownerCompensation);
  });

  it('keeps owner compensation distinct from the clinician salary assumption', () => {
    // AS-003 (clinician market salary) and AS-024 (owner comp target) are
    // different questions and must not be silently merged.
    expect(assumptionsById.get('AS-003')!.value).toBeNull();
    expect(assumptionsById.get('AS-024')!.value).toBeNull();
    expect(assumptionsById.get('AS-024')!.whyThisValue).toMatch(/NOT the same field as AS-003/);
  });
});

describe('cash accumulation', () => {
  it('rolls cumulative cash forward month over month', () => {
    const r = founderRamp({ ...inputs, transitionMonthOverride: 99 });
    for (let k = 1; k < r.months.length; k++) {
      expect(r.months[k].cumulativeCash).toBeCloseTo(
        r.months[k - 1].cumulativeCash + r.months[k].monthlyCashChange, 6,
      );
    }
  });

  it('accumulates faster while owner compensation is zero', () => {
    const noComp = founderRamp({ ...inputs, transitionMonthOverride: 99 });
    const earlyComp = founderRamp({ ...inputs, transitionMonthOverride: 2 });
    const last = noComp.months.length - 1;
    expect(noComp.months[last].cumulativeCash)
      .toBeGreaterThan(earlyComp.months[last].cumulativeCash);
  });

  it('starts from the supplied opening balance', () => {
    const r = founderRamp({ ...inputs, startingCash: 5000, transitionMonthOverride: 99 });
    expect(r.months[0].cumulativeCash).toBeCloseTo(5000 + r.months[0].monthlyCashChange, 6);
  });
});

describe('transition criteria', () => {
  it('requires BOTH the income and the cash criterion', () => {
    const r = founderRamp({ ...inputs, minimumCashReserve: 0 });
    const eligible = r.months.find((m) => m.transitionEligible);
    if (eligible) {
      expect(eligible.meetsIncomeCriterion).toBe(true);
      expect(eligible.meetsCashCriterion).toBe(true);
    }
    for (const m of r.months) {
      expect(m.transitionEligible).toBe(m.meetsIncomeCriterion && m.meetsCashCriterion);
    }
  });

  it('a higher cash reserve requirement delays or prevents eligibility', () => {
    const low = founderRamp({ ...inputs, minimumCashReserve: 0 });
    const high = founderRamp({ ...inputs, minimumCashReserve: 500000 });
    if (low.firstEligibleMonth !== null && high.firstEligibleMonth !== null) {
      expect(high.firstEligibleMonth).toBeGreaterThanOrEqual(low.firstEligibleMonth);
    } else {
      expect(high.firstEligibleMonth).toBeNull();
    }
  });

  it('a higher compensation target delays or prevents eligibility', () => {
    const low = founderRamp({ ...inputs, targetOwnerCompAfterTransition: 40000, minimumCashReserve: 0 });
    const high = founderRamp({ ...inputs, targetOwnerCompAfterTransition: 400000, minimumCashReserve: 0 });
    expect(high.firstEligibleMonth === null
      || (low.firstEligibleMonth !== null && high.firstEligibleMonth >= low.firstEligibleMonth)).toBe(true);
  });

  it('reports null rather than guessing when criteria are never met', () => {
    const r = founderRamp({ ...inputs, targetOwnerCompAfterTransition: 10_000_000 });
    expect(r.firstEligibleMonth).toBeNull();
  });

  it('evaluates eligibility on the zero-compensation path', () => {
    // Eligibility must not depend on the compensation it triggers.
    const a = founderRamp({ ...inputs, transitionMonthOverride: null });
    const b = founderRamp({ ...inputs, transitionMonthOverride: 3 });
    expect(b.firstEligibleMonth).toBe(a.firstEligibleMonth);
  });
});

describe('milestones', () => {
  const stones = rampMilestones(inputs);

  it('covers the requested patient levels plus capacity', () => {
    const labels = stones.map((s) => s.label);
    expect(labels.slice(0, 6)).toEqual([
      '1 patient', '2 patients', '5 patients', '10 patients', '15 patients', '20 patients',
    ]);
    expect(labels).toContain('Clinical capacity');
    expect(labels).toContain('Next clinician needed');
  });

  it('increases visits and revenue with census until capacity binds', () => {
    const one = stones.find((s) => s.label === '1 patient')!;
    const ten = stones.find((s) => s.label === '10 patients')!;
    expect(ten.visitsPerWeek).toBeCloseTo(one.visitsPerWeek * 10, 6);
    expect(ten.monthlyRevenue).toBeGreaterThan(one.monthlyRevenue);
  });

  it('shows overflow beyond clinical capacity', () => {
    const next = stones.find((s) => s.label === 'Next clinician needed')!;
    expect(next.overflowVisitsPerDay).toBeGreaterThan(0);
  });

  it('uses no evaluative language', () => {
    const text = JSON.stringify(stones).toLowerCase();
    for (const word of ['ideal', '"safe"', '"good"', '"bad"']) expect(text).not.toContain(word);
  });
});

describe('capacity in patients', () => {
  it('derives the patient census a clinician can carry', () => {
    const p = patientsAtCapacity(inputs)!;
    const vol = capacityVolume(scenario);
    expect(p).toBeCloseTo((8 * vol.workingDaysPerWeek) / 1, 6);
  });

  it('halves when each patient is seen twice as often', () => {
    const once = patientsAtCapacity(inputs)!;
    const twice = patientsAtCapacity({
      ...inputs, eiVisitsPerPatientPerWeek: 2, nonEiVisitsPerPatientPerWeek: 2,
    })!;
    expect(twice).toBeCloseTo(once / 2, 6);
  });

  it('returns null when frequency is unknown', () => {
    expect(patientsAtCapacity({
      ...inputs, eiVisitsPerPatientPerWeek: 0, nonEiVisitsPerPatientPerWeek: 0,
    })).toBeNull();
  });
});

describe('sensitivity matrix', () => {
  const cells = rampSensitivity(inputs);

  it('covers acquisition x frequency deterministically', () => {
    expect(cells).toHaveLength(16);
    const again = rampSensitivity(inputs);
    expect(again).toEqual(cells);
  });

  it('reaches eligibility no later at higher acquisition rates', () => {
    for (const freq of [1, 1.5, 2, 2.5]) {
      const row = cells.filter((c) => c.visitsPerPatientPerWeek === freq);
      for (let k = 1; k < row.length; k++) {
        const prev = row[k - 1].firstEligibleMonth;
        const cur = row[k].firstEligibleMonth;
        if (prev !== null && cur !== null) expect(cur).toBeLessThanOrEqual(prev);
      }
    }
  });

  it('reports null instead of inventing a month when not reached', () => {
    const slow = rampSensitivity({ ...inputs, targetOwnerCompAfterTransition: 10_000_000 });
    for (const c of slow) expect(c.firstEligibleMonth).toBeNull();
  });
});

describe('the model reuses the authoritative chain', () => {
  it('takes visit duration from the existing visit-mix model', () => {
    expect(weightedPatientFacingMinutes(scenario)).toBe(45);
    const allEi = founderRamp({ ...inputs, scenario: { ...scenario, eiMixShare: 1 } });
    expect(allEi.capacityVisitsPerDay).toBeLessThan(founderRamp(inputs).capacityVisitsPerDay);
  });

  it('takes revenue from annualModel rather than a local formula', () => {
    const r = founderRamp({ ...inputs, startingActivePatients: 200, newPatientsPerWeek: 0 });
    const m = r.months[0];
    const direct = annualModel({
      ...scenario, visitsPerDay: m.servedVisitsPerDay, clinicianCount: 1, clinicianSalary: 0,
    });
    expect(m.monthlyRevenue).toBeCloseTo(direct.collectedRevenue / 12, 6);
  });

  it('takes working days per week from capacityVolume', () => {
    expect(founderRamp(inputs).workingDaysPerWeek).toBeCloseTo(capacityVolume(scenario).workingDaysPerWeek, 9);
  });

  it('12 visits/day of demand cannot out-earn the ceiling', () => {
    const r = founderRamp({ ...inputs, startingActivePatients: 1000, newPatientsPerWeek: 0 });
    expect(r.months[0].servedVisitsPerDay).toBeLessThanOrEqual(r.capacityVisitsPerDay);
  });
});

describe('unknown inputs are surfaced, not filled in', () => {
  it('flags the ramp as incomplete when frequency is unknown', () => {
    const r = founderRamp({
      ...inputs, eiVisitsPerPatientPerWeek: 0, nonEiVisitsPerPatientPerWeek: 0,
    });
    expect(r.incomplete).toBe(true);
    expect(r.missingInputs.join(' ')).toMatch(/AS-020/);
  });

  it('keeps every ramp driver null in the assumption register', () => {
    for (const id of ['AS-020', 'AS-021', 'AS-022', 'AS-023', 'AS-024', 'AS-025']) {
      const a = assumptionsById.get(id)!;
      expect(a.value, id).toBeNull();
      expect(a.confidence, id).toBe('Unknown');
    }
  });

  it('records the $0 pre-transition compensation as user-provided', () => {
    const a = assumptionsById.get('AS-026')!;
    expect(a.value).toBe(0);
    expect(a.kind).toBe('USER_PROVIDED');
  });

  it('labels the ramp scenario defaults as scenarios, not evidence', () => {
    expect(RAMP_SCENARIO_DEFAULTS.label).toMatch(/SCENARIO/);
    expect(RAMP_SCENARIO_DEFAULTS.label).toMatch(/not evidence/);
  });

  it('narrates missing inputs instead of producing a timeline', () => {
    const text = rampNarrative({
      ...inputs, eiVisitsPerPatientPerWeek: 0, nonEiVisitsPerPatientPerWeek: 0,
    });
    expect(text).toMatch(/cannot produce a timeline/);
  });

  it('avoids persuasive language in the narrative', () => {
    const text = rampNarrative(inputs).toLowerCase();
    for (const w of ['ready', 'safe', 'smart', 'should quit', 'time to quit']) {
      expect(text).not.toContain(w);
    }
  });

  it('ships an empty referral pipeline rather than fabricated sources', () => {
    expect(referralSources).toEqual([]);
  });

  it('lists the open questions for Ellen', () => {
    expect(ELLEN_QUESTIONS).toHaveLength(9);
    expect(ELLEN_QUESTIONS[0]).toMatch(/distinct children/);
  });
});

describe('deriving visit frequency from caseload size', () => {
  const scen = defaultScenario();

  it('divides weekly visits by caseload for the blended rate', () => {
    const d = deriveFrequencyFromCaseload(scen, 35.4)!;
    expect(d.weeklyVisits).toBeCloseTo(8 * capacityVolume(scen).workingDaysPerWeek, 6);
    expect(d.blendedVisitsPerPatientPerWeek).toBeCloseTo(d.weeklyVisits / 35.4, 6);
    expect(d.blendedVisitsPerPatientPerWeek).toBeCloseTo(1, 2);
  });

  it('halves the frequency when the caseload doubles', () => {
    const small = deriveFrequencyFromCaseload(scen, 20)!;
    const big = deriveFrequencyFromCaseload(scen, 40)!;
    expect(big.blendedVisitsPerPatientPerWeek)
      .toBeCloseTo(small.blendedVisitsPerPatientPerWeek / 2, 6);
  });

  it('distinguishes 20 children twice a week from 40 once a week', () => {
    // The exact ambiguity that visits/day alone cannot resolve.
    const twenty = deriveFrequencyFromCaseload(scen, 20)!;
    const forty = deriveFrequencyFromCaseload(scen, 40)!;
    expect(twenty.blendedVisitsPerPatientPerWeek)
      .toBeCloseTo(forty.blendedVisitsPerPatientPerWeek * 2, 6);
    // ...yet both deliver exactly the same weekly visit volume.
    expect(twenty.weeklyVisits).toBeCloseTo(forty.weeklyVisits, 9);
  });

  it('splits patients to match the visit mix when both types are seen equally', () => {
    const d = deriveFrequencyFromCaseload(scen, 40, 1)!;
    expect(d.eiPatients).toBeCloseTo(20, 6);
    expect(d.nonEiPatients).toBeCloseTo(20, 6);
    expect(d.eiVisitsPerPatientPerWeek).toBeCloseTo(d.nonEiVisitsPerPatientPerWeek, 6);
  });

  it('shifts the patient mix away from the visit mix when EI is seen more often', () => {
    // 50% of VISITS being EI does not mean 50% of PATIENTS are EI.
    const d = deriveFrequencyFromCaseload(scen, 40, 2)!;
    expect(d.eiPatients).toBeCloseTo(40 / 3, 6);
    expect(d.nonEiPatients).toBeCloseTo(80 / 3, 6);
    expect(d.eiVisitsPerPatientPerWeek)
      .toBeCloseTo(d.nonEiVisitsPerPatientPerWeek * 2, 6);
  });

  it('reproduces the observed visit volume from the derived split', () => {
    for (const ratio of [1, 1.5, 2, 3]) {
      const d = deriveFrequencyFromCaseload(scen, 40, ratio)!;
      const total =
        d.eiPatients * d.eiVisitsPerPatientPerWeek
        + d.nonEiPatients * d.nonEiVisitsPerPatientPerWeek;
      expect(total, `ratio ${ratio}`).toBeCloseTo(d.weeklyVisits, 6);
    }
  });

  it('honours the EI visit share when splitting visits', () => {
    const d = deriveFrequencyFromCaseload({ ...scen, eiMixShare: 0.5 }, 40, 1)!;
    expect(d.eiPatients * d.eiVisitsPerPatientPerWeek).toBeCloseTo(d.weeklyVisits * 0.5, 6);
  });

  it('round-trips through the ramp back to the observed 8-visit day', () => {
    // The real integration check: feed the derived frequency into the ramp at
    // the matching census and the demand must land back on 8 visits/day.
    const caseload = 30;
    const d = deriveFrequencyFromCaseload(scen, caseload, 1)!;
    const r = founderRamp({
      ...inputs,
      startingActivePatients: caseload,
      newPatientsPerWeek: 0,
      eiVisitsPerPatientPerWeek: d.eiVisitsPerPatientPerWeek,
      nonEiVisitsPerPatientPerWeek: d.nonEiVisitsPerPatientPerWeek,
    });
    expect(r.months[0].demandVisitsPerDay).toBeCloseTo(8, 6);
    expect(r.months[0].overflowVisitsPerDay).toBeCloseTo(0, 6);
  });

  it('scales with clinician count', () => {
    const one = deriveFrequencyFromCaseload(scen, 40, 1, 1)!;
    const two = deriveFrequencyFromCaseload(scen, 40, 1, 2)!;
    expect(two.weeklyVisits).toBeCloseTo(one.weeklyVisits * 2, 6);
  });

  it('returns null rather than guessing on an unusable caseload', () => {
    expect(deriveFrequencyFromCaseload(scen, 0)).toBeNull();
    expect(deriveFrequencyFromCaseload(scen, -5)).toBeNull();
    expect(deriveFrequencyFromCaseload(scen, 40, 0)).toBeNull();
  });

  it('keeps the caseload assumption unknown until Ellen answers', () => {
    const a = assumptionsById.get('AS-027')!;
    expect(a.value).toBeNull();
    expect(a.confidence).toBe('Unknown');
    expect(a.whyThisValue).toMatch(/does not establish how many children/);
  });
});
