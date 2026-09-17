import { Card, Callout } from '../components/ui';
import { phases, tasks, tasksById } from '../data/roadmap';

export function Roadmap() {
  return (
    <>
      <p className="lead">
        Phases with real dependencies, not a list sorted by category. A task cannot start before the
        tasks it depends on — the tests enforce that the graph is acyclic and never points forward.
      </p>

      <Callout tone="warn" title="Sequence matters more than the list">
        The dependency chain in the agency lane runs entity → licensure → certification → enrollment →
        authorization → care → billing, and two separate state agencies must each be satisfied. Nothing
        downstream can be pulled forward to save time. If D-001 resolves toward the outpatient lane,
        the licensure step may drop out entirely — which is why it is the first thing to answer.
      </Callout>

      {phases.map((p) => {
        const list = tasks.filter((t) => t.phase === p.number);
        return (
          <div key={p.number}>
            <div className="phase-hdr">
              <span className="n">PHASE {p.number}</span>
              <h2>{p.name}</h2>
            </div>
            <Card>
              <p className="small muted" style={{ marginTop: 0 }}>{p.objective}</p>
              <h3>Exit criteria</h3>
              <ul className="tight">{p.exitCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>

              {list.length === 0 ? (
                <p className="small muted" style={{ marginBottom: 0 }}>
                  No tasks detailed yet — this phase is mapped but not yet broken down.
                </p>
              ) : (
                list.map((t) => (
                  <div className={`task${t.blockedBy ? ' blocked' : ''}`} key={t.id}>
                    <div className="t">{t.title}</div>
                    <div className="d">{t.detail}</div>
                    <div className="pills">
                      <span className="pill neutral mono">{t.id}</span>
                      <span className="pill accent">{t.owner}</span>
                      <span className="pill neutral">{t.status}</span>
                      {t.estimatedDurationDays === null
                        ? <span className="pill unknown">Duration unknown</span>
                        : <span className="pill neutral">~{t.estimatedDurationDays}d</span>}
                      {t.dependsOn.map((d) => (
                        <span key={d} className="pill warn mono">
                          after {d}: {tasksById.get(d)?.title.slice(0, 26)}…
                        </span>
                      ))}
                    </div>
                    {t.blockedBy && <div className="small" style={{ color: 'var(--warn)' }}>Blocked — {t.blockedBy}</div>}
                  </div>
                ))
              )}
            </Card>
          </div>
        );
      })}
    </>
  );
}
