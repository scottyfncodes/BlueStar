import { useMemo, useState } from 'react';
import { Card, Stat, Callout, Table, money, num, pct } from '../components/ui';
import { RampChart } from '../components/RampChart';
import {
  founderRamp, rampMilestones, rampSensitivity, rampNarrative, patientsAtCapacity,
  ACQUISITION_LEVELS, FREQUENCY_LEVELS, REFERRAL_FIELDS, referralSources, ELLEN_QUESTIONS,
  deriveFrequencyFromCaseload, CASELOAD_REFERENCE_POINTS,
  type FounderRampInputs, type PatientGrowthMode,
} from '../model/founderRamp';
import { defaultScenario, RAMP_SCENARIO_DEFAULTS, FOUNDER_RAMP_SCENARIO_NAME, ELLEN_BASELINE } from '../model/defaults';
import { caseloadComposition } from '../model/caseload';

export function FounderRamp() {
  const D = RAMP_SCENARIO_DEFAULTS;
  const comp = caseloadComposition();
  const [eiMixShare, setEiMix] = useState(defaultScenario().eiMixShare);
  const [eiPatientShare, setEiPatientShare] = useState(comp.eiPatientShare);
  const [growthMode, setGrowthMode] = useState<PatientGrowthMode>('weekly');
  const [newPatientsPerWeek, setAcq] = useState<number>(D.newPatientsPerWeek);
  const [eiFreq, setEiFreq] = useState<number>(comp.eiVisitsPerPatientPerWeek);
  const [nonEiFreq, setNonEiFreq] = useState<number>(comp.nonEiVisitsPerPatientPerWeek);
  const [discharge, setDischarge] = useState<number>(D.monthlyDischargeRate);
  const [targetComp, setTargetComp] = useState<number>(D.targetOwnerCompAfterTransition);
  const [reserve, setReserve] = useState<number>(D.minimumCashReserve);
  const [override, setOverride] = useState<number | null>(null);
  const [clinicians, setClinicians] = useState(1);
  // Frequency can be entered directly, or derived from Ellen's caseload size.
  const [freqMode, setFreqMode] = useState<'direct' | 'caseload'>('direct');
  const [caseload, setCaseload] = useState(30);
  const [eiRatio, setEiRatio] = useState(1);

  const scenarioForDerivation = { ...defaultScenario(), eiMixShare, clinicianSalary: 0 };
  const derived = deriveFrequencyFromCaseload(scenarioForDerivation, caseload, eiRatio, clinicians);
  const effectiveEiFreq = freqMode === 'caseload' && derived ? derived.eiVisitsPerPatientPerWeek : eiFreq;
  const effectiveNonEiFreq = freqMode === 'caseload' && derived ? derived.nonEiVisitsPerPatientPerWeek : nonEiFreq;

  const inputs: FounderRampInputs = useMemo(() => ({
    scenario: { ...defaultScenario(), eiMixShare, clinicianSalary: 0 },
    startingActivePatients: D.startingActivePatients,
    growthMode,
    newPatientsPerWeek,
    newPatientsPerMonth: newPatientsPerWeek * (52 / 12),
    manualMonthlyAdditions: [],
    eiVisitsPerPatientPerWeek: effectiveEiFreq,
    nonEiVisitsPerPatientPerWeek: effectiveNonEiFreq,
    monthlyDischargeRate: discharge,
    clinicianCount: clinicians,
    eiPatientShare,
    ownerCompBeforeTransition: 0,
    targetOwnerCompAfterTransition: targetComp,
    minimumCashReserve: reserve,
    transitionMonthOverride: override,
    startingCash: D.startingCash,
    horizonMonths: 24,
    censusTarget: D.censusTarget,
  }), [eiMixShare, eiPatientShare, growthMode, newPatientsPerWeek, effectiveEiFreq,
       effectiveNonEiFreq, discharge, clinicians, targetComp, reserve, override, D]);

  const ramp = founderRamp(inputs);
  const stones = rampMilestones(inputs);
  const cells = rampSensitivity(inputs);
  const capPatients = patientsAtCapacity(inputs);
  const last = ramp.months[ramp.months.length - 1];

  return (
    <>
      <p className="lead">
        The road from one patient to a real practice — and the month Blue Star first meets the
        transition criteria you select.
      </p>

      <Callout tone="warn" title="Visit frequency is now observed; acquisition still is not">
        Visit frequency and caseload composition now come from Ellen's actual schedule (AS-020,
        AS-021, AS-027, AS-031). What remains unknown is how fast patients arrive (AS-022), the
        compensation target (AS-024) and the cash reserve (AS-025) — those are still scenario
        controls, so the TIMELINE is a scenario even though the per-patient economics are observed.
      </Callout>

      <Card title="Ellen's observed caseload">
        <Table head={<tr><th>Cohort</th><th className="num">Patients</th><th className="num">Visits/wk</th><th className="num">Minutes</th></tr>}>
          {comp.cohorts.map((c) => (
            <tr key={c.id}>
              <td>{c.label}{c.isEarlyIntervention && <div><span className="pill accent">EI</span></div>}</td>
              <td className="num">{c.patients}</td>
              <td className="num">{num(c.visitsPerWeek, 0)}</td>
              <td className="num">{c.visitMinutes}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 600 }}>
            <td>Total</td>
            <td className="num">{comp.totalPatients}</td>
            <td className="num">{num(comp.totalVisitsPerWeek, 0)}</td>
            <td className="num">{num(comp.weightedVisitMinutes, 0)} avg</td>
          </tr>
        </Table>
        <Callout tone="warn" title="This caseload was assigned, not chosen">
          Ellen's employer allocated these patients to her. The visit LENGTHS and per-patient
          FREQUENCIES are service and plan-of-care properties that would plausibly carry over to a
          Blue Star patient of the same type. The MIX — 33% of visits EI, 44% of patients, and the
          6/8 split between once- and twice-weekly non-EI children — is one scheduler's allocation
          decision. It describes how Ellen works today; it does not predict what Blue Star's
          referral sources would produce, and it is not evidence about the Denver market.
        </Callout>
        <div className="grid" style={{ marginTop: 10 }}>
          <Stat label="EI share of VISITS" value={pct(comp.eiVisitShare * 100, 1)} note="Drives visit duration" />
          <Stat label="EI share of PATIENTS" value={pct(comp.eiPatientShare * 100, 1)} note="Drives the census split" />
          <Stat label="EI visits/patient/week" value={num(comp.eiVisitsPerPatientPerWeek, 2)} />
          <Stat label="Non-EI visits/patient/week" value={num(comp.nonEiVisitsPerPatientPerWeek, 2)} />
        </div>
        {!comp.reconciles && (
          <Callout tone="bad" title="These cohorts do not reconcile with the stated totals">
            The itemised cohorts sum to <strong style={{ display: 'inline' }}>{comp.totalPatients} patients
            and {num(comp.totalVisitsPerWeek, 0)} visits/week</strong>, against a separately stated{' '}
            {comp.statedPatients} patients and {num(comp.statedVisitsPerWeek, 0)} visits/week — a gap of{' '}
            {comp.patientCountGap} patient{Math.abs(comp.patientCountGap) === 1 ? '' : 's'} and{' '}
            {comp.visitCountGap} visit{Math.abs(comp.visitCountGap) === 1 ? '' : 's'}. The model uses the
            cohort figures because they are itemised and internally consistent, but this is unresolved
            and either figure could be the right one.
          </Callout>
        )}
      </Card>

      <Card title={FOUNDER_RAMP_SCENARIO_NAME}>
        <p className="small" style={{ marginTop: 0 }}>{rampNarrative(inputs)}</p>
        <div className="grid">
          <Stat label="First month criteria are met"
            value={ramp.firstEligibleMonth === null ? 'Not within 24 mo' : `Month ${ramp.firstEligibleMonth}`}
            unknown={ramp.firstEligibleMonth === null}
            note="Both income and cash criteria, on the $0-compensation path" />
          <Stat label="Clinical capacity" value={`${num(ramp.capacityVisitsPerDay, 0)} visits/day`}
            note={capPatients === null ? undefined : `≈ ${num(capPatients, 0)} active patients`} />
          <Stat label="Month demand hits capacity"
            value={ramp.monthCensusReachesCapacity === null ? 'Not within horizon' : `Month ${ramp.monthCensusReachesCapacity}`} />
          <Stat label="Cash at month 24" value={money(last?.cumulativeCash)} />
        </div>
      </Card>

      <Card title="Demand vs clinical capacity">
        <RampChart
          points={ramp.months.map((m) => ({ x: m.month, y: m.demandVisitsPerDay }))}
          threshold={ramp.capacityVisitsPerDay}
          thresholdLabel={`Capacity ${num(ramp.capacityVisitsPerDay, 0)}/day`}
          seriesLabel="Visits/day demanded by census"
          formatY={(v) => num(v, 1)}
        />
        <p className="small muted">
          Where the line passes the dashed capacity ceiling, demand exists that Blue Star cannot
          serve. The timeline below shows that overflow explicitly rather than clipping it away.
        </p>
      </Card>

      <Card title="Blue Star cash balance">
        <RampChart
          points={ramp.months.map((m) => ({ x: m.month, y: m.cumulativeCash }))}
          seriesLabel="Cumulative cash"
          colorVar="--series-2"
          formatY={(v) => money(v)}
          yZeroLine
          markerMonth={ramp.transitionMonth}
          markerLabel={ramp.transitionMonth ? `Transition M${ramp.transitionMonth}` : undefined}
        />
        <p className="small muted">
          Owner compensation is $0 until the transition month, so cash accumulates while household
          income continues from Ellen's current job.
        </p>
      </Card>

      <Card title="Scenario controls">
        <div className="ctl">
          <label><span>Patient acquisition</span><span>{num(newPatientsPerWeek, 1)}/week</span></label>
          <input type="range" min={0} max={4} step={0.5} value={newPatientsPerWeek}
            onChange={(e) => setAcq(Number(e.target.value))} />
          <div className="src">AS-022 · UNKNOWN — depends on referral sources not yet researched</div>
        </div>
        <div className="btn-row">
          {(['weekly', 'monthly'] as PatientGrowthMode[]).map((g) => (
            <button key={g} className={`btn${growthMode === g ? ' active' : ''}`}
              onClick={() => setGrowthMode(g)}>{g === 'weekly' ? 'Weekly arrivals' : 'Monthly arrivals'}</button>
          ))}
        </div>
        <h3 style={{ marginTop: 16 }}>Visit frequency</h3>
        <div className="btn-row">
          <button className={`btn${freqMode === 'direct' ? ' active' : ''}`}
            onClick={() => setFreqMode('direct')}>Enter frequency</button>
          <button className={`btn${freqMode === 'caseload' ? ' active' : ''}`}
            onClick={() => setFreqMode('caseload')}>Derive from caseload size</button>
        </div>

        {freqMode === 'direct' ? (
          <>
            <div className="ctl">
              <label><span>EI visits / patient / week</span><span>{num(eiFreq, 1)}</span></label>
              <input type="range" min={0.5} max={3} step={0.5} value={eiFreq}
                onChange={(e) => setEiFreq(Number(e.target.value))} />
              <div className="src">AS-020 · UNKNOWN — needs Ellen</div>
            </div>
            <div className="ctl">
              <label><span>Non-EI visits / patient / week</span><span>{num(nonEiFreq, 1)}</span></label>
              <input type="range" min={0.5} max={3} step={0.5} value={nonEiFreq}
                onChange={(e) => setNonEiFreq(Number(e.target.value))} />
              <div className="src">AS-021 · UNKNOWN — needs Ellen</div>
            </div>
          </>
        ) : (
          <>
            <Callout tone="accent" title="Visits/day gives the numerator. Caseload size gives the denominator.">
              Ellen's {ELLEN_BASELINE.visitsPerDay} visits/day establishes how many visits she
              delivers, not how many children they are spread across — 20 children seen twice a week
              and 40 seen once a week produce an identical day. One number from Ellen closes it.
            </Callout>

            <div className="ctl">
              <label><span>Ellen's current caseload</span><span>{caseload} children</span></label>
              <input type="range" min={5} max={60} step={1} value={caseload}
                onChange={(e) => setCaseload(Number(e.target.value))} />
              <div className="src">AS-027 · UNKNOWN — one question for Ellen: how many distinct children is she carrying?</div>
            </div>

            <div className="ctl">
              <label><span>EI seen more often than non-EI</span><span>{num(eiRatio, 2)}×</span></label>
              <input type="range" min={0.5} max={3} step={0.25} value={eiRatio}
                onChange={(e) => setEiRatio(Number(e.target.value))} />
              <div className="src">SCENARIO · 1.0 means both types are seen equally often, so the patient mix equals the visit mix</div>
            </div>

            {derived && (
              <>
                <Table head={<tr><th>Derived</th><th className="num">Value</th></tr>}>
                  <tr><td>Weekly visits delivered</td><td className="num">{num(derived.weeklyVisits, 1)}</td></tr>
                  <tr><td>Blended visits / patient / week</td><td className="num"><strong>{num(derived.blendedVisitsPerPatientPerWeek, 2)}</strong></td></tr>
                  <tr><td>EI visits / patient / week</td><td className="num">{num(derived.eiVisitsPerPatientPerWeek, 2)}</td></tr>
                  <tr><td>Non-EI visits / patient / week</td><td className="num">{num(derived.nonEiVisitsPerPatientPerWeek, 2)}</td></tr>
                  <tr><td>EI children / non-EI children</td><td className="num">{num(derived.eiPatients, 1)} / {num(derived.nonEiPatients, 1)}</td></tr>
                </Table>
                <p className="small muted">
                  Weekly visits use the {num(ramp.workingDaysPerWeek, 0)} scheduled clinical days per
                  week. The makeup day is excluded because it carries rescheduled visits from the
                  existing caseload rather than new patients.
                </p>
              </>
            )}

            <details>
              <summary>What each caseload size would imply</summary>
              <Table head={<tr><th className="num">Caseload</th><th className="num">Visits / patient / week</th></tr>}>
                {CASELOAD_REFERENCE_POINTS.map((c) => {
                  const d = deriveFrequencyFromCaseload(scenarioForDerivation, c, eiRatio, clinicians);
                  return (
                    <tr key={c} style={c === caseload ? { background: 'rgba(77,163,255,0.10)' } : undefined}>
                      <td className="num">{c}</td>
                      <td className="num">{d ? num(d.blendedVisitsPerPatientPerWeek, 2) : '—'}</td>
                    </tr>
                  );
                })}
              </Table>
            </details>
          </>
        )}
        <div className="ctl">
          <label><span>EI share of VISITS</span><span>{pct(eiMixShare * 100)}</span></label>
          <input type="range" min={0} max={1} step={0.01} value={eiMixShare}
            onChange={(e) => setEiMix(Number(e.target.value))} />
          <div className="src">AS-019 · observed · drives visit duration</div>
        </div>
        <div className="ctl">
          <label><span>EI share of PATIENTS</span><span>{pct(eiPatientShare * 100)}</span></label>
          <input type="range" min={0} max={1} step={0.01} value={eiPatientShare}
            onChange={(e) => setEiPatientShare(Number(e.target.value))} />
          <div className="src">AS-031 · observed · drives the census split — a different number from the visit share</div>
        </div>
        <div className="ctl">
          <label><span>Monthly discharge rate</span><span>{pct(discharge * 100)}</span></label>
          <input type="range" min={0} max={0.2} step={0.01} value={discharge}
            onChange={(e) => setDischarge(Number(e.target.value))} />
          <div className="src">AS-023 · UNKNOWN — needs Ellen</div>
        </div>
        <div className="ctl">
          <label><span>Target owner compensation after transition</span><span>{money(targetComp)}/yr</span></label>
          <input type="range" min={0} max={200000} step={5000} value={targetComp}
            onChange={(e) => setTargetComp(Number(e.target.value))} />
          <div className="src">AS-024 · UNKNOWN · NOT the same as AS-003 clinician market salary</div>
        </div>
        <div className="ctl">
          <label><span>Minimum cash reserve before transition</span><span>{money(reserve)}</span></label>
          <input type="range" min={0} max={100000} step={5000} value={reserve}
            onChange={(e) => setReserve(Number(e.target.value))} />
          <div className="src">AS-025 · UNKNOWN — a risk-tolerance decision, not a research question</div>
        </div>
        <div className="ctl">
          <label><span>Transition month override</span><span>{override === null ? 'First eligible' : `Month ${override}`}</span></label>
          <input type="range" min={0} max={24} step={1} value={override ?? 0}
            onChange={(e) => setOverride(Number(e.target.value) === 0 ? null : Number(e.target.value))} />
          <div className="src">Scenario control · 0 = use the first eligible month</div>
        </div>
        <div className="ctl" style={{ marginBottom: 0 }}>
          <label><span>Clinicians</span><span>{clinicians}</span></label>
          <input type="range" min={1} max={5} step={1} value={clinicians}
            onChange={(e) => setClinicians(Number(e.target.value))} />
          <div className="src">Existing staffing model remains authoritative</div>
        </div>
      </Card>

      <Card title="Patient milestones">
        <Table head={
          <tr><th>Milestone</th><th className="num">Patients</th><th className="num">Visits/wk</th>
            <th className="num">Visits/day</th><th className="num">Capacity</th>
            <th className="num">Revenue/mo</th><th className="num">Owner comp capacity</th><th className="num">Month</th></tr>
        }>
          {stones.map((s) => (
            <tr key={s.label}>
              <td>{s.label}</td>
              <td className="num">{num(s.activePatients, 0)}</td>
              <td className="num">{num(s.visitsPerWeek, 1)}</td>
              <td className="num">{num(s.visitsPerDay, 2)}</td>
              <td className="num">{pct(s.capacityUtilisation * 100, 0)}</td>
              <td className="num">{money(s.monthlyRevenue)}</td>
              <td className="num">{money(s.ownerCompCapacity)}</td>
              <td className="num">{s.monthReached ?? '—'}</td>
            </tr>
          ))}
        </Table>
        <p className="small muted">
          Where utilisation exceeds 100%, the census is generating more demand than the clinical team
          can serve. Adding clinician #2 is what closes that gap — the staffing model shows its
          economics.
        </p>
      </Card>

      <Card title="Month-by-month timeline">
        <Table head={
          <tr>
            <th>Mo</th><th className="num">Patients</th><th className="num">New</th>
            <th className="num">EI</th><th className="num">Non-EI</th>
            <th className="num">Visits/wk</th><th className="num">Visits/day</th>
            <th className="num">Capacity</th><th className="num">Overflow</th><th className="num">Util</th>
            <th className="num">Revenue</th><th className="num">Costs</th><th className="num">Owner comp</th>
            <th className="num">Cash Δ</th><th className="num">Cash</th><th>Eligible?</th>
          </tr>
        }>
          {ramp.months.map((m) => (
            <tr key={m.month} style={m.month === ramp.transitionMonth ? { background: 'rgba(77,163,255,0.10)' } : undefined}>
              <td>{m.month}</td>
              <td className="num">{num(m.activePatients, 1)}</td>
              <td className="num">{num(m.newPatients, 1)}</td>
              <td className="num">{num(m.eiPatients, 1)}</td>
              <td className="num">{num(m.nonEiPatients, 1)}</td>
              <td className="num">{num(m.demandVisitsPerWeek, 1)}</td>
              <td className="num">{num(m.demandVisitsPerDay, 2)}</td>
              <td className="num">{num(m.capacityVisitsPerDay, 0)}</td>
              <td className="num" style={{ color: m.overflowVisitsPerDay > 0 ? 'var(--warn)' : undefined }}>
                {m.overflowVisitsPerDay > 0 ? num(m.overflowVisitsPerDay, 2) : '—'}
              </td>
              <td className="num">{pct(m.capacityUtilisation * 100, 0)}</td>
              <td className="num">{money(m.monthlyRevenue)}</td>
              <td className="num">{money(m.monthlyNonOwnerCosts)}</td>
              <td className="num">{money(m.ownerCompensation)}</td>
              <td className="num" style={{ color: m.monthlyCashChange < 0 ? 'var(--bad)' : undefined }}>{money(m.monthlyCashChange)}</td>
              <td className="num">{money(m.cumulativeCash)}</td>
              <td><span className={`pill ${m.transitionEligible ? 'good' : 'neutral'}`}>{m.transitionEligible ? 'Yes' : 'No'}</span></td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Sensitivity — acquisition × visit frequency">
        <p className="small muted" style={{ marginTop: 0 }}>
          First month the selected transition criteria are met. Far more useful than pretending we
          know the acquisition rate today.
        </p>
        <Table head={
          <tr><th>Visits/pt/wk</th>{ACQUISITION_LEVELS.map((a) => <th key={a} className="num">{a}/wk</th>)}</tr>
        }>
          {FREQUENCY_LEVELS.map((f) => (
            <tr key={f}>
              <td><strong>{f}</strong></td>
              {ACQUISITION_LEVELS.map((a) => {
                const c = cells.find((x) => x.visitsPerPatientPerWeek === f && x.newPatientsPerWeek === a)!;
                return (
                  <td key={a} className="num">
                    {c.firstEligibleMonth === null
                      ? <span className="muted">not in 24 mo</span>
                      : `M${c.firstEligibleMonth}`}
                  </td>
                );
              })}
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Referral pipeline — structure ready, deliberately empty">
        <p className="small muted" style={{ marginTop: 0 }}>
          Referral research is in progress (roadmap T-006). Once it lands, the generic
          "{num(newPatientsPerWeek, 1)} new patients/week" above can be replaced by per-source
          expected volumes. Inventing conversion rates now would put fabricated numbers at the root
          of every timeline on this screen.
        </p>
        <Table head={<tr><th>Field</th><th>Status</th></tr>}>
          {REFERRAL_FIELDS.map((f) => (
            <tr key={f.key}><td>{f.label}</td><td><span className="pill unknown">Awaiting research</span></td></tr>
          ))}
        </Table>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {referralSources.length} referral sources recorded.
        </p>
      </Card>

      <Card title="Inputs we still need from Ellen">
        <ol className="tight">
          {ELLEN_QUESTIONS.map((q) => <li key={q}>{q}</li>)}
        </ol>
        <Callout tone="warn" title="The cheapest one to answer first">
          How many distinct children are on Ellen's caseload right now (AS-027)? Dividing her weekly
          visits by that number yields visit frequency directly, which is what turns this whole view
          from structure into a grounded timeline. Everything else on this list is useful; this one
          is load-bearing.
        </Callout>
      </Card>

      <Card title="Observed baseline feeding this ramp">
        <Table head={<tr><th>Input</th><th className="num">Value</th><th>Provenance</th></tr>}>
          <tr><td>Visits/day (Ellen's current workload)</td><td className="num">{ELLEN_BASELINE.visitsPerDay}</td><td className="muted">Observed</td></tr>
          <tr><td>EI visit length</td><td className="num">{ELLEN_BASELINE.eiVisitMinutes} min</td><td className="muted">Observed</td></tr>
          <tr><td>Non-EI visit length</td><td className="num">{ELLEN_BASELINE.nonEiVisitMinutes} min</td><td className="muted">Observed</td></tr>
          <tr><td>EI mix</td><td className="num">{pct(ELLEN_BASELINE.eiMixShare * 100)}</td><td className="muted">Approximate — needs confirmation</td></tr>
          <tr><td>Travel per visit</td><td className="num">{ELLEN_BASELINE.travelMinutes} min</td><td className="muted">Observed</td></tr>
          <tr><td>Documentation</td><td className="num">{ELLEN_BASELINE.documentationMinutes} min</td><td className="muted">Observed, 90% in-workday</td></tr>
          <tr><td>Owner compensation before transition</td><td className="num">$0</td><td className="muted">Stated launch plan (AS-026)</td></tr>
        </Table>
      </Card>
    </>
  );
}
