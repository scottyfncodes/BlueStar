import { useState } from 'react';
import { Card, Stat, Callout, Table, money, num, pct } from '../components/ui';
import {
  annualModel, visitEconomics, capacityCheck, viabilityCheck,
  utilisationScenarios, travelScenarios, visitCycle, scheduleFeasibility,
  capacityVolume, revenueBreakdown, documentationSensitivity, concurrencyThreshold,
  CONCURRENCY_LEVELS, visitMixSensitivity, weightedPatientFacingMinutes, EI_MIX_LEVELS,
  type ScenarioInputs,
} from '../model/economics';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';

function Slider({
  label, value, min, max, step, onChange, format, source,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string; source: string;
}) {
  return (
    <div className="ctl">
      <label><span>{label}</span><span>{format(value)}</span></label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
      <div className="src">{source}</div>
    </div>
  );
}

export function Simulator() {
  const base = defaultScenario();
  // Start from a test point so the simulator can run; the banner keeps this honest.
  const [s, setS] = useState<ScenarioInputs>({ ...base, clinicianSalary: SALARY_TEST_POINTS[1].value });
  const set = (patch: Partial<ScenarioInputs>) => setS((prev) => ({ ...prev, ...patch }));

  const model = annualModel(s);
  const visit = visitEconomics(s);
  const cycle = visitCycle(s);
  const feas = scheduleFeasibility(s);
  const volume = capacityVolume(s);
  const revenue = revenueBreakdown(s);
  const baselineVisits = ELLEN_BASELINE.visitsPerDay;
  const sensitivity = documentationSensitivity(s, CONCURRENCY_LEVELS, baselineVisits);
  const threshold = concurrencyThreshold(s, baselineVisits);
  const mixRows = visitMixSensitivity(s, EI_MIX_LEVELS, baselineVisits);
  const weighted = weightedPatientFacingMinutes(s);
  const capacity = capacityCheck(s);
  const viability = viabilityCheck(s);

  return (
    <>
      <p className="lead">
        Change any assumption and watch every downstream number move. The inputs are labelled with
        where they came from, so you always know which numbers are researched and which are guesses.
      </p>

      <Callout tone="warn" title="Salary is a test point, not a finding">
        AS-003 holds no value because sources disagree by more than $56,000. The slider below starts at
        one of three conflicting published figures purely so the model can run. Resolving this is task T-004.
      </Callout>

      <Card title="Clinical Productivity">
        <Callout tone="good" title={ELLEN_BASELINE.label}>
          <strong style={{ display: 'inline', fontWeight: 600 }}>
            {ELLEN_BASELINE.visitsPerDay} visits/day
          </strong>{' '}
          across a {ELLEN_BASELINE.workdaySpan} day. Visit mix is approximately{' '}
          {pct(ELLEN_BASELINE.eiMixShare * 100)} Early Intervention at {ELLEN_BASELINE.eiVisitMinutes} min
          and {pct((1 - ELLEN_BASELINE.eiMixShare) * 100)} other at {ELLEN_BASELINE.nonEiVisitMinutes} min,
          giving a derived {ELLEN_BASELINE.patientFacingMinutes} min patient-facing average +{' '}
          {ELLEN_BASELINE.travelMinutes} min travel = a {ELLEN_BASELINE.cycleMinutes}-minute cycle,
          with ~{ELLEN_BASELINE.documentationMinutes} min of documentation —{' '}
          {pct(ELLEN_BASELINE.documentationInWorkdayShare * 100)} completed during visits or natural
          workday downtime, {pct(ELLEN_BASELINE.documentationAfterHoursShare * 100)} completed at home
          after work.
          <div style={{ marginTop: 6 }} className="small muted">
            Current EMR: {ELLEN_BASELINE.emr} — recorded as context for how Ellen works today.
            No productivity figure in this model is attributed to the EMR.
          </div>
          <div style={{ marginTop: 6, fontStyle: 'italic' }}>{ELLEN_BASELINE.caveat}</div>
        </Callout>

        <Slider label="Visits per clinician per day" value={s.visitsPerDay} min={1} max={14} step={0.5}
          onChange={(v) => set({ visitsPerDay: v })} format={(v) => num(v, 1)}
          source="AS-002 · Ellen's current observed workload · her baseline, not an industry standard" />

        <Slider label="Early Intervention share of caseload" value={s.eiMixShare} min={0} max={1} step={0.01}
          onChange={(v) => set({ eiMixShare: v })} format={(v) => `${pct(v * 100)} EI / ${pct((1 - v) * 100)} other`}
          source="AS-019 · Ellen's current approximate schedule mix · approximate, and expected to move as referral sources change" />

        <Slider label="EI visit length" value={s.eiVisitMinutes} min={30} max={120} step={5}
          onChange={(v) => set({ eiVisitMinutes: v })} format={(v) => `${v} min`}
          source="AS-013 · Ellen's current observed visit type" />

        <Slider label="Non-EI visit length" value={s.nonEiVisitMinutes} min={15} max={90} step={5}
          onChange={(v) => set({ nonEiVisitMinutes: v })} format={(v) => `${v} min`}
          source="AS-018 · Ellen's current observed visit type" />

        <Callout tone="accent" title="Weighted patient-facing time — DERIVED, not entered">
          ({pct(s.eiMixShare * 100)} × {num(s.eiVisitMinutes, 0)} min) +
          ({pct((1 - s.eiMixShare) * 100)} × {num(s.nonEiVisitMinutes, 0)} min) ={' '}
          <strong style={{ display: 'inline', fontWeight: 600 }}>{num(weighted, 1)} min</strong>
          <div className="small muted" style={{ marginTop: 4 }}>
            This figure is calculated from the mix above. It is not an independent assumption, and
            changing any of the three inputs moves it — and everything downstream of it.
          </div>
        </Callout>

        <Slider label="Travel time per visit" value={s.travelMinutesPerVisit} min={5} max={60} step={5}
          onChange={(v) => set({ travelMinutesPerVisit: v })} format={(v) => `${v} min`}
          source="AS-006 · Ellen's current observed workload · the most sensitive lever in the whole model" />

        <Slider label="Documentation time per visit" value={s.documentationMinutesPerVisit} min={0} max={45} step={1}
          onChange={(v) => set({ documentationMinutesPerVisit: v })} format={(v) => `${v} min`}
          source="AS-007 · Ellen's current observed workload" />

        <Slider label="Documentation completed within the workday" value={s.documentationConcurrency} min={0} max={1} step={0.01}
          onChange={(v) => set({ documentationConcurrency: v })} format={(v) => pct(v * 100)}
          source="AS-015 · Ellen's current observed workflow · absorbed into visits or natural downtime, so it adds no schedule time" />

        <Slider label="Documentation completed after the workday" value={s.documentationAfterHoursShare} min={0} max={1} step={0.01}
          onChange={(v) => set({ documentationAfterHoursShare: v })} format={(v) => pct(v * 100)}
          source="AS-017 · Ellen's current observed workflow · done at home, so it is real work but not 9-to-5 capacity" />

        <Slider label="Workday length" value={s.workdayHours} min={4} max={12} step={0.5}
          onChange={(v) => set({ workdayHours: v })} format={(v) => `${num(v, 1)} h`}
          source="AS-014 · Ellen's current observed workload · the only legitimate way to raise the visit ceiling" />

        <Slider label="Working days per year" value={s.workingDaysPerYear} min={180} max={260} step={1}
          onChange={(v) => set({ workingDaysPerYear: v })} format={(v) => `${v} days`}
          source="AS-012 · existing assumption, net of PTO and holidays · weekly average is derived from this" />
      </Card>

      <Card title="Visit cycle — where the workday goes">
        <Table head={<tr><th>Component</th><th className="num">Minutes</th><th>Counts toward the day?</th></tr>}>
          <tr><td>Patient-facing time</td><td className="num">{num(cycle.patientFacingMinutes, 0)}</td><td className="muted">Yes — billable</td></tr>
          <tr><td>Travel</td><td className="num">{num(cycle.travelMinutes, 0)}</td><td className="muted">Yes — unbillable</td></tr>
          <tr><td>Documentation within the workday</td><td className="num">{num(cycle.concurrentDocumentationMinutes, 2)}</td><td className="muted">No — absorbed into visits or downtime</td></tr>
          <tr><td>Documentation extending the clinical day</td><td className="num">{num(cycle.additionalDocumentationMinutes, 2)}</td><td className="muted">Yes — extends the day</td></tr>
          <tr><td>Documentation after the workday</td><td className="num">{num(cycle.afterHoursDocumentationMinutes, 2)}</td><td className="muted">No — done at home, but still real work</td></tr>
          <tr style={{ fontWeight: 600 }}><td>Clinical cycle</td><td className="num">{num(cycle.cycleMinutes, 2)}</td><td className="muted">Drives capacity</td></tr>
          <tr><td className="muted">Total clinician burden</td><td className="num muted">{num(cycle.totalClinicianMinutes, 2)}</td><td className="muted">Cycle + after-hours</td></tr>
        </Table>

        <Callout tone={feas.feasible ? 'good' : 'bad'} title={feas.feasible ? 'Schedule fits' : 'Schedule does not fit — capped'}>
          {feas.explanation}
        </Callout>

        <div className="grid">
          <Stat label="Visits/day (used)" value={num(feas.effectiveVisitsPerDay, 1)}
            note={feas.clamped ? `Requested ${num(feas.requestedVisitsPerDay, 1)} — capped` : 'As requested'} />
          <Stat label="Ceiling at this cycle" value={String(feas.maxVisitsPerDay)} note={`${num(s.workdayHours, 1)}h ÷ ${num(cycle.cycleMinutes, 0)} min`} />
          <Stat label="Visits/week" value={num(volume.visitsPerWeek, 1)} note={`${num(volume.workingDaysPerWeek, 2)} working days/week`} />
          <Stat label="Visits/month" value={num(volume.visitsPerMonth, 0)} />
        </div>
      </Card>

      <Card title="Visit Mix Sensitivity">
        <div className="pills">
          <span className="pill accent">USER_PROVIDED — Ellen's approximate current mix: 50% EI / 50% other</span>
          <span className="pill neutral">SENSITIVITY SCENARIO — every other row</span>
        </div>
        <p className="small muted">
          Because reimbursement is flat per visit, a 60-minute EI visit earns exactly what a
          30-minute visit earns while consuming twice the patient-facing time. The caseload mix is
          therefore a direct capacity lever — and one Blue Star can influence through which referral
          sources it cultivates.
        </p>
        <Table head={
          <tr>
            <th>EI share</th><th className="num">Patient-facing</th><th className="num">Cycle</th>
            <th className="num">Max visits/day</th><th>{baselineVisits}-visit day</th><th className="num">Collected revenue</th>
          </tr>
        }>
          {mixRows.map((r) => (
            <tr key={r.label} style={Math.abs(r.eiMixShare - s.eiMixShare) < 1e-9 ? { background: 'rgba(77,163,255,0.10)' } : undefined}>
              <td><strong>{r.label}</strong>
                {Math.abs(r.eiMixShare - ELLEN_BASELINE.eiMixShare) < 1e-9 && (
                  <div><span className="pill accent">Ellen observed</span></div>
                )}
              </td>
              <td className="num">{num(r.weightedPatientFacingMinutes, 1)}m</td>
              <td className="num">{num(r.cycleMinutes, 1)}m</td>
              <td className="num">{r.maxVisitsPerDay}</td>
              <td><span className={`pill ${r.baselineDayCloses ? 'good' : 'bad'}`}>{r.baselineDayCloses ? 'YES' : 'NO'}</span></td>
              <td className="num">{money(r.collectedRevenue)}</td>
            </tr>
          ))}
        </Table>
        <div className="btn-row" style={{ marginTop: 12, marginBottom: 0 }}>
          {EI_MIX_LEVELS.map((m) => (
            <button key={m}
              className={`btn${Math.abs(s.eiMixShare - m) < 1e-9 ? ' active' : ''}`}
              onClick={() => set({ eiMixShare: m })}>
              {Math.round(m * 100)}% EI
            </button>
          ))}
        </div>
      </Card>

      <Card title="Documentation Sensitivity">
        <div className="pills">
          <span className="pill accent">USER_PROVIDED — Ellen's observed workflow: 90% in-workday / 10% after-hours</span>
          <span className="pill neutral">SENSITIVITY SCENARIO — every other row below</span>
        </div>

        <p className="small muted">
          The 90% row is Ellen's actual reported workflow. Every other level is a hypothetical test
          of what would happen if less documentation were absorbed into the workday — none of them
          represents observed behaviour. After-hours documentation is held at Ellen's observed 10%
          throughout, so lowering the in-workday share is what pushes minutes into the clinical
          schedule.
        </p>

        <Callout tone="bad" title="Where the 8-visit day breaks">
          {threshold === null ? (
            <>At these inputs the {baselineVisits}-visit day behaves the same across the whole range,
            so there is no crossing point to report.</>
          ) : (
            <>
              The {baselineVisits}-visit day closes down to{' '}
              <strong style={{ display: 'inline', fontWeight: 600 }}>{pct(threshold.threshold * 100, 0)}</strong>{' '}
              in-workday documentation — which is exactly where Ellen reports operating. It requires{' '}
              {num(feas.cycleMinutes * baselineVisits, 0)} of {num(feas.workdayMinutes, 0)} available minutes.
              Below that the ceiling drops to 7 visits/day and stays there: a cliff, not a gradual slope.
            </>
          )}
        </Callout>

        <Table head={
          <tr>
            <th>Concurrency</th><th className="num">Cycle</th><th className="num">Max visits/day</th>
            <th>{baselineVisits}-visit day</th><th className="num">Time vs available</th><th className="num">Overage</th>
          </tr>
        }>
          {sensitivity.map((r) => (
            <tr key={r.label} style={r.concurrency === s.documentationConcurrency ? { background: 'rgba(77,163,255,0.10)' } : undefined}>
              <td><strong>{r.label}</strong>
                {Math.abs(r.concurrency - ELLEN_BASELINE.documentationInWorkdayShare) < 1e-9 && (
                  <div><span className="pill accent">Ellen observed</span></div>
                )}
                <div className="muted" style={{ fontSize: 10.5 }}>+{num(r.additionalDocumentationMinutes, 2)}m/visit</div></td>
              <td className="num">{num(r.cycleMinutes, 2)}m</td>
              <td className="num">{r.maxVisitsPerDay}</td>
              <td><span className={`pill ${r.baselineDayCloses ? 'good' : 'bad'}`}>{r.baselineDayCloses ? 'YES' : 'NO'}</span></td>
              <td className="num">{num(r.baselineMinutesRequired, 0)} / {num(r.workdayMinutes, 0)}m</td>
              <td className="num">{r.baselineOverageMinutes > 0 ? `+${num(r.baselineOverageMinutes, 0)}m` : '—'}</td>
            </tr>
          ))}
        </Table>

        <h3 style={{ marginTop: 16 }}>Break-even versus capacity</h3>
        <Table head={
          <tr>
            <th>Concurrency</th><th className="num">Max visits/day</th><th className="num">Break-even visits/day</th>
            <th>Relationship</th><th className="num">Collected revenue</th>
          </tr>
        }>
          {sensitivity.map((r) => (
            <tr key={r.label}>
              <td><strong>{r.label}</strong></td>
              <td className="num">{r.maxVisitsPerDay}</td>
              <td className="num">{num(r.breakEvenVisitsPerDay, 2)}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{r.capacityVsBreakEven}</td>
              <td className="num">{money(r.collectedRevenue)}</td>
            </tr>
          ))}
        </Table>
        <p className="small muted">
          Break-even does not move with concurrency — it is set by cost and contribution per visit, not
          by how long the day runs. What changes is the headroom above it.
        </p>

        <div className="btn-row" style={{ marginTop: 12, marginBottom: 0 }}>
          {CONCURRENCY_LEVELS.map((c) => (
            <button key={c}
              className={`btn${Math.abs(s.documentationConcurrency - c) < 1e-9 ? ' active' : ''}`}
              onClick={() => set({ documentationConcurrency: c })}>
              Test {Math.round(c * 100)}%
            </button>
          ))}
        </div>
      </Card>

      <Card title="Weekly clinician time split (per clinician)">
        <div className="grid">
          <Stat label="Patient-facing" value={`${num(volume.patientFacingHoursPerWeek, 1)} h`} note="Billable" />
          <Stat label="Travel" value={`${num(volume.travelHoursPerWeek, 1)} h`} note="Unbillable" />
          <Stat label="Documentation" value={`${num(volume.documentationHoursPerWeek, 1)} h`}
            note={cycle.additionalDocumentationMinutes === 0
              ? 'None extends the clinical day'
              : `${num(cycle.additionalDocumentationMinutes, 2)}m/visit adds to the schedule`} />
          <Stat label="After-hours documentation" value={`${num(volume.afterHoursDocumentationHoursPerWeek, 2)} h`}
            note={`~${num(volume.afterHoursDocumentationMinutesPerDay, 0)} min/day at home — real work, outside 9-to-5`} />
          <Stat label="Total clinician burden" value={`${num(volume.totalClinicianHoursPerWeek, 1)} h`}
            note="Scheduled clinical time plus after-hours documentation" />
        </div>
      </Card>

      <Card title="Assumptions">
        <Slider label="Reimbursement per visit" value={s.reimbursementPerVisit} min={80} max={220} step={0.01}
          onChange={(v) => set({ reimbursementPerVisit: v })} format={(v) => money(v, { decimals: 2 })}
          source="AS-001 · HCPF FY2026-27 fee schedule · Strong evidence, unverified against source PDF" />

        <Slider label="Clinician salary" value={s.clinicianSalary ?? 0} min={60000} max={160000} step={1000}
          onChange={(v) => set({ clinicianSalary: v })} format={(v) => money(v)}
          source="AS-003 · UNKNOWN — sources span $78,825 to $135,278" />

        <Slider label="Cancellation rate" value={s.cancellationRate} min={0} max={0.4} step={0.01}
          onChange={(v) => set({ cancellationRate: v })} format={(v) => pct(v * 100)}
          source="AS-005 · ASSUMPTION — a cancelled visit loses revenue but not cost" />

        <Slider label="Collection rate" value={s.collectionRate} min={0.6} max={1} step={0.01}
          onChange={(v) => set({ collectionRate: v })} format={(v) => pct(v * 100)}
          source="AS-008 · ASSUMPTION — denials are the main loss under PAR enforcement" />

        <Slider label="Benefits load" value={s.benefitsRate} min={0} max={0.35} step={0.01}
          onChange={(v) => set({ benefitsRate: v })} format={(v) => pct(v * 100)}
          source="AS-011 · ASSUMPTION — also a retention lever, not only a cost" />

        <Slider label="Mileage cost per visit" value={s.mileageCostPerVisit} min={0} max={40} step={1}
          onChange={(v) => set({ mileageCostPerVisit: v })} format={(v) => money(v, { decimals: 2 })}
          source="AS-010 · ASSUMPTION — IRS rate not verified this session" />

        <Slider label="Clinicians" value={s.clinicianCount} min={1} max={12} step={1}
          onChange={(v) => set({ clinicianCount: v })} format={(v) => String(v)}
          source="Strategy input · FAMLI employer premium starts at 10 employees (EV-018)" />

        <Slider label="Fixed monthly overhead" value={s.fixedMonthlyOverhead} min={0} max={8000} step={100}
          onChange={(v) => set({ fixedMonthlyOverhead: v })} format={(v) => money(v)}
          source="Derived from the cost database — several required lines are still unpriced" />

        <Slider label="Days to cash" value={s.daysToCash} min={15} max={120} step={5}
          onChange={(v) => set({ daysToCash: v })} format={(v) => `${v} days`}
          source="AS-009 · ASSUMPTION — drives working capital, excludes PAR delay before care starts" />
      </Card>

      <Callout tone={viability.breakEvenIsAchievable ? 'good' : 'bad'} title="Viability">
        {viability.verdict}
        {!viability.breakEvenIsAchievable && viability.bindingConstraint !== 'None' && (
          <div style={{ marginTop: 6 }}>Binding constraint: <strong style={{ display: 'inline' }}>{viability.bindingConstraint}</strong></div>
        )}
      </Callout>

      <Card title="Results">
        <div className="grid">
          <Stat label="Operating profit / year" value={money(model.operatingProfit)} note={`${s.clinicianCount} clinician(s)`} />
          <Stat label="Collected revenue" value={money(model.collectedRevenue)} />
          <Stat label="Clinician cost (loaded)" value={money(model.clinicianCostTotal)} note="Salary + payroll + benefits" />
          <Stat label="Completed visits / year" value={num(model.completedVisits, 0)} note="Net of cancellations" />
          <Stat label="Break-even visits/clinician/day" value={num(model.breakEvenVisitsPerClinicianPerDay, 2)} />
          <Stat label="Working capital required" value={money(model.workingCapitalRequired)} />
        </div>
      </Card>

      <Card title="Where the revenue goes">
        <p className="small muted" style={{ marginTop: 0 }}>
          Visits × reimbursement is not clinician economics. This is the full path from
          delivered visits to what is actually left for the business.
        </p>
        <Table head={<tr><th>Line</th><th className="num">Annual</th></tr>}>
          <tr><td>Completed visits</td><td className="num">{num(revenue.completedVisitsPerYear, 0)}</td></tr>
          <tr><td>Gross clinical revenue</td><td className="num">{money(revenue.grossClinicalRevenue)}</td></tr>
          <tr><td>− collection loss</td><td className="num">{money(-revenue.collectionLoss)}</td></tr>
          <tr><td>= collected revenue</td><td className="num">{money(revenue.collectedRevenue)}</td></tr>
          <tr><td>− clinician compensation (loaded)</td><td className="num">{money(revenue.clinicianCompensation === null ? null : -revenue.clinicianCompensation)}</td></tr>
          <tr><td>− mileage</td><td className="num">{money(-revenue.mileage)}</td></tr>
          <tr style={{ fontWeight: 600 }}><td>= left for overhead and margin</td><td className="num">{money(revenue.remainingForOverheadAndMargin)}</td></tr>
          <tr><td>− business overhead</td><td className="num">{money(-revenue.overhead)}</td></tr>
          <tr style={{ fontWeight: 600 }}><td>= operating margin</td><td className="num">{money(revenue.operatingMargin)}</td></tr>
        </Table>
      </Card>

      <Card title="Per-visit math — nothing hidden">
        <Table head={<tr><th>Line</th><th className="num">Value</th></tr>}>
          <tr><td>Gross reimbursement</td><td className="num">{money(visit.grossRevenue, { decimals: 2 })}</td></tr>
          <tr><td>× collection rate {pct(s.collectionRate * 100)}</td><td className="num">{money(visit.collectedRevenue, { decimals: 2 })}</td></tr>
          <tr><td>− clinician cost per completed visit</td><td className="num">{money(visit.clinicianCost, { decimals: 2 })}</td></tr>
          <tr><td>− mileage</td><td className="num">{money(visit.mileageCost, { decimals: 2 })}</td></tr>
          <tr style={{ fontWeight: 600 }}><td>= contribution margin</td><td className="num">{money(visit.contributionMargin, { decimals: 2 })}</td></tr>
          <tr><td className="muted">Margin %</td><td className="num muted">{pct(visit.marginPercent, 1)}</td></tr>
          <tr><td className="muted">Clinician minutes consumed</td><td className="num muted">{visit.totalMinutesConsumed} min</td></tr>
          <tr><td className="muted">Revenue per clinician hour</td><td className="num muted">{money(visit.revenuePerClinicianHour, { decimals: 2 })}</td></tr>
        </Table>
        <Callout tone="warn" title="Why revenue per hour is the honest number">
          A {money(visit.grossRevenue, { decimals: 0 })} visit consumes {visit.totalMinutesConsumed} minutes of
          clinician time once travel and notes are counted — so the real yield is{' '}
          {money(visit.revenuePerClinicianHour, { decimals: 2 })}/hour, not{' '}
          {money(visit.grossRevenue, { decimals: 0 })}. Under a flat per-visit rate, minutes spent driving are
          minutes that earn nothing.
        </Callout>
      </Card>

      <Card title="Capacity check">
        <div className="grid">
          <Stat label="Minutes required per day" value={`${num(capacity.minutesRequired, 0)} min`} note={`${num(capacity.hoursRequired, 1)} hours`} />
          <Stat label="Fits an 8-hour day?" value={capacity.feasibleInEightHourDay ? 'Yes' : 'No'} />
          <Stat label="Max visits in 8 hours" value={String(capacity.maxVisitsInEightHours)} />
        </div>
        {!capacity.feasibleInEightHourDay && (
          <Callout tone="bad" title="The assumed caseload does not fit the day">
            At {num(s.visitsPerDay, 1)} visits/day and {visit.totalMinutesConsumed} minutes per visit, this
            schedule needs {num(capacity.hoursRequired, 1)} hours. Either the caseload assumption is too
            high, or the time envelope has to come down.
          </Callout>
        )}
      </Card>

      <Card title="Utilisation scenarios">
        <Table head={<tr><th>Scenario</th><th className="num">Visits/day</th><th className="num">Revenue</th><th className="num">Profit</th><th>Feasible</th></tr>}>
          {utilisationScenarios(s).map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="num">{num(r.visitsPerDay, 1)}</td>
              <td className="num">{money(r.model.collectedRevenue)}</td>
              <td className="num">{money(r.model.operatingProfit)}</td>
              <td><span className={`pill ${r.capacity.feasibleInEightHourDay ? 'good' : 'bad'}`}>{r.capacity.feasibleInEightHourDay ? 'Yes' : 'No'}</span></td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Travel radius scenarios">
        <p className="small muted" style={{ marginTop: 0 }}>
          Geographic density is a strategy, not a detail. Tightening the service radius raises the
          achievable caseload and cuts mileage at the same time.
        </p>
        <Table head={<tr><th>Radius</th><th className="num">Travel</th><th className="num">Max visits/day</th><th className="num">Margin/visit</th></tr>}>
          {travelScenarios(s).map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="num">{r.travelMinutes} min</td>
              <td className="num">{r.capacity.maxVisitsInEightHours}</td>
              <td className="num">{money(r.economics.contributionMargin, { decimals: 2 })}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
