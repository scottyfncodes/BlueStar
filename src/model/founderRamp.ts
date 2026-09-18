import {
  annualModel, capacityVolume, scheduleFeasibility,
  type ScenarioInputs,
} from './economics';

/**
 * FOUNDER RAMP — from one patient to a real practice.
 *
 * ARCHITECTURAL RULE: this module owns no revenue, capacity or visit-duration
 * formula of its own. It converts a PATIENT CENSUS into a visits/day figure and
 * then hands that to the existing authoritative chain:
 *
 *   assumptions -> visit mix -> visitCycle -> scheduleFeasibility
 *   -> capacityVolume -> annualModel
 *
 * Every revenue number below comes back out of annualModel(). If a formula
 * needs changing it changes there, once.
 *
 * HONESTY NOTE: the inputs that actually drive the timeline — how often a
 * patient is seen, and how fast patients arrive — are NOT known. They are
 * carried as clearly-labelled SCENARIO values, and the matching assumption
 * records (AS-020, AS-021, AS-022, AS-023) are deliberately null. Nothing this
 * module outputs is a forecast.
 */

export type PatientGrowthMode = 'weekly' | 'monthly' | 'manual';

export interface FounderRampInputs {
  /** The authoritative scenario — visit mix, cycle, reimbursement, costs. */
  scenario: ScenarioInputs;

  startingActivePatients: number;
  growthMode: PatientGrowthMode;
  /** SCENARIO — not evidence. */
  newPatientsPerWeek: number;
  newPatientsPerMonth: number;
  /** Manual month-by-month additions, so real results can replace scenarios. */
  manualMonthlyAdditions: number[];

  /** SCENARIO — visit frequency is unknown (AS-020 / AS-021). */
  eiVisitsPerPatientPerWeek: number;
  nonEiVisitsPerPatientPerWeek: number;
  /** SCENARIO — monthly discharge rate as a fraction of census (AS-023). */
  monthlyDischargeRate: number;

  clinicianCount: number;

  ownerCompBeforeTransition: number;
  /** Annual target. UNKNOWN by default (AS-024) — distinct from clinician salary. */
  targetOwnerCompAfterTransition: number;
  /** Cash the business must hold before transition (AS-025). */
  minimumCashReserve: number;
  /** Force a transition month for scenario testing; null uses the first eligible. */
  transitionMonthOverride: number | null;

  startingCash: number;
  horizonMonths: number;
  /** Stop early once the census reaches this many active patients. */
  censusTarget: number;
}

export interface RampMonth {
  month: number;
  activePatients: number;
  newPatients: number;
  dischargedPatients: number;
  eiPatients: number;
  nonEiPatients: number;
  eiMixShare: number;

  /** What the census WANTS, before any capacity limit. */
  demandVisitsPerWeek: number;
  demandVisitsPerDay: number;
  /** What the clinical team can actually deliver. */
  capacityVisitsPerDay: number;
  servedVisitsPerDay: number;
  /** Demand that cannot be served. Never hidden. */
  overflowVisitsPerDay: number;
  capacityUtilisation: number;
  atCapacity: boolean;

  monthlyRevenue: number;
  monthlyNonOwnerCosts: number;
  /** Cash available for owner compensation before any is taken. */
  ownerCompCapacity: number;
  ownerCompensation: number;
  monthlyCashChange: number;
  cumulativeCash: number;

  transitioned: boolean;
  meetsIncomeCriterion: boolean;
  meetsCashCriterion: boolean;
  transitionEligible: boolean;
}

export interface FounderRamp {
  months: RampMonth[];
  /** First month BOTH selected criteria hold, on the $0-compensation path. */
  firstEligibleMonth: number | null;
  transitionMonth: number | null;
  monthCensusReachesCapacity: number | null;
  capacityVisitsPerDay: number;
  workingDaysPerWeek: number;
  /** True when a required input is unknown, so no timeline can be produced. */
  incomplete: boolean;
  missingInputs: string[];
}

/** Patients a clinician can carry, given visit frequency and the visit ceiling. */
export function patientsAtCapacity(i: FounderRampInputs): number | null {
  const visitsPerPatientPerWeek =
    i.eiVisitsPerPatientPerWeek * i.scenario.eiMixShare
    + i.nonEiVisitsPerPatientPerWeek * (1 - i.scenario.eiMixShare);
  if (visitsPerPatientPerWeek <= 0) return null;

  const volume = capacityVolume(i.scenario);
  const capacityVisitsPerWeek =
    scheduleFeasibility(i.scenario).maxVisitsPerDay * volume.workingDaysPerWeek * i.clinicianCount;
  return capacityVisitsPerWeek / visitsPerPatientPerWeek;
}

