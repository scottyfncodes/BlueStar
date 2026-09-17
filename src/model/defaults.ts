import type { ScenarioInputs } from './economics';
import { assumptionValue } from '../data/assumptions';

/**
 * The default scenario is assembled FROM the assumption register, so the
 * simulator and the register can never drift apart. Where an assumption is
 * null, it stays null and the model reports what it cannot compute.
 */
export function defaultScenario(): ScenarioInputs {
  return {
    reimbursementPerVisit: assumptionValue('AS-001') ?? 0,
    visitsPerDay: assumptionValue('AS-002') ?? 5,
    workingDaysPerYear: assumptionValue('AS-012') ?? 230,
    cancellationRate: assumptionValue('AS-005') ?? 0.15,
    collectionRate: assumptionValue('AS-008') ?? 0.93,
    clinicianSalary: assumptionValue('AS-003'), // deliberately null — see AS-003
    payrollBurdenRate: assumptionValue('AS-004') ?? 0.115,
    benefitsRate: assumptionValue('AS-011') ?? 0.18,
    mileageCostPerVisit: assumptionValue('AS-010') ?? 12,
    fixedMonthlyOverhead: 500,
    clinicianCount: 1,
    visitLengthMinutes: 60,
    travelMinutesPerVisit: assumptionValue('AS-006') ?? 25,
    documentationMinutesPerVisit: assumptionValue('AS-007') ?? 15,
    daysToCash: assumptionValue('AS-009') ?? 45,
  };
}

/**
 * Salary values to TEST WITH when AS-003 is null. These are explicitly labelled
 * as test points spanning the conflicting source range — not estimates, and not
 * a substitute for finding the real number.
 */
export const SALARY_TEST_POINTS = [
  { label: 'Low source (Salary.com pediatric PT Denver)', value: 78825 },
  { label: 'Mid source (Salary.com home health PT Denver)', value: 113401 },
  { label: 'High source (Glassdoor pediatric PT Colorado)', value: 135278 },
];
