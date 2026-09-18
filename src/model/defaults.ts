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
    visitsPerDay: assumptionValue('AS-002') ?? 8,
    workingDaysPerYear: assumptionValue('AS-012') ?? 230,
    cancellationRate: assumptionValue('AS-005') ?? 0.15,
    collectionRate: assumptionValue('AS-008') ?? 0.93,
    clinicianSalary: assumptionValue('AS-003'), // deliberately null — see AS-003
    payrollBurdenRate: assumptionValue('AS-004') ?? 0.115,
    benefitsRate: assumptionValue('AS-011') ?? 0.18,
    mileageCostPerVisit: assumptionValue('AS-010') ?? 12,
    fixedMonthlyOverhead: 500,
    clinicianCount: 1,
    // Previously hard-coded at 60 with no assumption behind it — now sourced
    // from Ellen's observed baseline like every other productivity input.
    eiVisitMinutes: assumptionValue('AS-013') ?? 60,
    nonEiVisitMinutes: assumptionValue('AS-018') ?? 30,
    eiMixShare: assumptionValue('AS-019') ?? 0.5,
    travelMinutesPerVisit: assumptionValue('AS-006') ?? 15,
    documentationMinutesPerVisit: assumptionValue('AS-007') ?? 5,
    workdayHours: assumptionValue('AS-014') ?? 8,
    documentationConcurrency: assumptionValue('AS-015') ?? 0.9,
    documentationAfterHoursShare: assumptionValue('AS-017') ?? 0.1,
    daysToCash: assumptionValue('AS-009') ?? 45,
  };
}

/**
 * Salary values to TEST WITH when AS-003 is null. These are explicitly labelled
 * as test points spanning the conflicting source range — not estimates, and not
 * a substitute for finding the real number.
 */
/**
 * Ellen's observed baseline, held separately so the UI can show it beside the
 * editable model inputs. This is ONE clinician's real workload, not a target.
 */
export const ELLEN_BASELINE = {
  label: "Ellen's current observed baseline",
  caveat:
    'A real-world starting point for modelling — not an industry productivity standard, and not a target for other clinicians.',
  visitsPerDay: 8,
  workdayHours: 8,
  workdaySpan: '9:00am - 5:00pm',
  eiVisitMinutes: 60,
  nonEiVisitMinutes: 30,
  eiMixShare: 0.5,
  /** Derived from the mix above, never entered directly. */
  patientFacingMinutes: 45,
  travelMinutes: 15,
  documentationMinutes: 5,
  documentationInWorkdayShare: 0.9,
  documentationAfterHoursShare: 0.1,
  documentationTiming:
    '90% completed during visits or natural workday downtime, 10% completed at home after work',
  /** Context only — the EMR Ellen currently uses. Not a cause of the 90/10 split. */
  emr: 'StateWise',
  cycleMinutes: 60,
  evidenceId: 'EV-026',
} as const;

export const SALARY_TEST_POINTS = [
  { label: 'Low source (Salary.com pediatric PT Denver)', value: 78825 },
  { label: 'Mid source (Salary.com home health PT Denver)', value: 113401 },
  { label: 'High source (Glassdoor pediatric PT Colorado)', value: 135278 },
];
