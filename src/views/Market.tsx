import { Card, Callout, Table, ConfidencePill, EvidenceRefs } from '../components/ui';
import { competitors } from '../data/misc';
import { evidenceById } from '../data/evidence';

export function Market() {
  const marketEvidence = ['EV-023', 'EV-010', 'EV-012'].map((id) => evidenceById.get(id)!).filter(Boolean);

  return (
    <>
      <p className="lead">Who else does this in Denver, and what the market data does — and does not — tell us.</p>

      <Callout tone="bad" title="Market research is the least complete area in this build">
        Parent reviews, complaints, clinician experience, turnover, published compensation, ownership and
        company size were not gathered. Denver-metro pediatric Medicaid enrollment — the number that
        would actually size the opportunity — is unknown. Treat this section as a starting list, not an
        analysis.
      </Callout>

      <Card title="Competitors identified">
        {competitors.map((c) => (
          <div key={c.id} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              <ConfidencePill c={c.confidence} />
            </div>
            <div className="pills">
              {c.services.map((s) => <span key={s} className="pill accent">{s}</span>)}
              <span className={`pill ${c.medicaid === 'Yes' ? 'good' : 'neutral'}`}>Medicaid: {c.medicaid}</span>
              <span className={`pill ${c.commercial === 'Yes' ? 'good' : 'neutral'}`}>Commercial: {c.commercial}</span>
            </div>
            <p className="small muted" style={{ marginBottom: 4 }}>{c.location} · {c.serviceArea}</p>
            <p className="small"><strong>Positioning.</strong> {c.positioning}</p>
            <p className="small"><strong>What it signals.</strong> {c.observedPattern}</p>
          </div>
        ))}
      </Card>

      <Card title="The most useful competitive signal">
        <Callout tone="good">
          OASIS Pediatric Therapy runs a deliberately Medicaid-ONLY pediatric therapy model across
          multiple Front Range counties. That is meaningful indirect evidence that Colorado pediatric
          Medicaid home therapy economics work — nobody scales a loss-making model across a region. It
          does not tell us the margin, but it does tell us the model is survivable.
        </Callout>
      </Card>

      <Card title="Market data on file">
        <Table head={<tr><th>Topic</th><th>What we know</th><th>Confidence</th></tr>}>
          {marketEvidence.map((e) => (
            <tr key={e.id}>
              <td>{e.topic}<div className="muted mono" style={{ fontSize: 10.5 }}>{e.id}</div></td>
              <td className="small">{e.claim}</td>
              <td><ConfidencePill c={e.confidence} /></td>
            </tr>
          ))}
        </Table>
        <EvidenceRefs ids={marketEvidence.map((e) => e.id)} />
      </Card>

      <Card title="What we would need to actually size this market">
        <ul className="tight">
          <li>Children under 21 enrolled in Health First Colorado, by Denver-metro county</li>
          <li>Prevalence of therapy-relevant diagnoses in that population</li>
          <li>Current pediatric therapy utilisation rates and unmet demand / waitlists</li>
          <li>Referral-source density: pediatricians, children's hospital, early intervention, specialty clinics</li>
          <li>Pediatric therapy workforce supply in the metro, and current vacancy rates</li>
        </ul>
        <p className="small muted">
          HCPF publishes county-level enrollment dashboards. That is the right primary source and was not
          reachable this session.
        </p>
      </Card>
    </>
  );
}
