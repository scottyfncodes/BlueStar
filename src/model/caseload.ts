import { observedCaseload, statedTotals, type CaseloadCohort } from '../data/caseload';

export interface CohortBreakdown extends CaseloadCohort {
  visitsPerWeek: number;
  patientFacingMinutesPerWeek: number;
  shareOfVisits: number;
  shareOfPatients: number;
}

export interface CaseloadComposition {
  cohorts: CohortBreakdown[];
  totalPatients: number;
  totalVisitsPerWeek: number;
  totalPatientFacingMinutesPerWeek: number;

  /** Weighted patient-facing minutes — DERIVED from the cohort mix. */
  weightedVisitMinutes: number;

  /**
   * EI share of VISITS. This is what drives visit duration, because duration is
   * a property of each visit.
   */
  eiVisitShare: number;
  /**
   * EI share of PATIENTS. Different from the visit share whenever the two types
   * are seen at different frequencies — which they are. A census model must use
   * this one, not the visit share.
   */
  eiPatientShare: number;

  eiVisitsPerPatientPerWeek: number;
  nonEiVisitsPerPatientPerWeek: number;
  eiPatients: number;
  nonEiPatients: number;

  /** Reconciliation against the separately stated totals. */
  statedPatients: number;
  statedVisitsPerWeek: number;
  patientCountGap: number;
  visitCountGap: number;
  reconciles: boolean;
}

/**
 * Derives every caseload figure from the observed cohorts.
 *
 * The distinction this makes explicit: the EI share of VISITS and the EI share
 * of PATIENTS are different numbers whenever the two groups are seen at
 * different frequencies. Ellen's EI children are seen weekly while a third of
 * her non-EI children are seen twice weekly, so EI is 33% of her visits but 44%
 * of her patients. Using the visit share where the patient share belongs (or
 * vice versa) silently misstates capacity.
 */
export function caseloadComposition(
  cohorts: CaseloadCohort[] = observedCaseload,
): CaseloadComposition {
  const totalPatients = cohorts.reduce((a, c) => a + c.patients, 0);
  const totalVisitsPerWeek = cohorts.reduce((a, c) => a + c.patients * c.visitsPerPatientPerWeek, 0);
  const totalPatientFacingMinutesPerWeek = cohorts.reduce(
    (a, c) => a + c.patients * c.visitsPerPatientPerWeek * c.visitMinutes, 0,
  );

  const ei = cohorts.filter((c) => c.isEarlyIntervention);
  const nonEi = cohorts.filter((c) => !c.isEarlyIntervention);

  const eiPatients = ei.reduce((a, c) => a + c.patients, 0);
  const nonEiPatients = nonEi.reduce((a, c) => a + c.patients, 0);
  const eiVisits = ei.reduce((a, c) => a + c.patients * c.visitsPerPatientPerWeek, 0);
  const nonEiVisits = nonEi.reduce((a, c) => a + c.patients * c.visitsPerPatientPerWeek, 0);

  const breakdown: CohortBreakdown[] = cohorts.map((c) => {
    const visitsPerWeek = c.patients * c.visitsPerPatientPerWeek;
    return {
      ...c,
      visitsPerWeek,
      patientFacingMinutesPerWeek: visitsPerWeek * c.visitMinutes,
      shareOfVisits: totalVisitsPerWeek > 0 ? visitsPerWeek / totalVisitsPerWeek : 0,
      shareOfPatients: totalPatients > 0 ? c.patients / totalPatients : 0,
    };
  });

  return {
    cohorts: breakdown,
    totalPatients,
    totalVisitsPerWeek,
    totalPatientFacingMinutesPerWeek,
    weightedVisitMinutes:
      totalVisitsPerWeek > 0 ? totalPatientFacingMinutesPerWeek / totalVisitsPerWeek : 0,
    eiVisitShare: totalVisitsPerWeek > 0 ? eiVisits / totalVisitsPerWeek : 0,
    eiPatientShare: totalPatients > 0 ? eiPatients / totalPatients : 0,
    eiVisitsPerPatientPerWeek: eiPatients > 0 ? eiVisits / eiPatients : 0,
    nonEiVisitsPerPatientPerWeek: nonEiPatients > 0 ? nonEiVisits / nonEiPatients : 0,
    eiPatients,
    nonEiPatients,
    statedPatients: statedTotals.patients,
    statedVisitsPerWeek: statedTotals.visitsPerWeek,
    patientCountGap: totalPatients - statedTotals.patients,
    visitCountGap: totalVisitsPerWeek - statedTotals.visitsPerWeek,
    reconciles:
      totalPatients === statedTotals.patients && totalVisitsPerWeek === statedTotals.visitsPerWeek,
  };
}

export { observedCaseload, statedTotals };
export type { CaseloadCohort };
