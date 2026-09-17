import { Card, Callout, EvidenceRefs } from '../components/ui';
import { decisions } from '../data/decisions';
import { evidenceById } from '../data/evidence';

export function Decisions() {
  return (
    <>
      <p className="lead">
        Options, consequences and reversibility — laid out so you can decide. Nothing here chooses for
        you, and nothing is overwritten when it changes.
      </p>

      {decisions.map((d) => (
        <Card key={d.id} title={d.title} right={<span className={`pill ${d.status === 'Open' ? 'warn' : 'good'}`}>{d.status}</span>}>
          <div className="pills"><span className="pill neutral mono">{d.id}</span><span className="pill accent">Due by phase {d.dueByPhase}</span></div>

          <p className="small"><strong>Question.</strong> {d.question}</p>
          <Callout tone="warn" title="Why it matters">{d.stakes}</Callout>

          {d.options.map((o) => (
            <details key={o.id}>
              <summary>{o.name} — reversibility: {o.reversibility}</summary>
              <div style={{ paddingLeft: 4 }}>
                <p className="small" style={{ marginTop: 0 }}>{o.whatItIs}</p>
                <h3>Requires</h3>
                <ul className="tight">{o.requires.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <h3>Creates</h3>
                <ul className="tight">{o.creates.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <h3>Risks</h3>
                <ul className="tight">{o.risks.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <h3>Tradeoffs</h3>
                <ul className="tight">{o.tradeoffs.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            </details>
          ))}

          <h3 style={{ marginTop: 14 }}>What would change this decision</h3>
          <ul className="tight">{d.whatWouldChangeThis.map((x, i) => <li key={i}>{x}</li>)}</ul>

          <p className="small muted"><strong>Revisit trigger.</strong> {d.revisitTrigger}</p>

          {d.chosenOptionId === null ? (
            <Callout tone="warn">
              Not decided. No option chosen, no rationale recorded — this stays empty until you decide.
            </Callout>
          ) : (
            <Callout tone="good" title={`Decided ${d.decidedOn}`}>{d.rationale}</Callout>
          )}

          <h3>Evidence</h3>
          <EvidenceRefs ids={d.evidenceIds} />
          <details>
            <summary>Show the underlying sources</summary>
            <ul className="tight">
              {d.evidenceIds.map((id) => {
                const e = evidenceById.get(id);
                if (!e) return null;
                return (
                  <li key={id}>
                    <span className="mono">{id}</span> — {e.topic}.{' '}
                    <a className="src-link" href={e.url} target="_blank" rel="noreferrer">{e.source}</a>
                  </li>
                );
              })}
            </ul>
          </details>
        </Card>
      ))}
    </>
  );
}
