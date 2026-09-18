/**
 * Financial model. Pure functions, no hidden constants.
 *
 * Design rule: every computed value returns its inputs alongside its result, so
 * the UI can always show the working. And where an input is unknown, the model
 * returns null rather than substituting a default — a model that silently fills
 * in a missing salary produces confident nonsense.
 */

export interface ScenarioInputs {
  reimbursementPerVisit: number;
  visitsPerDay: number;
  /** TOTAL working days per year, scheduled clinical days plus makeup days. */
  workingDaysPerYear: number;
  /** Days per week carrying the regular caseload. */
  scheduledDaysPerWeek: number;
  /**
   * Days per week held for makeup visits. These recover cancellations rather
   * than adding new caseload capacity, which is why a cancelled visit is not
   * simply lost revenue.
   */
  makeupDaysPerWeek: number;
  cancellationRate: number;
  collectionRate: number;
  clinicianSalary: number | null;
  payrollBurdenRate: number;
  benefitsRate: number;
  mileageCostPerVisit: number;
  /** Non-clinician overhead, monthly. */
  fixedMonthlyOverhead: number;
  clinicianCount: number;
  /**
   * Patient-facing time is DERIVED from the visit mix rather than entered as a
   * single number — see weightedPatientFacingMinutes(). Early Intervention
   * visits run longer than everything else, so the mix is itself a capacity
   * lever, and a standalone average would hide that.
   */
  eiVisitMinutes: number;
  nonEiVisitMinutes: number;
  /** Share of visits that are Early Intervention (0..1). Non-EI is the complement. */
  eiMixShare: number;
  travelMinutesPerVisit: number;
  documentationMinutesPerVisit: number;
  /**
   * Length of the clinician workday. Previously hard-coded as the literal 480
   * minutes; making it editable is what allows a longer day to be an EXPLICIT
   * choice rather than an accident of the arithmetic.
   */
  workdayHours: number;
  /**
   * Fraction of documentation completed DURING the visit (0..1). This is the
   * hinge of the capacity model: documentation done inside the visit consumes
   * no extra workday time, documentation done afterwards extends the cycle.
   */
  documentationConcurrency: number;
  /**
   * Share of documentation done AFTER the workday (at home). This is real
   * labour, but it does not consume clinical capacity between 9 and 5, so it
   * must not reduce the visit ceiling. Whatever is neither concurrent nor
   * after-hours is the portion that genuinely extends the clinical day.
   */
  documentationAfterHoursShare: number;
  daysToCash: number;
}

// ---------------------------------------------------------------------------
// Visit cycle — the time arithmetic everything else rests on.
// ---------------------------------------------------------------------------

export interface VisitCycle {
  patientFacingMinutes: number;
  travelMinutes: number;
  /** Documentation that extends the clinical day (neither absorbed nor after-hours). */
  additionalDocumentationMinutes: number;
  /** Documentation absorbed into visits or natural downtime inside the workday. */
  concurrentDocumentationMinutes: number;
  /** Documentation done at home after the workday — real labour, but not 9-to-5 capacity. */
  afterHoursDocumentationMinutes: number;
  /** Total workday minutes consumed by one completed visit. */
  cycleMinutes: number;
  /** Clinical cycle plus after-hours documentation — total burden on the clinician. */
  totalClinicianMinutes: number;
}

/**
 * One visit's demand on the clinician's day.
 *
 * Ellen's observed baseline is the worked example: 45 minutes patient-facing +
 * 15 minutes travel = a 60-minute cycle, with her ~5 minutes of documentation
 * absorbed into the visit rather than added to it. That concurrency is exactly
 * why 8 visits close inside an 8-hour day; if the same documentation moved to
 * the evening the cycle would be 65 minutes and the day would run to 8.7 hours.
 */
/**
 * Weighted patient-facing minutes for the current visit mix.
 *
 * At Ellen's approximate 50/50 split of 60-minute EI visits and 30-minute
 * other visits this works out to 45 minutes — but 45 is the RESULT, never an
 * input. Shift the mix and the whole capacity model moves with it.
 */
export function weightedPatientFacingMinutes(i: ScenarioInputs): number {
  const eiShare = Math.min(1, Math.max(0, i.eiMixShare));
  return i.eiVisitMinutes * eiShare + i.nonEiVisitMinutes * (1 - eiShare);
}

