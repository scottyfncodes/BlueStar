import { Card, Callout, Table, EvidenceRefs } from '../components/ui';
import { unknownUnknowns, openQuestions, enterpriseLevers } from '../data/misc';

export function Unknowns() {
  return (
    <>
      <p className="lead">
        The "wait, we have to do THAT?" register, the questions that need a professional, and the
        long-horizon levers that decide what this company is eventually worth.
      </p>

      <div className="phase-hdr"><span className="n">01</span><h2>Unknown unknowns</h2></div>
      {unknownUnknowns.map((u) => (
        <Card key={u.id} right={<span className={`pill ${u.status === 'Open' ? 'bad' : u.status === 'Understood' ? 'warn' : 'good'}`}>{u.status}</span>}>
          <h2 style={{ marginTop: 0 }}>{u.surprise}</h2>
          <div className="pills"><span className="pill neutral mono">{u.id}</span><span className="pill accent">{u.owner}</span></div>
          <p className="small">{u.whyItMatters}</p>
          <Table head={<tr><th>Impact</th><th>Assessment</th></tr>}>
            <tr><td className="muted">Cost</td><td>{u.costImpact}</td></tr>
            <tr><td className="muted">Timeline</td><td>{u.timelineImpact}</td></tr>
            <tr><td className="muted">Depends on</td><td className="mono">{u.dependency}</td></tr>
          </Table>
          <EvidenceRefs ids={u.evidenceIds} />
        </Card>
      ))}

      <div className="phase-hdr"><span className="n">02</span><h2>Needs a professional</h2></div>
      <Callout tone="warn" title="Question → why it matters → who to ask → cost">
        These are deliberately framed as questions, not answers. Where professional judgement is
        required, this system identifies who to ask rather than guessing at a conclusion.
      </Callout>
      {openQuestions.map((q) => (
        <Card key={q.id} right={<span className={`pill ${q.priority === 'Critical' ? 'bad' : q.priority === 'High' ? 'warn' : 'neutral'}`}>{q.priority}</span>}>
          <h3 style={{ marginTop: 0 }}>{q.question}</h3>
          <div className="pills">
            <span className="pill neutral mono">{q.id}</span>
            <span className="pill neutral">{q.category}</span>
            {q.blocksTaskIds.map((t) => <span key={t} className="pill warn mono">blocks {t}</span>)}
          </div>
          <Table head={<tr><th>Field</th><th>Value</th></tr>}>
            <tr><td className="muted">Why it matters</td><td>{q.whyItMatters}</td></tr>
            <tr><td className="muted">Ask</td><td>{q.askWho}</td></tr>
            <tr><td className="muted">Estimated cost</td><td>{q.estimatedCostRange}</td></tr>
          </Table>
        </Card>
      ))}

      <div className="phase-hdr"><span className="n">03</span><h2>20-year enterprise view</h2></div>
      <Callout title="Neither exit is being forced">
        The point of tracking these is to keep both doors open: sell the company, or pass it to family.
        Decisions that increase owner dependency quietly close one of them.
      </Callout>
      <Card>
        <Table head={<tr><th>Lever</th><th>Current state</th><th>Direction</th></tr>}>
          {enterpriseLevers.map((l) => (
            <tr key={l.id}>
              <td>{l.lever}<div className="muted" style={{ fontSize: 11 }}>{l.whyItMatters}</div></td>
              <td className="small">{l.currentState}</td>
              <td>
                <span className={`pill ${l.direction === 'At risk' ? 'bad' : l.direction === 'Improving' ? 'good' : 'neutral'}`}>
                  {l.direction}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
