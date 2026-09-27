import { Card, Stat, Callout, money, num, EvidenceRefs } from '../components/ui';
import { phases, tasks } from '../data/roadmap';
import { decisions } from '../data/decisions';
import { assumptions } from '../data/assumptions';
import { evidence } from '../data/evidence';
import { unknownUnknowns, openQuestions } from '../data/misc';
import { costs } from '../data/costs';
import { viabilityCheck, annualModel, visitCycle, capacityVolume } from '../model/economics';
import { capitalRequirement } from '../model/capital';
import { defaultScenario, SALARY_TEST_POINTS, ELLEN_BASELINE } from '../model/defaults';
import { laneComparison } from '../model/outpatient';
import { assumptionValue } from '../data/assumptions';

export function Dashboard({ go }: { go: (v: string) => void }) {
  const scenario = defaultScenario();

  // Where the model cannot compute, show what it WOULD take rather than nothing.
  const testedSalary = SALARY_TEST_POINTS[1];
  const tested = { ...scenario, clinicianSalary: testedSalary.value };
  const testedViability = viabilityCheck(tested);
  const testedModel = annualModel(tested);
  const capital = capitalRequirement(costs, tested, 6);
  const cycle = visitCycle(tested);
  const volume = capacityVolume(tested);

  const phase = phases[0];
  const openDecisions = decisions.filter((d) => d.status === 'Open');
  const criticalAssumptions = assumptions.filter((a) => a.financialImpact === 'Critical');
  const unknownCritical = criticalAssumptions.filter((a) => a.confidence === 'Unknown');
  const nextTasks = tasks.filter((t) => t.phase === 0 && t.dependsOn.length === 0).slice(0, 3);
  const verifyFirst = evidence.filter((e) => e.requiresProfessionalVerification);

  // Same schedule, two payment mechanics. Rates come from the register, never from here.
  const lanes = laneComparison({
    homeHealthRatePerVisit: scenario.reimbursementPerVisit,
    outpatientRatePerUnit: assumptionValue('AS-032') ?? 0,
    eiVisitMinutes: scenario.eiVisitMinutes,
    nonEiVisitMinutes: scenario.nonEiVisitMinutes,
    eiVisitShare: scenario.eiMixShare,
    visitsPerWeek: ELLEN_BASELINE.visitsPerWeek,
  });

  return (
    <>
      <p className="lead">
        Where we are, what we know, what we don't, and what happens next.
      </p>

      <Callout tone="good" title={ELLEN_BASELINE.label}>
        <strong style={{ display: 'inline', fontWeight: 600 }}>{ELLEN_BASELINE.visitsPerDay} visits/day</strong>{' '}
        ({ELLEN_BASELINE.workdaySpan}), ~{ELLEN_BASELINE.patientFacingMinutes}m patient-facing +{' '}
        ~{ELLEN_BASELINE.travelMinutes}m travel = a {ELLEN_BASELINE.cycleMinutes}-minute cycle.
        This is now the productivity baseline throughout the model, replacing four earlier guesses.
        <div style={{ marginTop: 6, fontStyle: 'italic' }}>{ELLEN_BASELINE.caveat}</div>
      </Callout>

      <Card title="WHERE WE ARE">
        <div className="grid">
          <Stat label="Current phase" value={`${phase.number} — ${phase.name}`} note={phase.objective} />
          <Stat label="Open decisions" value={String(openDecisions.length)} note="None decided yet" />
          <Stat
            label="Critical assumptions unknown"
            value={`${unknownCritical.length} of ${criticalAssumptions.length}`}
            note="Financially critical inputs with no established value"
          />
          <Stat
            label="Capital requirement"
            value="UNKNOWN"
            unknown
            note="Cannot be computed until clinician cost is established"
          />
        </div>
      </Card>

      <Callout tone="bad" title="The single most important thing to resolve">
        <strong style={{ display: 'inline', fontWeight: 600 }}>D-001 — which regulatory lane?</strong>{' '}
        There are two legally distinct ways to deliver pediatric therapy in a child's home in Colorado:
        as a licensed home care agency billing a flat per-visit rate, or as an outpatient PT/OT provider
        billing timed CPT codes with the home as place of service. The 2026-09-27 verification pass
        changed the picture: the agency lane also needs <em>Medicare certification</em>, which needs
        <em> skilled nursing</em> on staff, and new home health agencies are under a <em>nationwide
        Medicare enrollment freeze</em> since May 13, 2026. So for now only the outpatient lane is open —
        and its per-unit rates are now read directly too (EV-050) — see the lane comparison below. Every
        other dollar figure on this page still assumes the home health rate, now $140.16 (read directly
        from the FY2026-27 schedule; the app previously carried $143.02, the October 2025 figure).
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => go('decisions')}>Open decision D-001</button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => go('unknowns')}>What changed</button>
        </div>
      </Callout>

      <Card title="Two lanes, one schedule — what a visit is worth">
        <p className="small muted" style={{ marginTop: 0 }}>
          The home health lane pays a flat rate per visit and is closed to new agencies for now. The
          outpatient lane pays per 15-minute unit and is open. Both rates below were read directly from
          HCPF schedules (EV-007, EV-050). Gross figures, before collection loss, mileage and pay.
        </p>
        <div className="grid">
          <Stat
            label={`${lanes.ei.minutes}-minute EI visit`}
            value={`${money(lanes.ei.outpatient)} vs ${money(lanes.ei.homeHealth)}`}
            note={`Outpatient (${lanes.ei.units} units at 97530) vs home health`}
          />
          <Stat
            label={`${lanes.nonEi.minutes}-minute visit`}
            value={`${money(lanes.nonEi.outpatient)} vs ${money(lanes.nonEi.homeHealth)}`}
            note={`Outpatient (${lanes.nonEi.units} units at 97530) vs home health`}
          />
          <Stat
            label="Weighted, Ellen's mix"
            value={`${money(lanes.weighted.outpatient)} vs ${money(lanes.weighted.homeHealth)}`}
            note={`Outpatient earns ${Math.round(lanes.weighted.ratio * 100)}% of home health per visit`}
          />
          {lanes.weeklyGross && (
            <Stat
              label={`Gross per week, ${ELLEN_BASELINE.visitsPerWeek} visits`}
              value={`${money(lanes.weeklyGross.outpatient)} vs ${money(lanes.weeklyGross.homeHealth)}`}
              note="Same schedule, two payment mechanics"
            />
          )}
        </div>
        <Callout tone="warn" title="Read this with two caveats">
          {lanes.note} The outpatient figures use the January 2026 schedule, which predates the July
          2026 2% cut, and assume 97530 for every unit; 97110 pays about 8% less. Every other dollar
          figure on this page still uses the home health rate.
        </Callout>
        <div style={{ marginTop: 10 }}>
          <EvidenceRefs ids={['EV-050', 'EV-044', 'EV-007']} />
        </div>
      </Card>

      <Card title="Can this business actually work?">
        <p className="small muted" style={{ marginTop: 0 }}>
          The test that matters in a flat per-visit model is not margin per visit — it is whether the
          caseload needed to break even physically fits in a working day once travel and documentation
          are counted.
        </p>

        <Callout tone={testedViability.breakEvenIsAchievable ? 'good' : 'bad'}>
          <strong>Modelled at {money(testedSalary.value)} salary ({testedSalary.label})</strong>
          {testedViability.verdict}
        </Callout>

        <div className="grid">
          <Stat
            label="Break-even visits/day"
            value={num(testedViability.breakEvenVisitsPerDay, 2)}
            note="Per clinician, to cover loaded cost + overhead"
          />
          <Stat
            label="Max visits that fit an 8h day"
            value={String(testedViability.maxFeasibleVisitsPerDay)}
            note={`${num(cycle.patientFacingMinutes, 0)}m visit + ${num(cycle.travelMinutes, 0)}m travel = ${num(cycle.cycleMinutes, 0)}m cycle`}
          />
          <Stat
            label="Operating profit (1 clinician)"
            value={money(testedModel.operatingProfit)}
            note={`At ${num(volume.visitsPerDay, 0)} visits/day`}
          />
          <Stat
            label="Working capital needed"
            value={money(testedModel.workingCapitalRequired)}
            note={`Cash tied up over ${scenario.daysToCash} days to payment`}
          />
        </div>

        <Callout tone="warn" title="Read this as a demonstration, not a forecast">
          The salary above is a TEST POINT, not an estimate. Public sources disagree on Denver pediatric
          PT pay by more than $56,000 ({money(SALARY_TEST_POINTS[0].value)} to{' '}
          {money(SALARY_TEST_POINTS[2].value)}), so the register deliberately holds no value. Until that
          is resolved, treat every figure on this card as illustrative arithmetic.
        </Callout>

        <div className="btn-row" style={{ marginTop: 10, marginBottom: 0 }}>
          <button className="btn" onClick={() => go('simulator')}>Change the assumptions</button>
          <button className="btn" onClick={() => go('economics')}>See the full math</button>
        </div>
      </Card>

      <Card title="Next 3 moves">
        {nextTasks.map((t, i) => (
          <div className="task" key={t.id}>
            <div className="t">{i + 1}. {t.title}</div>
            <div className="d">{t.detail}</div>
            <div className="pills">
              <span className="pill accent">{t.owner}</span>
              <span className="pill neutral mono">{t.id}</span>
            </div>
            {t.blockedBy && (
              <div className="small" style={{ color: 'var(--warn)' }}>Needs: {t.blockedBy}</div>
            )}
          </div>
        ))}
        <button className="btn" onClick={() => go('roadmap')}>Full roadmap</button>
      </Card>

      <div className="grid">
        <Card title="Biggest unknowns">
          <ul className="tight">
            {unknownCritical.map((a) => (
              <li key={a.id}>
                <span className="mono">{a.id}</span> — {a.name}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={() => go('assumptions')}>Assumption register</button>
        </Card>

        <Card title="Biggest surprises found">
          <ul className="tight">
            {unknownUnknowns.slice(0, 4).map((u) => (
              <li key={u.id}>{u.surprise}</li>
            ))}
          </ul>
          <button className="btn" onClick={() => go('unknowns')}>Unknown unknowns</button>
        </Card>
      </div>

      <Card title="Evidence health">
        <div className="grid">
          <Stat label="Evidence records" value={String(evidence.length)} />
          <Stat label="Need professional verification" value={String(verifyFirst.length)} note="Before driving a real decision" />
          <Stat
            label="Read directly from source"
            value={String(evidence.filter((e) => e.retrieval === 'direct-read').length)}
            note="Documents Scott supplied; network policy still blocks the primary hosts"
          />
          <Stat label="Critical open questions" value={String(openQuestions.filter((q) => q.priority === 'Critical').length)} />
        </div>
        <Callout tone="warn" title="Provenance warning">
          Every record in this build was reached through a search index that summarised the primary
          document — not by opening the document itself. A second pass on 2026-09-27 cross-checked the
          key figures against multiple independent summaries, and Scott then supplied three primary
          documents (the FY2026-27 fee schedule, the HCPF therapy training deck, and C.R.S. 25-27.5-103)
          which were read directly and corrected the modelling rate. Everything else still needs one
          human verification pass before it drives a real decision.
        </Callout>
        <button className="btn" onClick={() => go('evidence')}>Evidence database</button>
      </Card>

      <Card title="Capital — what we can and cannot say">
        <div className="grid">
          <Stat label="One-time startup (known lines)" value={money(capital.oneTimeStartup.typical)} note="Excludes unknown lines" />
          <Stat label="Monthly burn (known lines)" value={money(capital.monthlyBurn.typical)} note="Excludes clinician payroll" />
          <Stat label="Pre-revenue burn (6 mo)" value={money(capital.preRevenueBurn.typical)} />
          <Stat label="Unpriced required lines" value={String(capital.oneTimeStartup.unknownItems.length + capital.monthlyBurn.unknownItems.length)} unknown />
        </div>
        <Callout tone="bad" title="This total is incomplete and therefore too low">
          {capital.completeness}
        </Callout>
        <div style={{ marginTop: 10 }}>
          <EvidenceRefs ids={['EV-007', 'EV-016', 'EV-021']} />
        </div>
        <button className="btn" onClick={() => go('capital')}>Capital & cash</button>
      </Card>
    </>
  );
}
