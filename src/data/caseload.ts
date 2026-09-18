/**
 * Ellen's observed caseload composition, reported 2026-09-18.
 *
 * This is the real schedule, cohort by cohort. It replaces several estimates at
 * once — visit frequency, EI share, and the weighted visit length were all
 * previously unknown or assumed, and all three fall out of this table.
 */
export interface CaseloadCohort {
  id: string;
  label: string;
  patients: number;
  visitsPerPatientPerWeek: number;
  visitMinutes: number;
  /** 60-minute visits are Early Intervention; 30-minute visits are not. */
  isEarlyIntervention: boolean;
}

export const observedCaseload: CaseloadCohort[] = [
  {
    id: 'CH-1',
    label: 'Weekly, 30 minutes',
    patients: 6,
    visitsPerPatientPerWeek: 1,
    visitMinutes: 30,
    isEarlyIntervention: false,
  },
  {
    id: 'CH-2',
    label: 'Twice weekly, 30 minutes',
    patients: 8,
    visitsPerPatientPerWeek: 2,
    visitMinutes: 30,
    isEarlyIntervention: false,
  },
  {
    id: 'CH-3',
    label: 'Weekly, 60 minutes (Early Intervention)',
    patients: 11,
    visitsPerPatientPerWeek: 1,
    visitMinutes: 60,
    isEarlyIntervention: true,
  },
];

/**
 * Figures Ellen stated alongside the cohort breakdown. They do not quite
 * reconcile with the cohorts, and the model reports the gap rather than
 * quietly picking a side.
 */
export const statedTotals = {
  patients: 23,
  visitsPerWeek: 32,
  visitsPerDay: 8,
} as const;
