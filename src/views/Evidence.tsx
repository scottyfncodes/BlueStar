import { useState } from 'react';
import { Card, Callout, ConfidencePill, Table } from '../components/ui';
import { evidence } from '../data/evidence';
import type { CategoryId } from '../types';

export function Evidence() {
  const [cat, setCat] = useState<CategoryId | 'ALL'>('ALL');
  const cats = Array.from(new Set(evidence.map((e) => e.category))).sort();
  const shown = cat === 'ALL' ? evidence : evidence.filter((e) => e.category === cat);

  return (
    <>
      <p className="lead">
        Every external fact with its source, date, interpretation and confidence — and an explicit note
        on how it was actually retrieved.
      </p>

      <Callout tone="bad" title="Read this before trusting any number here">
        This session's network policy blocked direct HTTPS access to colorado.gov, sos.state.co.us and
        several legal-reference hosts (403 at the egress proxy). Every record below was reached through
        a search index that summarised the primary document — <strong style={{ display: 'inline' }}>no
        source PDF was opened and read</strong>. The URLs are correct and are the right primary sources,
        but each figure needs one human verification pass before it drives a real decision.
      </Callout>

      <div className="btn-row">
        <button className={`btn${cat === 'ALL' ? ' active' : ''}`} onClick={() => setCat('ALL')}>All ({evidence.length})</button>
        {cats.map((c) => (
          <button key={c} className={`btn${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
            {c} ({evidence.filter((e) => e.category === c).length})
          </button>
        ))}
      </div>

      {shown.map((e) => (
        <Card key={e.id} title={e.topic} right={<ConfidencePill c={e.confidence} />}>
          <div className="pills">
            <span className="pill neutral mono">{e.id}</span>
            <span className="pill neutral">{e.category}</span>
            <span className={`pill ${e.retrieval === 'direct-read' ? 'good' : 'warn'}`}>
              {e.retrieval === 'direct-read' ? 'Source read directly' : 'Search summary only'}
            </span>
            {e.requiresProfessionalVerification && <span className="pill bad">Needs verification</span>}
          </div>

          <h3>Claim</h3>
          <p className="small" style={{ marginTop: 0 }}>{e.claim}</p>

          <h3>What it means for Blue Star</h3>
          <p className="small" style={{ marginTop: 0 }}>{e.interpretation}</p>

          <Table head={<tr><th>Field</th><th>Value</th></tr>}>
            <tr><td className="muted">Source</td><td>{e.source}</td></tr>
            <tr><td className="muted">Document</td><td>{e.document}</td></tr>
            <tr><td className="muted">URL</td><td><a className="src-link" href={e.url} target="_blank" rel="noreferrer">{e.url}</a></td></tr>
            <tr><td className="muted">Section</td><td>{e.section ?? '—'}</td></tr>
            <tr><td className="muted">Published</td><td>{e.publicationDate ?? 'Not stated'}</td></tr>
            <tr><td className="muted">Effective</td><td>{e.effectiveDate ?? 'Not stated'}</td></tr>
            <tr><td className="muted">Accessed</td><td>{e.accessedDate}</td></tr>
            <tr><td className="muted">Recheck by</td><td>{e.recheckDate}</td></tr>
            <tr><td className="muted">Applies to</td><td>{e.appliesTo.join(', ')}</td></tr>
          </Table>

          {e.notes && <Callout tone="warn" title="Notes">{e.notes}</Callout>}
        </Card>
      ))}
    </>
  );
}
