import { useState } from 'react';
import { Card, Stat, Callout, Table, money, num, pct } from '../components/ui';
import {
  annualModel, visitEconomics, capacityCheck, viabilityCheck,
  utilisationScenarios, travelScenarios, visitCycle, scheduleFeasibility,
  capacityVolume, revenueBreakdown, type ScenarioInputs,
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
          across a {ELLEN_BASELINE.workdaySpan} day — roughly{' '}
          {ELLEN_BASELINE.patientFacingMinutes} min patient-facing +{' '}
          {ELLEN_BASELINE.travelMinutes} min travel = a {ELLEN_BASELINE.cycleMinutes}-minute cycle,
          with ~{ELLEN_BASELINE.documentationMinutes} min of documentation.{' '}
          {ELLEN_BASELINE.documentationTiming}.
          <div style={{ marginTop: 6, fontStyle: 'italic' }}>{ELLEN_BASELINE.caveat}</div>
        </Callout>

        <Slider label="Visits per clinician per day" value={s.visitsPerDay} min={1} max={14} step={0.5}
          onChange={(v) => set({ visitsPerDay: v })} format={(v) => num(v, 1)}
          source="AS-002 · Ellen's current observed workload · her baseline, not an industry standard" />

        <Slider label="Patient-facing visit time" value={s.visitLengthMinutes} min={20} max={120} step={5}
          onChange={(v) => set({ visitLengthMinutes: v })} format={(v) => `${v} min`}
          source="AS-013 · Ellen's current observed workload · flat per-visit pay means longer visits earn no more" />

        <Slider label="Travel time per visit" value={s.travelMinutesPerVisit} min={5} max={60} step={5}
          onChange={(v) => set({ travelMinutesPerVisit: v })} format={(v) => `${v} min`}
          source="AS-006 · Ellen's current observed workload · the most sensitive lever in the whole model" />

        <Slider label="Documentation time per visit" value={s.documentationMinutesPerVisit} min={0} max={45} step={1}
          onChange={(v) => set({ documentationMinutesPerVisit: v })} format={(v) => `${v} min`}
          source="AS-007 · Ellen's current observed workload" />

        <Slider label="Documentation done DURING the visit" value={s.documentationConcurrency} min={0} max={1} step={0.05}
          onChange={(v) => set({ documentationConcurrency: v })} format={(v) => pct(v * 100)}
          source="AS-015 · Ellen's current observed workload · at 100% the cycle is 60 min; drop it and the day stops closing" />

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
          <tr><td>Documentation during the visit</td><td className="num">{num(cycle.concurrentDocumentationMinutes, 0)}</td><td className="muted">No — absorbed into the visit</td></tr>
          <tr><td>Documentation after the visit</td><td className="num">{num(cycle.additionalDocumentationMinutes, 0)}</td><td className="muted">Yes — extends the day</td></tr>
          <tr style={{ fontWeight: 600 }}><td>Total cycle</td><td className="num">{num(cycle.cycleMinutes, 0)}</td><td /></tr>
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

      <Card title="Weekly clinician time split (per clinician)">
        <div className="grid">
          <Stat label="Patient-facing" value={`${num(volume.patientFacingHoursPerWeek, 1)} h`} note="Billable" />
          <Stat label="Travel" value={`${num(volume.travelHoursPerWeek, 1)} h`} note="Unbillable" />
          <Stat label="Documentation" value={`${num(volume.documentationHoursPerWeek, 1)} h`} note="Mostly inside the visit" />
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