export function visitCycle(i: ScenarioInputs): VisitCycle {
  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

  // Three-way split of documentation time. Ellen's reported workflow is that
  // 90% happens during visits or natural downtime and 10% happens at home
  // afterwards — which together account for all of it, leaving nothing that
  // extends the clinical day. The shares are capped so they can never exceed
  // the documentation time actually available.
  const concurrency = clamp01(i.documentationConcurrency);
  const afterHoursShare = Math.min(clamp01(i.documentationAfterHoursShare), 1 - concurrency);
  const scheduleExtendingShare = Math.max(0, 1 - concurrency - afterHoursShare);

  const doc = i.documentationMinutesPerVisit;
  const concurrentDocumentationMinutes = doc * concurrency;
  const afterHoursDocumentationMinutes = doc * afterHoursShare;
  const additionalDocumentationMinutes = doc * scheduleExtendingShare;

  const patientFacing = weightedPatientFacingMinutes(i);
  const cycleMinutes = patientFacing + i.travelMinutesPerVisit + additionalDocumentationMinutes;

  return {
    patientFacingMinutes: patientFacing,
    travelMinutes: i.travelMinutesPerVisit,
    concurrentDocumentationMinutes,
    afterHoursDocumentationMinutes,
    additionalDocumentationMinutes,
    cycleMinutes,
    totalClinicianMinutes: cycleMinutes + afterHoursDocumentationMinutes,
  };
}

export interface ScheduleFeasibility {
  requestedVisitsPerDay: number;
  /** Visits that actually fit the workday. Revenue is computed from THIS. */
  effectiveVisitsPerDay: number;
  maxVisitsPerDay: number;
  /**
   * Weekly ceiling. Days hold whole visits, but a caseload is carried over a
   * week, so the weekly figure is the honest constraint: flooring per day
   * discards the part-visit of slack each day leaves behind.
   */
  maxVisitsPerWeek: number;
  cycleMinutes: number;
  workdayMinutes: number;
  minutesRequired: number;
  feasible: boolean;
  /** True when the requested schedule was reduced to fit the day. */
  clamped: boolean;
  explanation: string;
}

/**
 * The guard that stops the model claiming impossible volume.
 *
 * Without this, asking for 12 one-hour cycles in an 8-hour day produces a
 * perfectly confident revenue figure for a schedule nobody can work. Revenue
 * is therefore computed from effectiveVisitsPerDay, never from the request,
 * and any reduction is reported rather than applied silently. The legitimate
 * way to raise the ceiling is to raise workdayHours — an explicit decision
 * about someone's working life, which is what it should be.
 */
export function scheduleFeasibility(i: ScenarioInputs): ScheduleFeasibility {
  const cycle = visitCycle(i);
  const workdayMinutes = i.workdayHours * 60;
  const maxVisitsPerDay = cycle.cycleMinutes > 0 ? Math.floor(workdayMinutes / cycle.cycleMinutes) : 0;
  const maxVisitsPerWeek = cycle.cycleMinutes > 0
    ? Math.floor((workdayMinutes * Math.max(0, i.scheduledDaysPerWeek)) / cycle.cycleMinutes)
    : 0;
  const requested = i.visitsPerDay;
  const effective = Math.min(requested, maxVisitsPerDay);
  const clamped = effective < requested;

  return {
    requestedVisitsPerDay: requested,
    effectiveVisitsPerDay: effective,
    maxVisitsPerDay,
    maxVisitsPerWeek,
    cycleMinutes: cycle.cycleMinutes,
    workdayMinutes,
    minutesRequired: requested * cycle.cycleMinutes,
    feasible: !clamped,
    clamped,
    explanation: clamped
      ? `${requested} visits/day needs ${Math.round(requested * cycle.cycleMinutes)} minutes but the workday is ` +
        `${workdayMinutes} minutes. Capped at ${maxVisitsPerDay} for all revenue and capacity figures. ` +
        `To schedule more, either shorten the ${Math.round(cycle.cycleMinutes)}-minute cycle or lengthen the workday explicitly.`
      : `${requested} visits/day fits: ${Math.round(requested * cycle.cycleMinutes)} of ${workdayMinutes} available minutes ` +
        `at a ${Math.round(cycle.cycleMinutes)}-minute cycle.`,
  };
}

export interface WeeklySchedule {
  scheduledDaysPerWeek: number;
  makeupDaysPerWeek: number;
  totalWorkingDaysPerWeek: number;
  workingWeeksPerYear: number;
  scheduledVisitsPerWeek: number;
  makeupCapacityPerWeek: number;
  cancelledPerWeek: number;
  /** Cancellations rescheduled into the makeup day. */
  recoveredPerWeek: number;
  completedPerWeek: number;
  /** Cancellation loss AFTER makeup recovery — often far below the raw rate. */
  effectiveCancellationRate: number;
  /** Makeup capacity left over once cancellations are absorbed. */
  spareMakeupCapacityPerWeek: number;
}

/**
 * The weekly shape of the clinical schedule.
 *
 * Ellen's week is four days of regular visits plus one makeup day. That makeup
 * day changes the economics of a cancellation: instead of losing the visit and
 * its revenue outright, the visit is rescheduled and delivered later in the
 * same week. So the effective cancellation rate is the portion that overflows
 * the makeup day, not the raw rate at which visits are cancelled.
 *
 * Working weeks per year are derived from the existing annual working-days
 * assumption divided across the full week, so PTO stays accounted for once.
 */