function newPatientsForMonth(i: FounderRampInputs, month: number): number {
  if (i.growthMode === 'manual') return i.manualMonthlyAdditions[month - 1] ?? 0;
  if (i.growthMode === 'monthly') return i.newPatientsPerMonth;
  // Weekly acquisition, converted on the same 52/12 basis used elsewhere.
  return i.newPatientsPerWeek * (52 / 12);
}

/**
 * Builds the month-by-month ramp.
 *
 * Runs twice: once on a $0-compensation path to find the first month the
 * selected transition criteria hold, then again applying compensation from the
 * transition month onward. Without the two passes the eligibility test would
 * depend on the compensation it is supposed to trigger.
 */
export function founderRamp(i: FounderRampInputs): FounderRamp {
  const missingInputs: string[] = [];
  if (!(i.eiVisitsPerPatientPerWeek > 0)) missingInputs.push('EI visits per patient per week (AS-020)');
  if (!(i.nonEiVisitsPerPatientPerWeek > 0)) missingInputs.push('Non-EI visits per patient per week (AS-021)');
  if (i.targetOwnerCompAfterTransition <= 0) missingInputs.push('Target owner compensation (AS-024)');

  const volume = capacityVolume(i.scenario);
  const workingDaysPerWeek = volume.workingDaysPerWeek;
  const capacityVisitsPerDay =
    scheduleFeasibility(i.scenario).maxVisitsPerDay * i.clinicianCount;

  const build = (transitionMonth: number | null): RampMonth[] => {
    const months: RampMonth[] = [];
    let active = i.startingActivePatients;
    let cash = i.startingCash;

    for (let m = 1; m <= i.horizonMonths; m++) {
      const discharged = m === 1 ? 0 : active * i.monthlyDischargeRate;
      const added = m === 1 ? 0 : newPatientsForMonth(i, m);
      active = Math.max(0, active - discharged + added);

      const eiShare = Math.min(1, Math.max(0, i.scenario.eiMixShare));
      const eiPatients = active * eiShare;
      const nonEiPatients = active * (1 - eiShare);

      const demandVisitsPerWeek =
        eiPatients * i.eiVisitsPerPatientPerWeek + nonEiPatients * i.nonEiVisitsPerPatientPerWeek;
      const demandVisitsPerDay =
        workingDaysPerWeek > 0 ? demandVisitsPerWeek / workingDaysPerWeek : 0;

      const servedVisitsPerDay = Math.min(demandVisitsPerDay, capacityVisitsPerDay);
      const overflowVisitsPerDay = Math.max(0, demandVisitsPerDay - capacityVisitsPerDay);

      // Hand the served volume to the authoritative chain. clinicianSalary is 0
      // here so operatingProfit excludes compensation entirely — owner comp is
      // a separate line, because it is NOT the same thing as a clinician salary.
      const monthScenario: ScenarioInputs = {
        ...i.scenario,
        visitsPerDay: servedVisitsPerDay / Math.max(1, i.clinicianCount),
        clinicianCount: i.clinicianCount,
        clinicianSalary: 0,
      };
      const annual = annualModel(monthScenario);

      const monthlyRevenue = annual.collectedRevenue / 12;
      const monthlyNonOwnerCosts = (annual.mileageTotal + annual.overheadTotal) / 12;
      const ownerCompCapacity = monthlyRevenue - monthlyNonOwnerCosts;

      const transitioned = transitionMonth !== null && m >= transitionMonth;
      const ownerCompensation = transitioned
        ? i.targetOwnerCompAfterTransition / 12
        : i.ownerCompBeforeTransition / 12;

      const monthlyCashChange = ownerCompCapacity - ownerCompensation;
      cash += monthlyCashChange;

      const meetsIncomeCriterion =
        i.targetOwnerCompAfterTransition > 0
        && ownerCompCapacity >= i.targetOwnerCompAfterTransition / 12;
      const meetsCashCriterion = cash >= i.minimumCashReserve;

      months.push({
        month: m,
        activePatients: active,
        newPatients: added,
        dischargedPatients: discharged,
        eiPatients,
        nonEiPatients,
        eiMixShare: eiShare,
        demandVisitsPerWeek,
        demandVisitsPerDay,
        capacityVisitsPerDay,
        servedVisitsPerDay,
        overflowVisitsPerDay,
        capacityUtilisation: capacityVisitsPerDay > 0 ? demandVisitsPerDay / capacityVisitsPerDay : 0,
        atCapacity: overflowVisitsPerDay > 0,
        monthlyRevenue,
        monthlyNonOwnerCosts,
        ownerCompCapacity,
        ownerCompensation,
        monthlyCashChange,
        cumulativeCash: cash,
        transitioned,
        meetsIncomeCriterion,
        meetsCashCriterion,
        transitionEligible: meetsIncomeCriterion && meetsCashCriterion,
      });

      if (active >= i.censusTarget && m >= 12) break;
    }
    return months;
  };

  // Pass 1 — no compensation taken, to locate the first eligible month.
  const baseline = build(null);
  const firstEligible = baseline.find((m) => m.transitionEligible)?.month ?? null;

  const transitionMonth = i.transitionMonthOverride ?? firstEligible;

  // Pass 2 — apply compensation from the transition month onward.
  const months = build(transitionMonth);

  const reachesCapacity = months.find((m) => m.atCapacity)?.month ?? null;

  return {
    months,
    firstEligibleMonth: firstEligible,
    transitionMonth,
    monthCensusReachesCapacity: reachesCapacity,
    capacityVisitsPerDay,
    workingDaysPerWeek,
    incomplete: missingInputs.length > 0,
    missingInputs,
  };
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const PATIENT_MILESTONES = [1, 2, 5, 10, 15, 20] as const;

export interface Milestone {
  label: string;
  activePatients: number;
  visitsPerWeek: number;
  visitsPerDay: number;
  capacityVisitsPerDay: number;
  capacityUtilisation: number;
  monthlyRevenue: number;
  ownerCompCapacity: number;
  /** First month the ramp reaches this census, if it does within the horizon. */
  monthReached: number | null;
  cumulativeCashAtMilestone: number | null;
  overflowVisitsPerDay: number;
}

/** Milestone economics, computed through the same chain as everything else. */
export function rampMilestones(i: FounderRampInputs): Milestone[] {
  const ramp = founderRamp(i);
  const capacityPatients = patientsAtCapacity(i);

  const levels: { label: string; patients: number }[] = PATIENT_MILESTONES.map((p) => ({
    label: `${p} patient${p === 1 ? '' : 's'}`,
    patients: p,
  }));
  if (capacityPatients !== null && Number.isFinite(capacityPatients)) {
    levels.push({ label: 'Clinical capacity', patients: capacityPatients });
    levels.push({ label: 'Next clinician needed', patients: capacityPatients * 1.25 });
  }

  return levels.map(({ label, patients }) => {
    const eiShare = Math.min(1, Math.max(0, i.scenario.eiMixShare));
    const visitsPerWeek =
      patients * eiShare * i.eiVisitsPerPatientPerWeek
      + patients * (1 - eiShare) * i.nonEiVisitsPerPatientPerWeek;
    const visitsPerDay =
      ramp.workingDaysPerWeek > 0 ? visitsPerWeek / ramp.workingDaysPerWeek : 0;
    const served = Math.min(visitsPerDay, ramp.capacityVisitsPerDay);

    const annual = annualModel({
      ...i.scenario,
      visitsPerDay: served / Math.max(1, i.clinicianCount),
      clinicianCount: i.clinicianCount,
      clinicianSalary: 0,
    });
    const monthlyRevenue = annual.collectedRevenue / 12;
    const monthlyNonOwnerCosts = (annual.mileageTotal + annual.overheadTotal) / 12;

    const hit = ramp.months.find((m) => m.activePatients >= patients) ?? null;

    return {
      label,
      activePatients: patients,
      visitsPerWeek,
      visitsPerDay,
      capacityVisitsPerDay: ramp.capacityVisitsPerDay,
      capacityUtilisation:
        ramp.capacityVisitsPerDay > 0 ? visitsPerDay / ramp.capacityVisitsPerDay : 0,
      monthlyRevenue,
      ownerCompCapacity: monthlyRevenue - monthlyNonOwnerCosts,
      monthReached: hit?.month ?? null,
      cumulativeCashAtMilestone: hit?.cumulativeCash ?? null,
      overflowVisitsPerDay: Math.max(0, visitsPerDay - ramp.capacityVisitsPerDay),
    };
  });
}

// ---------------------------------------------------------------------------
// Sensitivity: acquisition rate x visit frequency
// ---------------------------------------------------------------------------

export const ACQUISITION_LEVELS = [0.5, 1, 2, 3] as const;
export const FREQUENCY_LEVELS = [1, 1.5, 2, 2.5] as const;

export interface RampSensitivityCell {
  newPatientsPerWeek: number;
  visitsPerPatientPerWeek: number;
  firstEligibleMonth: number | null;
  monthReachesCapacity: number | null;
}

/** Deterministic grid — each cell is a full run of the ramp. */
export function rampSensitivity(
  i: FounderRampInputs,
  acquisition: readonly number[] = ACQUISITION_LEVELS,
  frequency: readonly number[] = FREQUENCY_LEVELS,
): RampSensitivityCell[] {
  const cells: RampSensitivityCell[] = [];
  for (const freq of frequency) {
    for (const acq of acquisition) {
      const run = founderRamp({
        ...i,
        growthMode: 'weekly',
        newPatientsPerWeek: acq,
        eiVisitsPerPatientPerWeek: freq,
        nonEiVisitsPerPatientPerWeek: freq,
        horizonMonths: 24,
        censusTarget: Number.POSITIVE_INFINITY,
      });
      cells.push({
        newPatientsPerWeek: acq,
        visitsPerPatientPerWeek: freq,
        firstEligibleMonth: run.firstEligibleMonth,
        monthReachesCapacity: run.monthCensusReachesCapacity,
      });
    }
  }
  return cells;
}

/** Plain-language summary built from actual model values, not adjectives. */
export function rampNarrative(i: FounderRampInputs): string {
  const ramp = founderRamp(i);
  if (ramp.incomplete) {
    return `The ramp cannot produce a timeline because required inputs are unknown: ${ramp.missingInputs.join('; ')}.`;
  }
  const last = ramp.months[ramp.months.length - 1];
  const util = Math.round(last.capacityUtilisation * 100);
  const eligible = ramp.firstEligibleMonth === null
    ? `Blue Star does not meet the selected transition criteria within ${ramp.months.length} months.`
    : `Blue Star first meets the selected transition criteria in month ${ramp.firstEligibleMonth}.`;
  return (
    `Blue Star starts with ${i.startingActivePatients} active patient`
    + `${i.startingActivePatients === 1 ? '' : 's'}. At the selected acquisition and visit-frequency `
    + `scenario values, the census reaches ${last.activePatients.toFixed(1)} by month ${last.month}, `
    + `which is ${util}% of modelled clinical capacity. ${eligible}`
  );
}

// ---------------------------------------------------------------------------
// Referral pipeline — structure only, deliberately unpopulated
// ---------------------------------------------------------------------------

export interface ReferralSource {
  id: string;
  name: string | null;
  referralVolumePerMonth: number | null;
  appropriatePatientsPerMonth: number | null;
  eiMixShare: number | null;
  expectedVisitsPerPatientPerWeek: number | null;
  expectedReimbursementPerVisit: number | null;
  geographicCluster: string | null;
  daysFromReferralToFirstVisit: number | null;
  expectedOngoingPatientVolume: number | null;
}

/**
 * Empty by design. Referral research is in progress (roadmap T-006); inventing
 * conversion rates here would put fabricated numbers directly into the growth
 * assumption the whole ramp depends on.
 */
export const referralSources: ReferralSource[] = [];

export const REFERRAL_FIELDS: { key: keyof ReferralSource; label: string }[] = [
  { key: 'name', label: 'Referral source' },
  { key: 'referralVolumePerMonth', label: 'Referral volume / month' },
  { key: 'appropriatePatientsPerMonth', label: 'Blue Star-appropriate patients / month' },
  { key: 'eiMixShare', label: 'EI / non-EI mix' },
  { key: 'expectedVisitsPerPatientPerWeek', label: 'Expected visits / patient / week' },
  { key: 'expectedReimbursementPerVisit', label: 'Expected reimbursement / visit' },
  { key: 'geographicCluster', label: 'Geographic clustering' },
  { key: 'daysFromReferralToFirstVisit', label: 'Days from referral to first visit' },
  { key: 'expectedOngoingPatientVolume', label: 'Expected ongoing patient volume' },
];

/** Open planning inputs that only Ellen can answer. */
export const ELLEN_QUESTIONS: string[] = [
  'How many visits per week does a typical EI patient receive?',
  'How many visits per week does a typical non-EI patient receive?',
  'Is the current 50/50 EI / non-EI mix actually closer to 45/55 or 55/45?',
  'How often do patients typically discharge?',
  'How much of the current 8-visit day is EI versus non-EI?',
  'What level of Blue Star owner compensation would actually replace the current job?',
  'How much cash would Ellen want Blue Star to have before transitioning?',
  'How quickly could a new referral typically become an active patient?',
];
