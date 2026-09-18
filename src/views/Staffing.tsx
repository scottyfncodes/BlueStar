import { useState } from 'react';
import { Card, Stat, Callout, Table, money, num, pct } from '../components/ui';
import { staffingScenarios, capacityVolume, visitCycle, scheduleFeasibility } from '../model/economics';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';
import { assumptionsById } from '../data/assumptions';

export function Staffing() {
  const [salary, setSalary] = useState(SALARY_TEST_POINTS[1].value);
  const base = { ...defaultScenario(), clinicianSalary: salary };

  const scenarios = staffingScenarios(base);
  const volume = capacityVolume(base);
  const cycle = visitCycle(base);
  const feas = scheduleFeasibility(base);
  const ramp = assumptionsById.get('AS-016')!;

  return (
    <>
      <p className="lead">
        How headcount turns into capacity, revenue and margin — using the same productivity
        assumptions as everywhere else, so changing the visit cycle moves every row.
      </p>

      <Callout tone="bad" title="Read these as ceilings, not forecasts">
        Every clinician here is modelled at Ellen's observed baseline of {ELLEN_BASELINE.visitsPerDay} visits/day.
        A newly hired PT will not match that on day one — they need to build a caseload and learn
        routes. <strong style={{ display: 'inline', fontWeight: 600 }}>{ramp.name}</strong> (AS-016) is
        deliberately left UNKNOWN rather than invented, because guessing it would silently inflate
        every multi-clinician revenue figure below. Ellen is the right person to answer it.
      </Callout>

      <Card title="Per-clinician productivity in use">
        <div className="grid">
          <Stat label="Visits/day" value={num(volume.visitsPerDay, 1)} note={feas.clamped ? 'Capped to fit the day' : "Ellen's baseline"} />
          <Stat label="Visit cycle" value={`${num(cycle.cycleMinutes, 0)} min`} note={`${num(cycle.patientFacingMinutes, 0)}m visit + ${num(cycle.travelMinutes, 0)}m travel`} />
          <Stat label="Visits/week" value={num(volume.visitsPerWeek, 1)} note={`${num(volume.workingDaysPerWeek, 2)} working days/week`} />
          <Stat label="Visits/month" value={num(volume.visitsPerMonth, 0)} />
        </div>
        <div className="ctl" style={{ marginTop: 12, marginBottom: 0 }}>
          <label><span>Clinician salary (test point)</span><span>{money(salary)}</span></label>
          <input type="range" min={60000} max={160000} step={1000} value={salary}
            onChange={(e) => setSalary(Number(e.target.value))} />
          <div className="src">AS-003 · UNKNOWN — sources disagree by more than $56,000. This is a test value, not an estimate.</div>
        </div>
      </Card>

      <Card title="Capacity by staffing scenario">
        <Table head={
          <tr>
            <th>Scenario</th><th className="num">Clinicians</th><th className="num">Visits/day</th>
            <th className="num">Visits/week</th><th className="num">Visits/month</th>
          </tr>
        }>
          {scenarios.map((sc) => (
            <tr key={sc.id}>
              <td>{sc.label}<div className="muted" style={{ fontSize: 11 }}>{sc.disciplines}</div></td>
              <td className="num">{sc.clinicianCount}</td>
              <td className="num">{num(sc.visitsPerDay, 0)}</td>
              <td className="num">{num(sc.visitsPerWeek, 0)}</td>
              <td className="num">{num(sc.visitsPerMonth, 0)}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Economics by staffing scenario">
        <Table head={
          <tr>
            <th>Scenario</th><th className="num">Collected revenue</th><th className="num">Clinician cost</th>
            <th className="num">Left for overhead + margin</th><th className="num">Operating margin</th><th className="num">Margin %</th>
          </tr>
        }>
          {scenarios.map((sc) => (
            <tr key={sc.id}>
              <td>{sc.label}</td>
              <td className="num">{money(sc.collectedRevenue)}</td>
              <td className="num">{money(sc.clinicianCost)}</td>
              <td className="num">{money(sc.remainingForOverheadAndMargin)}</td>
              <td className="num" style={{ color: (sc.operatingMargin ?? 0) < 0 ? 'var(--bad)' : 'var(--good)' }}>
                {money(sc.operatingMargin)}
              </td>
              <td className="num">{pct(sc.marginPercent, 1)}</td>
            </tr>
          ))}
        </Table>
        <p className="small muted">
          Overhead is held flat as headcount grows, which is where operating leverage comes from —
          the same fixed cost spread over more visits.
        </p>
      </Card>

      <Card title="Travel and documentation burden">
        <p className="small muted" style={{ marginTop: 0 }}>
          Unbillable time scales with headcount too. Travel in particular is pure capacity loss under
          flat per-visit reimbursement, and it is the first thing to attack as the team grows.
        </p>
        <Table head={
          <tr>
            <th>Scenario</th><th className="num">Patient-facing h/wk</th>
            <th className="num">Travel h/wk</th><th className="num">Documentation h/wk</th>
          </tr>
        }>
          {scenarios.map((sc) => (
            <tr key={sc.id}>
              <td>{sc.label}</td>
              <td className="num">{num(sc.patientFacingHoursPerWeek, 1)}</td>
              <td className="num" style={{ color: 'var(--warn)' }}>{num(sc.travelHoursPerWeek, 1)}</td>
              <td className="num">{num(sc.documentationHoursPerWeek, 1)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