export function weeklySchedule(i: ScenarioInputs): WeeklySchedule {
  const scheduledDaysPerWeek = Math.max(0, i.scheduledDaysPerWeek);
  const makeupDaysPerWeek = Math.max(0, i.makeupDaysPerWeek);
  const totalWorkingDaysPerWeek = scheduledDaysPerWeek + makeupDaysPerWeek;
  const workingWeeksPerYear =
    totalWorkingDaysPerWeek > 0 ? i.workingDaysPerYear / totalWorkingDaysPerWeek : 0;

  const perDay = scheduleFeasibility(i).effectiveVisitsPerDay;
  const scheduledVisitsPerWeek = perDay * scheduledDaysPerWeek;
  const makeupCapacityPerWeek = perDay * makeupDaysPerWeek;

  const cancelledPerWeek = scheduledVisitsPerWeek * i.cancellationRate;
  const recoveredPerWeek = Math.min(cancelledPerWeek, makeupCapacityPerWeek);
  const completedPerWeek = scheduledVisitsPerWeek - cancelledPerWeek + recoveredPerWeek;

  return {
    scheduledDaysPerWeek,
    makeupDaysPerWeek,
    totalWorkingDaysPerWeek,
    workingWeeksPerYear,
    scheduledVisitsPerWeek,
    makeupCapacityPerWeek,
    cancelledPerWeek,
    recoveredPerWeek,
    completedPerWeek,
    effectiveCancellationRate:
      scheduledVisitsPerWeek > 0
        ? (cancelledPerWeek - recoveredPerWeek) / scheduledVisitsPerWeek
        : 0,
    spareMakeupCapacityPerWeek: makeupCapacityPerWeek - recoveredPerWeek,
  };
}

export interface CapacityVolume {
  visitsPerDay: number;
  visitsPerWeek: number;
  visitsPerMonth: number;
  visitsPerYear: number;
  /** Net of cancellations — what actually gets delivered and billed. */
  completedVisitsPerYear: number;
  patientFacingHoursPerWeek: number;
  travelHoursPerWeek: number;
  documentationHoursPerWeek: number;
  /** Documentation done at home, after the workday. Not 9-to-5 capacity, but real work. */
  afterHoursDocumentationMinutesPerDay: number;
  afterHoursDocumentationHoursPerWeek: number;
  /** Scheduled clinical hours plus after-hours documentation. */
  totalClinicianHoursPerWeek: number;
  /** Scheduled clinical days per week — the days visits are spread across. */
  workingDaysPerWeek: number;
}

/**
 * Visit volume per day / week / month / year for ONE clinician.
 *
 * Working days per week is derived from the existing workingDaysPerYear
 * assumption (annual days ÷ 52) rather than introduced as a separate number.
 * That keeps a single source of truth and means the figure is already net of
 * PTO and holidays — which is why it sits below a nominal 5-day week.
 */
export function capacityVolume(i: ScenarioInputs): CapacityVolume {
  const feas = scheduleFeasibility(i);
  const cycle = visitCycle(i);
  const perDay = feas.effectiveVisitsPerDay;

  const week = weeklySchedule(i);
  const workingDaysPerWeek = week.scheduledDaysPerWeek;
  const visitsPerWeek = week.scheduledVisitsPerWeek;
  const visitsPerYear = visitsPerWeek * week.workingWeeksPerYear;

  return {
    visitsPerDay: perDay,
    visitsPerWeek,
    visitsPerMonth: visitsPerYear / 12,
    visitsPerYear,
    // Net of cancellations AFTER the makeup day recovers what it can.
    completedVisitsPerYear: week.completedPerWeek * week.workingWeeksPerYear,
    patientFacingHoursPerWeek: (visitsPerWeek * cycle.patientFacingMinutes) / 60,
    travelHoursPerWeek: (visitsPerWeek * cycle.travelMinutes) / 60,
    documentationHoursPerWeek: (visitsPerWeek * i.documentationMinutesPerVisit) / 60,
    afterHoursDocumentationMinutesPerDay: perDay * cycle.afterHoursDocumentationMinutes,
    afterHoursDocumentationHoursPerWeek: (visitsPerWeek * cycle.afterHoursDocumentationMinutes) / 60,
    totalClinicianHoursPerWeek: (visitsPerWeek * cycle.totalClinicianMinutes) / 60,
    workingDaysPerWeek,
  };
}

export interface LoadedClinicianCost {
  salary: number;
  payrollTaxes: number;
  benefits: number;
  total: number;
  /** Cost per actually-completed visit, which is the number that matters. */
  costPerCompletedVisit: number | null;
  completedVisitsPerYear: number;
}

/**
 * Fully loaded clinician cost. Salary alone understates the real figure by
 * roughly 30%, which is why break-even calculated on salary is always wrong.
 */
export function loadedClinicianCost(i: ScenarioInputs): LoadedClinicianCost | null {
  if (i.clinicianSalary === null) return null;

  const salary = i.clinicianSalary;
  const payrollTaxes = salary * i.payrollBurdenRate;
  const benefits = salary * i.benefitsRate;
  const total = salary + payrollTaxes + benefits;

  // Effective, not requested: an impossible schedule must not lower the
  // apparent cost per visit by pretending the visits happened.
  const completedVisitsPerYear = capacityVolume(i).completedVisitsPerYear;

  return {
    salary,
    payrollTaxes,
    benefits,
    total,
    completedVisitsPerYear,
    costPerCompletedVisit: completedVisitsPerYear > 0 ? total / completedVisitsPerYear : null,
  };
}

