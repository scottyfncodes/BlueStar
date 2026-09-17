import { useState } from 'react';
import { Card, Callout, Table, num } from '../components/ui';
import { processes } from '../data/automation';
import { costs } from '../data/costs';
import type { AutomationClass } from '../types';

const TONE: Record<AutomationClass, string> = {
  AI: 'accent', AUTOMATION: 'good', 'HUMAN + AI': 'warn', HUMAN: 'bad', ELIMINATE: 'unknown',
};

export function Automation() {
  const [filter, setFilter] = useState<AutomationClass | 'ALL'>('ALL');
  const classes: AutomationClass[] = ['AI', 'AUTOMATION', 'HUMAN + AI', 'HUMAN', 'ELIMINATE'];
  const shown = filter === 'ALL' ? processes : processes.filter((p) => p.classification === filter);
  const totalSaved = processes.reduce((a, p) => a + (p.estimatedHoursPerWeekSaved ?? 0), 0);
  const killList = costs.filter((c) => c.kill !== null);

  return (
    <>
      <p className="lead">
        For every recurring process: does a human actually need to do this? The goal is not maximum
        automation — it is minimum unnecessary human labour, with hard floors where judgement and trust
        live.
      </p>

      <Callout tone="bad" title="What must stay human">
        Clinical judgement, medical necessity decisions, parent conversations about a child, referral
        relationships and hiring. These are marked with an explicit human floor and the test suite
        enforces that anything rated unacceptable-to-automate stays classified HUMAN. In a business
        whose product is a clinician's judgement and a parent's trust, automating these would destroy
        the thing being sold.
      </Callout>

      <Card title="Summary">
        <div className="grid">
          {classes.map((c) => (
            <div className="stat" key={c}>
              <div className="label">{c}</div>
              <div className="value">{processes.filter((p) => p.classification === c).length}</div>
              <div className="note">{
                c === 'HUMAN' ? 'Protected — a person must do it'
                : c === 'ELIMINATE' ? 'Should not exist'
                : c === 'HUMAN + AI' ? 'AI prepares, human decides'
                : c === 'AI' ? 'AI does the work, human oversees'
                : 'Rules and software'
              }</div>
            </div>
          ))}
        </div>
        <Callout tone="good" title={`~${num(totalSaved, 0)} hours/week of potential admin relief`}>
          That is roughly one full-time administrative role never hired — the difference between a
          company that needs back-office headcount to grow and one that does not.
        </Callout>
      </Card>

      <div className="btn-row">
        <button className={`btn${filter === 'ALL' ? ' active' : ''}`} onClick={() => setFilter('ALL')}>All ({processes.length})</button>
        {classes.map((c) => (
          <button key={c} className={`btn${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {shown.map((p) => (
        <Card key={p.id} title={p.process} right={<span className={`pill ${TONE[p.classification]}`}>{p.classification}</span>}>
          <div className="pills">
            <span className="pill neutral mono">{p.id}</span>
            <span className="pill neutral">{p.area}</span>
            <span className={`pill ${p.riskIfAutomated === 'Unacceptable' ? 'bad' : p.riskIfAutomated === 'High' ? 'warn' : 'neutral'}`}>
              Risk if automated: {p.riskIfAutomated}
            </span>
            <span className="pill accent">Phase {p.phase}</span>
          </div>
          <p className="small">{p.rationale}</p>
          {p.humanFloor && (
            <Callout tone="bad" title="Human floor">{p.humanFloor}</Callout>
          )}
          <p className="small muted" style={{ marginBottom: 0 }}>
            {p.estimatedHoursPerWeekSaved !== null ? `~${p.estimatedHoursPerWeekSaved} hrs/week saved` : 'No time saving — this is human work'}
            {p.enablingTool ? ` · ${p.enablingTool}` : ''}
          </p>
        </Card>
      ))}

      <div className="phase-hdr"><span className="n">OVERHEAD</span><h2>Kill List</h2></div>
      <Card>
        <p className="small muted" style={{ marginTop: 0 }}>
          Every recurring expense scored against ten questions. The goal is not cheapness — it is
          maximum useful output per dollar of overhead.
        </p>
        <Table head={<tr><th>Item</th><th>Verdict</th><th>Reasoning</th></tr>}>
          {killList.map((c) => (
            <tr key={c.id}>
              <td>{c.item}<div className="muted mono" style={{ fontSize: 10.5 }}>{c.id}</div></td>
              <td>
                <span className={`pill ${
                  c.kill!.verdict === 'Eliminate' ? 'bad'
                  : c.kill!.verdict === 'Defer' ? 'warn'
                  : c.kill!.verdict === 'Revisit at scale' ? 'unknown' : 'good'}`}>
                  {c.kill!.verdict}
                </span>
              </td>
              <td className="muted">{c.kill!.note}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
