import { Card, Callout, ConfidencePill, KindPill, Table, EvidenceRefs } from '../components/ui';
import { assumptions } from '../data/assumptions';

export function Assumptions() {
  const critical = assumptions.filter((a) => a.financialImpact === 'Critical');
  const unknown = assumptions.filter((a) => a.value === null || a.confidence === 'Unknown');

  return (
    <>
      <p className="lead">
        Every number the financial model uses lives here. Change a belief and the model changes — and no
        figure can quietly acquire more authority than its evidence supports.
      </p>

      <Callout tone="bad" title={`${unknown.length} of ${assumptions.length} assumptions are unknown or unverified`}>
        {critical.filter((a) => a.confidence === 'Unknown').length} of them carry CRITICAL financial
        impact. A null value is a deliberate state here, not an oversight — inventing a number to fill
        the gap would produce confident nonsense.
      </Callout>

      {assumptions.map((a) => (
        <Card key={a.id} title={a.name} right={<ConfidencePill c={a.confidence} />}>
          <div className="pills">
            <span className="pill neutral mono">{a.id}</span>
            <KindPill k={a.kind} />
            <span className={`pill ${a.financialImpact === 'Critical' ? 'bad' : a.financialImpact === 'High' ? 'warn' : 'neutral'}`}>
              Financial: {a.financialImpact}
            </span>
            <span className={`pill ${a.operationalImpact === 'Critical' ? 'bad' : a.operationalImpact === 'High' ? 'warn' : 'neutral'}`}>
              Operational: {a.operationalImpact}
            </span>
          </div>

          <div style={{ fontSize: 24, fontWeight: 600, margin: '8px 0' }}>
            {a.value === null
              ? <span style={{ color: 'var(--unknown)', fontSize: 17 }}>UNKNOWN — deliberately unset</span>
              : <>{a.value.toLocaleString('en-US')} <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>{a.unit}</span></>}
          </div>

          <Table head={<tr><th>Field</th><th>Value</th></tr>}>
            <tr><td className="muted">Source</td><td>{a.source}</td></tr>
            <tr><td className="muted">Why this value</td><td>{a.whyThisValue}</td></tr>
            <tr><td className="muted">What would invalidate it</td><td>{a.whatWouldInvalidate}</td></tr>
            <tr><td className="muted">Last verified</td><td>{a.lastVerified}</td></tr>
            <tr><td className="muted">Revisit</td><td>{a.revisitDate}</td></tr>
          </Table>

          <h3>Evidence</h3>
          <EvidenceRefs ids={a.evidenceIds} />
        </Card>
      ))}
    </>
  );
}