export interface VisitEconomics {
  grossRevenue: number;
  collectedRevenue: number;
  clinicianCost: number | null;
  mileageCost: number;
  contributionMargin: number | null;
  marginPercent: number | null;
  /** Total clinician minutes consumed, including the unbillable parts. */
  totalMinutesConsumed: number;
  revenuePerClinicianHour: number;
}

/**
 * Economics of a single completed visit.
 *
 * Note what this reveals: under a flat per-visit rate, travel and documentation
 * minutes consume clinician capacity without generating any revenue at all.
 * Revenue per clinician hour is therefore the honest efficiency measure, not
 * revenue per visit.
 */
export function visitEconomics(i: ScenarioInputs): VisitEconomics {
  const grossRevenue = i.reimbursementPerVisit;
  const collectedRevenue = grossRevenue * i.collectionRate;

  const loaded = loadedClinicianCost(i);
  const clinicianCost = loaded?.costPerCompletedVisit ?? null;

  const totalMinutesConsumed = visitCycle(i).cycleMinutes;

  const contributionMargin =
    clinicianCost === null ? null : collectedRevenue - clinicianCost - i.mileageCostPerVisit;

  return {
    grossRevenue,
    collectedRevenue,
    clinicianCost,
    mileageCost: i.mileageCostPerVisit,
    contributionMargin,
    marginPercent:
      contributionMargin === null || collectedRevenue === 0
        ? null
        : (contributionMargin / collectedRevenue) * 100,
    totalMinutesConsumed,
    revenuePerClinicianHour: totalMinutesConsumed > 0 ? (collectedRevenue / totalMinutesConsumed) * 60 : 0,
  };
}

/**
 * Capacity check: does the assumed visits-per-day figure actually fit in a
 * working day? This catches the most common self-deception in therapy business
 * models — assuming a caseload that is physically impossible once travel and
 * documentation are counted.
 */
export function capacityCheck(i: ScenarioInputs): {
  minutesRequired: number;
  hoursRequired: number;
  feasibleInEightHourDay: boolean;
  maxVisitsInEightHours: number;
} {
  const feas = scheduleFeasibility(i);
  return {
    minutesRequired: feas.minutesRequired,
    hoursRequired: feas.minutesRequired / 60,
    feasibleInEightHourDay: feas.feasible,
    maxVisitsInEightHours: feas.maxVisitsPerDay,
  };
}

export interface AnnualModel {
  completedVisits: number;
  grossRevenue: number;
  collectedRevenue: number;
  clinicianCostTotal: number | null;
  mileageTotal: number;
  overheadTotal: number;
  operatingProfit: number | null;
  breakEvenVisitsPerYear: number | null;
  breakEvenVisitsPerClinicianPerDay: number | null;
  workingCapitalRequired: number | null;
}

/** Whole-business annual model at a given clinician count. */
export function annualModel(i: ScenarioInputs): AnnualModel {
  const loaded = loadedClinicianCost(i);

  // Volume is drawn from capacityVolume, which has already been clamped to what
  // fits the workday. Revenue can never be booked against an impossible schedule.
  const completedPerClinician = capacityVolume(i).completedVisitsPerYear;
  const completedVisits = completedPerClinician * i.clinicianCount;

  const grossRevenue = completedVisits * i.reimbursementPerVisit;
  const collectedRevenue = grossRevenue * i.collectionRate;
  const mileageTotal = completedVisits * i.mileageCostPerVisit;
  const overheadTotal = i.fixedMonthlyOverhead * 12;
  const clinicianCostTotal = loaded === null ? null : loaded.total * i.clinicianCount;

  const operatingProfit =
    clinicianCostTotal === null ? null : collectedRevenue - clinicianCostTotal - mileageTotal - overheadTotal;

  // Break-even: how many visits cover fixed overhead plus clinician cost, given
  // the contribution each visit makes after its own variable costs.
  let breakEvenVisitsPerYear: number | null = null;
  let breakEvenVisitsPerClinicianPerDay: number | null = null;

  if (clinicianCostTotal !== null) {
    const contributionPerVisit = i.reimbursementPerVisit * i.collectionRate - i.mileageCostPerVisit;
    const fixedCosts = overheadTotal + clinicianCostTotal;
    if (contributionPerVisit > 0) {
      breakEvenVisitsPerYear = fixedCosts / contributionPerVisit;
      // Effective, not requested: break-even expressed per day must not move
      // just because someone asked for a caseload the day cannot hold.
      const effectivePerDay = scheduleFeasibility(i).effectiveVisitsPerDay;
      const denom = effectivePerDay > 0
        ? (i.clinicianCount * capacityVolume(i).completedVisitsPerYear) / effectivePerDay
        : 0;
      if (denom > 0) breakEvenVisitsPerClinicianPerDay = breakEvenVisitsPerYear / denom;
    }
  }

  // Working capital: cash tied up in delivered-but-unpaid care. This is the
  // number that sinks otherwise-profitable healthcare startups.
  const dailyOperatingCost =
    clinicianCostTotal === null ? null : (clinicianCostTotal + mileageTotal + overheadTotal) / 365;
  const workingCapitalRequired = dailyOperatingCost === null ? null : dailyOperatingCost * i.daysToCash;

  return {
    completedVisits,
    grossRevenue,
    collectedRevenue,
    clinicianCostTotal,
    mileageTotal,
    overheadTotal,
    operatingProfit,
    breakEvenVisitsPerYear,
    breakEvenVisitsPerClinicianPerDay,
    workingCapitalRequired,
  };
}

