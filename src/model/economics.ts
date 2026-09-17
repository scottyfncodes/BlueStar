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
  workingDaysPerYear: number;
  cancellationRate: number;
  collectionRate: number;
  clinicianSalary: number | null;
  payrollBurdenRate: number;
  benefitsRate: number;
  mileageCostPerVisit: number;
  /** Non-clinician overhead, monthly. */
  fixedMonthlyOverhead: number;
  clinicianCount: number;
  /** Minutes — used for capacity reasoning, not revenue, under flat per-visit pay. */
  visitLengthMinutes: number;
  travelMinutesPerVisit: number;
  documentationMinutesPerVisit: number;
  daysToCash: number;
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

  const scheduled = i.visitsPerDay * i.workingDaysPerYear;
  const completedVisitsPerYear = scheduled * (1 - i.cancellationRate);

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

  const totalMinutesConsumed =
    i.visitLengthMinutes + i.travelMinutesPerVisit + i.documentationMinutesPerVisit;

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
  const perVisit = i.visitLengthMinutes + i.travelMinutesPerVisit + i.documentationMinutesPerVisit;
  const minutesRequired = perVisit * i.visitsPerDay;
  return {
    minutesRequired,
    hoursRequired: minutesRequired / 60,
    feasibleInEightHourDay: minutesRequired <= 480,
    maxVisitsInEightHours: perVisit > 0 ? Math.floor(480 / perVisit) : 0,
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

  const scheduledPerClinician = i.visitsPerDay * i.workingDaysPerYear;
  const completedPerClinician = scheduledPerClinician * (1 - i.cancellationRate);
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
      const denom = i.clinicianCount * i.workingDaysPerYear * (1 - i.cancellationRate);
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
      i.visitLengthMinutes + i.travelMinutesPerVisit + i.documentationMinutesPerVisit;
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
