/**
 * OUTPATIENT LANE — revenue by the 15-minute unit.
 *
 * In the outpatient PT/OT lane a visit is not paid a flat rate. It is paid per
 * timed CPT unit under the "8-minute rule" (HCPF therapy training, EV-044):
 * 8-22 minutes = 1 unit, 23-37 = 2, 38-52 = 3, 53-67 = 4, and so on, capped
 * at five units of PT per member per day. Travel and documentation time are
 * explicitly not billable.
 *
 * The per-unit rates come from the Health First Colorado Physician Fee
 * Schedule (EV-050), read directly. This module holds no rate of its own —
 * rates are inputs, so the assumption register stays the single source.
 */

/** Units billable for a given number of direct treatment minutes. */
export function unitsForMinutes(treatmentMinutes: number, dailyUnitCap = 5): number {
  if (!(treatmentMinutes >= 8)) return 0;
  const units = Math.floor((treatmentMinutes + 7) / 15);
  return Math.min(units, dailyUnitCap);
}

export interface OutpatientVisit {
  treatmentMinutes: number;
  units: number;
  ratePerUnit: number;
  grossRevenue: number;
}

export function outpatientVisitRevenue(
  treatmentMinutes: number,
  ratePerUnit: number,
  dailyUnitCap = 5,
): OutpatientVisit {
  const units = unitsForMinutes(treatmentMinutes, dailyUnitCap);
  return { treatmentMinutes, units, ratePerUnit, grossRevenue: units * ratePerUnit };
}

export interface LaneComparisonInputs {
  /** Flat home health rate per visit (AS-001). */
  homeHealthRatePerVisit: number;
  /** Outpatient rate per 15-minute unit for the code used (AS-032 / AS-033). */
  outpatientRatePerUnit: number;
  eiVisitMinutes: number;
  nonEiVisitMinutes: number;
  /** Share of VISITS that are EI (AS-019). */
  eiVisitShare: number;
  /** Optional weekly visit count, e.g. Ellen's 33, to express the gap per week. */
  visitsPerWeek?: number;
}

export interface LaneComparison {
  ei: { minutes: number; homeHealth: number; outpatient: number; units: number };
  nonEi: { minutes: number; homeHealth: number; outpatient: number; units: number };
  /** Revenue per visit weighted by the visit mix. */
  weighted: { homeHealth: number; outpatient: number; ratio: number };
  weeklyGross: { homeHealth: number; outpatient: number } | null;
  /** Which visit type the outpatient lane rewards relative to home health. */
  note: string;
}

/**
 * Same schedule, two payment mechanics. Gross figures — collection rate,
 * mileage and clinician cost apply identically to both lanes and are left to
 * the main model. Under a flat rate a long visit is a capacity drain; under
 * per-unit pay it is the better-paid visit. This function makes that visible.
 */
export function laneComparison(i: LaneComparisonInputs): LaneComparison {
  const ei = outpatientVisitRevenue(i.eiVisitMinutes, i.outpatientRatePerUnit);
  const nonEi = outpatientVisitRevenue(i.nonEiVisitMinutes, i.outpatientRatePerUnit);
  const share = Math.min(1, Math.max(0, i.eiVisitShare));

  const weightedOutpatient = ei.grossRevenue * share + nonEi.grossRevenue * (1 - share);
  const weightedHomeHealth = i.homeHealthRatePerVisit;

  const weeklyGross =
    i.visitsPerWeek && i.visitsPerWeek > 0
      ? {
          homeHealth: i.visitsPerWeek * weightedHomeHealth,
          outpatient: i.visitsPerWeek * weightedOutpatient,
        }
      : null;

  const ratio = weightedHomeHealth > 0 ? weightedOutpatient / weightedHomeHealth : 0;

  return {
    ei: { minutes: i.eiVisitMinutes, homeHealth: i.homeHealthRatePerVisit, outpatient: ei.grossRevenue, units: ei.units },
    nonEi: { minutes: i.nonEiVisitMinutes, homeHealth: i.homeHealthRatePerVisit, outpatient: nonEi.grossRevenue, units: nonEi.units },
    weighted: { homeHealth: weightedHomeHealth, outpatient: weightedOutpatient, ratio },
    weeklyGross,
    note:
      ei.grossRevenue >= nonEi.grossRevenue
        ? `Per-unit pay rewards the longer visit: a ${i.eiVisitMinutes}-minute visit bills ${ei.units} units, a ${i.nonEiVisitMinutes}-minute visit ${nonEi.units}. The flat home health rate pays both the same.`
        : 'Per-unit pay rewards the longer visit.',
  };
}