/** Utilisation scenarios — low / typical / high visits per day. */
export function utilisationScenarios(base: ScenarioInputs): {
  label: string;
  visitsPerDay: number;
  model: AnnualModel;
  capacity: ReturnType<typeof capacityCheck>;
}[] {
  const variants: [string, number][] = [
    ['Low utilisation', Math.max(1, base.visitsPerDay - 2)],
    ['Typical utilisation', base.visitsPerDay],
    ['High utilisation', base.visitsPerDay + 2],
  ];
  return variants.map(([label, visitsPerDay]) => {
    const inputs = { ...base, visitsPerDay };
    return { label, visitsPerDay, model: annualModel(inputs), capacity: capacityCheck(inputs) };
  });
}

/** Travel-radius scenarios. Under flat per-visit pay, this is the big lever. */
export function travelScenarios(base: ScenarioInputs): {
  label: string;
  travelMinutes: number;
  capacity: ReturnType<typeof capacityCheck>;
  economics: VisitEconomics;
}[] {
  const variants: [string, number, number][] = [
    ['Tight radius', 15, base.mileageCostPerVisit * 0.6],
    ['Moderate radius', base.travelMinutesPerVisit, base.mileageCostPerVisit],
    ['Wide radius', 40, base.mileageCostPerVisit * 1.6],
  ];
  return variants.map(([label, travelMinutes, mileage]) => {
    const inputs = { ...base, travelMinutesPerVisit: travelMinutes, mileageCostPerVisit: mileage };
    return { label, travelMinutes, capacity: capacityCheck(inputs), economics: visitEconomics(inputs) };
  });
}

export interface ViabilityCheck {
  breakEvenVisitsPerDay: number | null;
  maxFeasibleVisitsPerDay: number;
  /** The question that matters: can the required caseload physically be done? */
  breakEvenIsAchievable: boolean | null;
  headroomVisitsPerDay: number | null;
  verdict: string;
  bindingConstraint: 'Time per visit' | 'Reimbursement' | 'Clinician cost' | 'None' | 'Unknown';
}

/**
 * Viability: does break-even fit inside a working day?
 *
 * This is the check that matters most in a flat per-visit business, and it is
 * the one most business plans never make. A model can show an attractive
 * margin per visit and still be impossible, because the caseload required to
 * cover fixed costs does not fit in the hours available once travel and
 * documentation are counted.
 */
export function viabilityCheck(i: ScenarioInputs): ViabilityCheck {
  const model = annualModel(i);
  const capacity = capacityCheck(i);
  const breakEven = model.breakEvenVisitsPerClinicianPerDay;

  if (breakEven === null) {
    return {
      breakEvenVisitsPerDay: null,
      maxFeasibleVisitsPerDay: capacity.maxVisitsInEightHours,
      breakEvenIsAchievable: null,
      headroomVisitsPerDay: null,
      verdict: 'Cannot assess — clinician cost is unknown. Establish AS-003 before trusting any profitability conclusion.',
      bindingConstraint: 'Unknown',
    };
  }

  const achievable = breakEven <= capacity.maxVisitsInEightHours;
  const headroom = capacity.maxVisitsInEightHours - breakEven;

  let bindingConstraint: ViabilityCheck['bindingConstraint'] = 'None';
  let verdict: string;

  if (!achievable) {
    // Work out which lever would close the gap most directly.
    const perVisitMinutes =
      weightedPatientFacingMinutes(i) + i.travelMinutesPerVisit + i.documentationMinutesPerVisit;
    const nonTreatmentShare =
      perVisitMinutes > 0
        ? (i.travelMinutesPerVisit + i.documentationMinutesPerVisit) / perVisitMinutes
        : 0;
    bindingConstraint = nonTreatmentShare > 0.35 ? 'Time per visit' : 'Clinician cost';
    verdict =
      `NOT VIABLE at these inputs. Break-even needs ${breakEven.toFixed(2)} visits/day but only ` +
      `${capacity.maxVisitsInEightHours} fit in an 8-hour day once travel and documentation are counted. ` +
      `${Math.round(nonTreatmentShare * 100)}% of each visit's time envelope is non-treatment time.`;
  } else {
    verdict =
      `Viable. Break-even is ${breakEven.toFixed(2)} visits/day against a ceiling of ` +
      `${capacity.maxVisitsInEightHours}, leaving ${headroom.toFixed(2)} visits/day of headroom.`;
  }

  return {
    breakEvenVisitsPerDay: breakEven,
    maxFeasibleVisitsPerDay: capacity.maxVisitsInEightHours,
    breakEvenIsAchievable: achievable,
    headroomVisitsPerDay: headroom,
    verdict,
    bindingConstraint,
  };
}

