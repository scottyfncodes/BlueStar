import type { ScenarioInputs } from './economics';

/**
 * Month-by-month cash calendar. The point of this model is to find the month
 * where cash pressure peaks — which is almost never month one, and is usually
 * later than founders expect, because revenue ramps while costs start at full
 * rate.
 */
export interface CashMonth {
  month: number;
  label: string;
  phase: string;
  cashOut: number;
  cashIn: number;
  netMovement: number;
  cumulativeCash: number;
  notes: string[];
}

export interface CashCalendar {
  months: CashMonth[];
  troughMonth: number;
  troughBalance: number;
  minimumCapitalToSurvive: number;
  monthsToPositiveCashFlow: number | null;
}

export interface CashCalendarInputs {
  scenario: ScenarioInputs;
  oneTimeStartup: number;
  monthlyOverhead: number;
  /** Months before the first patient is seen (licensure, enrollment). */
  preRevenueMonths: number;
  /** Months from first patient to full caseload. */
  rampMonths: number;
  startingCash: number;
  horizonMonths: number;
}

export function cashCalendar(input: CashCalendarInputs): CashCalendar {
  const { scenario: s } = input;
  const months: CashMonth[] = [];

  const monthlyClinicianCost =
    s.clinicianSalary === null
      ? 0
      : (s.clinicianSalary * (1 + s.payrollBurdenRate + s.benefitsRate) * s.clinicianCount) / 12;

  const fullMonthlyVisits =
    ((s.visitsPerDay * s.workingDaysPerYear) / 12) * (1 - s.cancellationRate) * s.clinicianCount;

  // Revenue earned in a month is collected daysToCash later.
  const collectionLagMonths = Math.max(0, Math.round(s.daysToCash / 30));

  const earnedByMonth: number[] = [];

  for (let m = 1; m <= input.horizonMonths; m++) {
    const notes: string[] = [];
    let cashOut = input.monthlyOverhead;
    let phase: string;

    const isPreRevenue = m <= input.preRevenueMonths;

    if (isPreRevenue) {
      phase = 'Pre-revenue';
      notes.push('Licensure / enrollment period — costs run, no care delivered');
    } else {
      const monthsSinceStart = m - input.preRevenueMonths;
      phase = monthsSinceStart <= input.rampMonths ? 'Ramp' : 'Steady state';
      // Clinician payroll begins when care begins.
      cashOut += monthlyClinicianCost;
    }

    if (m === 1) {
      cashOut += input.oneTimeStartup;
      notes.push('One-time startup costs');
    }

    // Caseload ramps linearly from zero to full over rampMonths.
    let visitsThisMonth = 0;
    if (!isPreRevenue) {
      const monthsSinceStart = m - input.preRevenueMonths;
      const rampFactor =
        input.rampMonths <= 0 ? 1 : Math.min(1, monthsSinceStart / input.rampMonths);
      visitsThisMonth = fullMonthlyVisits * rampFactor;
      cashOut += visitsThisMonth * s.mileageCostPerVisit;
    }

    const earned = visitsThisMonth * s.reimbursementPerVisit * s.collectionRate;
    earnedByMonth[m] = earned;

    const collectedThisMonth = earnedByMonth[m - collectionLagMonths] ?? 0;
    if (collectedThisMonth > 0 && collectionLagMonths > 0) {
      notes.push(`Collecting revenue earned in month ${m - collectionLagMonths}`);
    }

    const netMovement = collectedThisMonth - cashOut;
    const prev = months[months.length - 1]?.cumulativeCash ?? input.startingCash;

    months.push({
      month: m,
      label: `Month ${m}`,
      phase,
      cashOut,
      cashIn: collectedThisMonth,
      netMovement,
      cumulativeCash: prev + netMovement,
      notes,
    });
  }

  let troughMonth = 1;
  let troughBalance = months[0]?.cumulativeCash ?? 0;
  for (const m of months) {
    if (m.cumulativeCash < troughBalance) {
      troughBalance = m.cumulativeCash;
      troughMonth = m.month;
    }
  }

  const firstPositive = months.find(
    (m) => m.netMovement > 0 && m.month > input.preRevenueMonths,
  );

  return {
    months,
    troughMonth,
    troughBalance,
    // If the trough goes below zero, that shortfall is capital you must have had.
    minimumCapitalToSurvive:
      troughBalance < 0 ? input.startingCash + Math.abs(troughBalance) : input.startingCash,
    monthsToPositiveCashFlow: firstPositive ? firstPositive.month : null,
  };
}
