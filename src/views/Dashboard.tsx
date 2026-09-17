import { Card, Stat, Callout, money, num, EvidenceRefs } from '../components/ui';
import { phases, tasks } from '../data/roadmap';
import { decisions } from '../data/decisions';
import { assumptions } from '../data/assumptions';
import { evidence } from '../data/evidence';
import { unknownUnknowns, openQuestions } from '../data/misc';
import { costs } from '../data/costs';
import { viabilityCheck, annualModel } from '../model/economics';
import { capitalRequirement } from '../model/capital';
import { defaultScenario, SALARY_TEST_POINTS } from '../model/defaults';

export function Dashboard({ go }: { go: (v: string) => void }) {
  const scenario = defaultScenario();

  // Where the model cannot compute, show what it WOULD take rather than nothing.
  const testedSalary = SALARY_TEST_POINTS[1];
  const tested = { ...scenario, clinicianSalary: testedSalary.value };
  const testedViability = viabilityCheck(tested);
  const testedModel = annualModel(tested);
  const capital = capitalRequirement(costs, tested, 6);

  const phase = phases[0];
  const openDecisions = decisions.filter((d) => d.status === 'Open');
  const criticalAssumptions = assumptions.filter((a) => a.financialImpact === 'Critical');
  const unknownCritical = criticalAssumptions.filter((a) => a.confidence === 'Unknown');
  const nextTasks = tasks.filter((t) => t.phase === 0 && t.dependsOn.length === 0).slice(0, 3);
  const verifyFirst = evidence.filter((e) => e.requiresProfessionalVerification);

  return (
    <>
      <p className="lead">
        Where we are, what we know, what we don't, and what happens next.
      </p>

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
        Research surfaced what looks like two legally distinct ways to deliver pediatric therapy in a
        child's home in Colorado: as a licensed home care agency billing a flat per-visit rate, or as
        an outpatient PT/OT provider billing timed CPT codes with the home as place of service. These
        have different licences, timelines, capital needs and revenue mechanics. Almost every number in
        this system depends on which one applies — and the question has not been answered by a lawyer.
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => go('decisions')}>Open decision D-001</button>
        </div>
      </Callout>

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
            note={`${scenario.visitLengthMinutes}m visit + ${scenario.travelMinutesPerVisit}m travel + ${scenario.documentationMinutesPerVisit}m notes`}
          />
          <Stat
            label="Operating profit (1 clinician)"
            value={money(testedModel.operatingProfit)}
            note="At the assumed 5 visits/day"
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
          <Stat label="Read directly from source" value="0" unknown note="Network policy blocked colorado.gov this session" />
          <Stat label="Critical open questions" value={String(openQuestions.filter((q) => q.priority === 'Critical').length)} />
        </div>
        <Callout tone="warn" title="Provenance warning">
          Every record in this build was reached through a search index that summarised the primary
          document — not by opening the document itself. The URLs are correct primary sources, but no
          figure here has been read off a source PDF. One human verification pass is required before
          any of it drives a real decision.
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
