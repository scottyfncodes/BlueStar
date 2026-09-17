import { Card, Callout, Rating, Table } from '../components/ui';
import { paths } from '../data/paths';

export function Paths() {
  return (
    <>
      <p className="lead">
        Five legitimate structures. None is marked best — the ratings describe what each path demands
        and produces so you can weigh them against what you actually want.
      </p>

      <Callout tone="warn" title="Paths A–D and Path E vary different things">
        A through D vary the DISCIPLINE MIX. Path E varies the REGULATORY LANE and can be combined with
        any of them. Path E is also conditional: it does not exist as an option until D-001 is answered
        by counsel.
      </Callout>

      <Card title="Side by side">
        <Table head={
          <tr>
            <th>Path</th><th className="num">Capital</th><th className="num">Recruiting</th>
            <th className="num">Admin</th><th className="num">Revenue</th><th className="num">Risk</th>
            <th className="num">Ellen dep.</th>
          </tr>
        }>
          {paths.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.id}</strong><div className="muted" style={{ fontSize: 11 }}>{p.name}</div></td>
              <td className="muted" style={{ fontSize: 11 }}>{p.initialCapitalBand}</td>
              <td className="num">{p.recruitingComplexity}</td>
              <td className="num">{p.adminComplexity}</td>
              <td className="num">{p.revenuePotential}</td>
              <td className="num">{p.operationalRisk}</td>
              <td className="num">{p.ellenDependency}</td>
            </tr>
          ))}
        </Table>
      </Card>

      {paths.map((p) => (
        <Card key={p.id} title={`${p.id} — ${p.name}`}>
          <p className="small" style={{ marginTop: 0 }}>{p.summary}</p>
          <div className="pills">
            {p.disciplines.map((d) => <span key={d} className="pill accent">{d}</span>)}
            <span className="pill neutral">{p.staffingModel}</span>
          </div>

          <div className="grid" style={{ marginTop: 12 }}>
            <div>
              <Rating label="Recruiting complexity" value={p.recruitingComplexity} />
              <Rating label="Admin complexity" value={p.adminComplexity} />
              <Rating label="Clinical complexity" value={p.clinicalComplexity} />
              <Rating label="Revenue potential" value={p.revenuePotential} />
              <Rating label="Overhead" value={p.overhead} />
            </div>
            <div>
              <Rating label="Operational risk" value={p.operationalRisk} />
              <Rating label="Dependency on Ellen" value={p.ellenDependency} />
              <Rating label="Owner workload" value={p.ownerWorkload} />
              <Rating label="Speed to multidisciplinary" value={p.speedToMultidisciplinary} />
            </div>
          </div>

          <Table head={<tr><th>Dimension</th><th>Assessment</th></tr>}>
            <tr><td className="muted">Initial capital</td><td>{p.initialCapitalBand}</td></tr>
            <tr><td className="muted">Time to scale</td><td>{p.timeToScale}</td></tr>
            <tr><td className="muted">Enterprise value</td><td>{p.enterpriseValueNote}</td></tr>
            <tr><td className="muted">Best when</td><td>{p.bestWhen}</td></tr>
            <tr><td className="muted">Worst when</td><td>{p.worstWhen}</td></tr>
          </Table>
        </Card>
      ))}
    </>
  );
}