// ---------------------------------------------------------------------------
// Staffing scenarios
// ---------------------------------------------------------------------------

export interface StaffingScenario {
  id: string;
  label: string;
  clinicianCount: number;
  disciplines: string;
  visitsPerDay: number;
  visitsPerWeek: number;
  visitsPerMonth: number;
  completedVisitsPerYear: number;
  grossClinicalRevenue: number;
  collectedRevenue: number;
  clinicianCost: number | null;
  mileageCost: number;
  overhead: number;
  /** What is left for the business after clinical delivery is paid for. */
  remainingForOverheadAndMargin: number | null;
  operatingMargin: number | null;
  marginPercent: number | null;
  travelHoursPerWeek: number;
  documentationHoursPerWeek: number;
  patientFacingHoursPerWeek: number;
  feasible: boolean;
}

const STAFFING_LADDER: { id: string; label: string; count: number; disciplines: string }[] = [
  { id: 'S-1', label: 'Ellen only', count: 1, disciplines: 'PT' },
  { id: 'S-2', label: 'Ellen + 1 PT', count: 2, disciplines: 'PT' },
  { id: 'S-3', label: 'Ellen + 2 PTs', count: 3, disciplines: 'PT' },
  { id: 'S-4', label: '3 PTs', count: 3, disciplines: 'PT' },
  { id: 'S-5', label: '5 PTs', count: 5, disciplines: 'PT' },
  { id: 'S-6', label: 'PT / OT / ST expansion (6 clinicians)', count: 6, disciplines: 'PT + OT + ST' },
];

/**
 * Staffing scenarios built from the SAME productivity assumptions as everything
 * else, so changing the visit cycle flows straight through to every headcount.
 *
 * IMPORTANT: these are FULL-PRODUCTIVITY UPPER BOUNDS. Every clinician is
 * modelled at Ellen's observed baseline, which a new hire will not match on day
 * one. The ramp assumption (AS-016) is deliberately null rather than invented,
 * so these figures should be read as ceilings, not forecasts.
 */
export function staffingScenarios(base: ScenarioInputs): StaffingScenario[] {
  return STAFFING_LADDER.map((rung) => {
    const inputs: ScenarioInputs = { ...base, clinicianCount: rung.count };
    const volume = capacityVolume(inputs);
    const feas = scheduleFeasibility(inputs);
    const model = annualModel(inputs);
    const loaded = loadedClinicianCost(inputs);

    const clinicianCost = loaded === null ? null : loaded.total * rung.count;
    const grossClinicalRevenue = volume.completedVisitsPerYear * rung.count * base.reimbursementPerVisit;
    const collectedRevenue = grossClinicalRevenue * base.collectionRate;
    const mileageCost = volume.completedVisitsPerYear * rung.count * base.mileageCostPerVisit;
    const overhead = base.fixedMonthlyOverhead * 12;

    const remaining = clinicianCost === null ? null : collectedRevenue - clinicianCost - mileageCost;

    return {
      id: rung.id,
      label: rung.label,
      clinicianCount: rung.count,
      disciplines: rung.disciplines,
      visitsPerDay: volume.visitsPerDay * rung.count,
      visitsPerWeek: volume.visitsPerWeek * rung.count,
      visitsPerMonth: volume.visitsPerMonth * rung.count,
      completedVisitsPerYear: volume.completedVisitsPerYear * rung.count,
      grossClinicalRevenue,
      collectedRevenue,
      clinicianCost,
      mileageCost,
      overhead,
      remainingForOverheadAndMargin: remaining,
      operatingMargin: model.operatingProfit,
      marginPercent:
        model.operatingProfit === null || collectedRevenue === 0
          ? null
          : (model.operatingProfit / collectedRevenue) * 100,
      travelHoursPerWeek: volume.travelHoursPerWeek * rung.count,
      documentationHoursPerWeek: volume.documentationHoursPerWeek * rung.count,
      patientFacingHoursPerWeek: volume.patientFacingHoursPerWeek * rung.count,
      feasible: feas.feasible,
    };
  });
}

/** Revenue decomposition, so "8 × rate" is never mistaken for clinician economics. */
export interface RevenueBreakdown {
  completedVisitsPerYear: number;
  grossClinicalRevenue: number;
  collectedRevenue: number;
  collectionLoss: number;
  clinicianCompensation: number | null;
  mileage: number;
  remainingForOverheadAndMargin: number | null;
  overhead: number;
  operatingMargin: number | null;
}

export function revenueBreakdown(i: ScenarioInputs): RevenueBreakdown {
  const volume = capacityVolume(i);
  const loaded = loadedClinicianCost(i);
  const completed = volume.completedVisitsPerYear * i.clinicianCount;

  const gross = completed * i.reimbursementPerVisit;
  const collected = gross * i.collectionRate;
  const mileage = completed * i.mileageCostPerVisit;
  const comp = loaded === null ? null : loaded.total * i.clinicianCount;
  const overhead = i.fixedMonthlyOverhead * 12;
  const remaining = comp === null ? null : collected - comp - mileage;

  return {
    completedVisitsPerYear: completed,
    grossClinicalRevenue: gross,
    collectedRevenue: collected,
    collectionLoss: gross - collected,
    clinicianCompensation: comp,
    mileage,
    remainingForOverheadAndMargin: remaining,
    overhead,
    operatingMargin: remaining === null ? null : remaining - overhead,
  };
}

// ---------------------------------------------------------------------------
// Documentation concurrency sensitivity
// ---------------------------------------------------------------------------

/**
 * Documentation concurrency is the share of documentation time that can be
 * absorbed into the existing clinical and travel workflow rather than becoming
 * ADDITIONAL schedule time. It is not a claim that notes are literally typed
 * while treating a child — only that the minutes do not extend the working day.
 */
export const CONCURRENCY_LEVELS = [1, 0.9, 0.75, 0.5, 0.25, 0] as const;

export type CapacityVsBreakEven =
  | 'Capacity exceeds break-even requirement'
  | 'Exactly at capacity'
  | 'Not feasible'
  | 'Unknown';

export interface ConcurrencyScenario {
  concurrency: number;
  label: string;
  /** Minutes of documentation that spill outside the workflow and extend the day. */
  additionalDocumentationMinutes: number;
  cycleMinutes: number;
  maxVisitsPerDay: number;
  workdayMinutes: number;

  // --- diagnostic for the observed baseline visits/day ---
  baselineVisitsPerDay: number;
  baselineMinutesRequired: number;
  baselineOverageMinutes: number;
  baselineDayCloses: boolean;

  // --- interaction with the financial model ---
  breakEvenVisitsPerDay: number | null;
  breakEvenIsAchievable: boolean | null;
  capacityVsBreakEven: CapacityVsBreakEven;

  // --- downstream consequence, through the normal clamped path ---
  effectiveVisitsPerDay: number;
  completedVisitsPerYear: number;
  collectedRevenue: number;
}

/**
 * Sensitivity of the whole model to documentation concurrency.
 *
 * Every row is produced by running the SAME pipeline the rest of the app uses
 * — visitCycle -> scheduleFeasibility -> capacityVolume -> annualModel — with
 * only the concurrency input varied. There is deliberately no second, simpler
 * formula here: a shortcut would be able to disagree with the real model.
 *
 * @param baselineVisitsPerDay the visits/day to diagnose (Ellen's observed 8).
 */
export function documentationSensitivity(
  base: ScenarioInputs,
  levels: readonly number[] = CONCURRENCY_LEVELS,
  baselineVisitsPerDay: number = base.visitsPerDay,
): ConcurrencyScenario[] {
  return levels.map((concurrency) => {
    const inputs: ScenarioInputs = { ...base, documentationConcurrency: concurrency };
    const cycle = visitCycle(inputs);
    const feas = scheduleFeasibility(inputs);
    const viability = viabilityCheck(inputs);
    const volume = capacityVolume(inputs);
    const model = annualModel(inputs);

    const baselineMinutesRequired = baselineVisitsPerDay * cycle.cycleMinutes;
    const overage = baselineMinutesRequired - feas.workdayMinutes;

    const breakEven = viability.breakEvenVisitsPerDay;
    let capacityVsBreakEven: CapacityVsBreakEven = 'Unknown';
    if (breakEven !== null) {
      if (breakEven > feas.maxVisitsPerDay) capacityVsBreakEven = 'Not feasible';
      else if (Math.abs(breakEven - feas.maxVisitsPerDay) < 1e-9) capacityVsBreakEven = 'Exactly at capacity';
      else capacityVsBreakEven = 'Capacity exceeds break-even requirement';
    }

    return {
      concurrency,
      label: `${Math.round(concurrency * 100)}%`,
      additionalDocumentationMinutes: cycle.additionalDocumentationMinutes,
      cycleMinutes: cycle.cycleMinutes,
      maxVisitsPerDay: feas.maxVisitsPerDay,
      workdayMinutes: feas.workdayMinutes,

      baselineVisitsPerDay,
      baselineMinutesRequired,
      baselineOverageMinutes: Math.max(0, overage),
      baselineDayCloses: baselineMinutesRequired <= feas.workdayMinutes,

      breakEvenVisitsPerDay: breakEven,
      breakEvenIsAchievable: viability.breakEvenIsAchievable,
      capacityVsBreakEven,

      effectiveVisitsPerDay: feas.effectiveVisitsPerDay,
      completedVisitsPerYear: volume.completedVisitsPerYear,
      collectedRevenue: model.collectedRevenue,
    };
  });
}

/**
 * The highest concurrency at which the baseline visits/day STOPS fitting the
 * workday, found by binary search against the real model rather than by
 * rearranging the formula by hand.
 *
 * Returns null when the day closes at every level (nothing to find) or fails
 * at every level (no threshold within range).
 */
export function concurrencyThreshold(
  base: ScenarioInputs,
  baselineVisitsPerDay: number = base.visitsPerDay,
): { threshold: number; closesAtFullConcurrency: boolean; closesAtZeroConcurrency: boolean } | null {
  const closes = (c: number) => {
    const inputs: ScenarioInputs = { ...base, documentationConcurrency: c };
    return baselineVisitsPerDay * visitCycle(inputs).cycleMinutes <= scheduleFeasibility(inputs).workdayMinutes;
  };

  const atFull = closes(1);
  const atZero = closes(0);
  if (atFull === atZero) return null;

  // Monotonic in concurrency, so bisect for the crossing point.
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (closes(mid)) hi = mid;
    else lo = mid;
  }
  return { threshold: hi, closesAtFullConcurrency: atFull, closesAtZeroConcurrency: atZero };
}


// ---------------------------------------------------------------------------
// Visit mix sensitivity
// ---------------------------------------------------------------------------

/** EI share levels for the sweep. Ellen's approximate current mix is 50%. */
/** Includes Ellen's observed ~33% EI visit share so the real point appears. */
export const EI_MIX_LEVELS = [0, 0.25, 1 / 3, 0.5, 0.75, 1] as const;

export interface VisitMixScenario {
  eiMixShare: number;
  label: string;
  nonEiMixShare: number;
  weightedPatientFacingMinutes: number;
  cycleMinutes: number;
  maxVisitsPerDay: number;
  workdayMinutes: number;

  baselineVisitsPerDay: number;
  baselineMinutesRequired: number;
  baselineOverageMinutes: number;
  baselineDayCloses: boolean;

  breakEvenVisitsPerDay: number | null;
  breakEvenIsAchievable: boolean | null;
  capacityVsBreakEven: CapacityVsBreakEven;

  effectiveVisitsPerDay: number;
  completedVisitsPerYear: number;
  collectedRevenue: number;
  operatingProfit: number | null;
}

/**
 * Sensitivity of the model to the Early Intervention share of the caseload.
 *
 * Like the documentation sweep, every row runs the SAME pipeline the rest of
 * the app uses, varying only the mix. This matters more than it might appear:
 * because reimbursement is flat per visit, a longer visit earns no more but
 * consumes more of the day, so shifting toward EI trades volume for nothing.
 */
export function visitMixSensitivity(
  base: ScenarioInputs,
  levels: readonly number[] = EI_MIX_LEVELS,
  baselineVisitsPerDay: number = base.visitsPerDay,
): VisitMixScenario[] {
  return levels.map((eiMixShare) => {
    const inputs: ScenarioInputs = { ...base, eiMixShare };
    const cycle = visitCycle(inputs);
    const feas = scheduleFeasibility(inputs);
    const viability = viabilityCheck(inputs);
    const volume = capacityVolume(inputs);
    const model = annualModel(inputs);

    const baselineMinutesRequired = baselineVisitsPerDay * cycle.cycleMinutes;
    const breakEven = viability.breakEvenVisitsPerDay;

    let capacityVsBreakEven: CapacityVsBreakEven = 'Unknown';
    if (breakEven !== null) {
      if (breakEven > feas.maxVisitsPerDay) capacityVsBreakEven = 'Not feasible';
      else if (Math.abs(breakEven - feas.maxVisitsPerDay) < 1e-9) capacityVsBreakEven = 'Exactly at capacity';
      else capacityVsBreakEven = 'Capacity exceeds break-even requirement';
    }

    return {
      eiMixShare,
      label: `${Math.round(eiMixShare * 100)}% EI`,
      nonEiMixShare: 1 - eiMixShare,
      weightedPatientFacingMinutes: cycle.patientFacingMinutes,
      cycleMinutes: cycle.cycleMinutes,
      maxVisitsPerDay: feas.maxVisitsPerDay,
      workdayMinutes: feas.workdayMinutes,

      baselineVisitsPerDay,
      baselineMinutesRequired,
      baselineOverageMinutes: Math.max(0, baselineMinutesRequired - feas.workdayMinutes),
      baselineDayCloses: baselineMinutesRequired <= feas.workdayMinutes,

      breakEvenVisitsPerDay: breakEven,
      breakEvenIsAchievable: viability.breakEvenIsAchievable,
      capacityVsBreakEven,

      effectiveVisitsPerDay: feas.effectiveVisitsPerDay,
      completedVisitsPerYear: volume.completedVisitsPerYear,
      collectedRevenue: model.collectedRevenue,
      operatingProfit: model.operatingProfit,
    };
  });
}
