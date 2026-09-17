import type { ReactNode } from 'react';
import type { Confidence, FactKind } from '../types';

export function Card({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="card">
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h2>{title}</h2>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, value, note, unknown }: { label: string; value: string; note?: string; unknown?: boolean }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className={unknown ? 'value unknown' : 'value'}>{value}</div>
      {note && <div className="note">{note}</div>}
    </div>
  );
}

const CONFIDENCE_TONE: Record<Confidence, string> = {
  Confirmed: 'good',
  'Strong evidence': 'good',
  'Reasonable estimate': 'warn',
  Unverified: 'warn',
  Unknown: 'unknown',
};

export function ConfidencePill({ c }: { c: Confidence }) {
  return <span className={`pill ${CONFIDENCE_TONE[c]}`}>{c}</span>;
}

const KIND_LABEL: Record<FactKind, string> = {
  LIVE_RESEARCH: 'Live research',
  SAVED_EVIDENCE: 'Saved evidence',
  USER_PROVIDED: 'User provided',
  ACTUAL_QUOTE: 'Actual quote',
  ASSUMPTION: 'Assumption',
};

/** Keeps the PART 37 categories visually distinct so they never blur. */
export function KindPill({ k }: { k: FactKind }) {
  const tone = k === 'ACTUAL_QUOTE' ? 'good' : k === 'ASSUMPTION' ? 'unknown' : k === 'USER_PROVIDED' ? 'accent' : 'neutral';
  return <span className={`pill ${tone}`}>{KIND_LABEL[k]}</span>;
}

export function Callout({ tone = 'accent', title, children }: { tone?: 'accent' | 'good' | 'warn' | 'bad'; title?: string; children: ReactNode }) {
  return (
    <div className={`callout ${tone === 'accent' ? '' : tone}`}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Rating({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span className="muted">{label}</span>
        <span className="mono">{value}/5</span>
      </div>
      <div className="bar"><div style={{ width: `${(value / 5) * 100}%` }} /></div>
    </div>
  );
}

/** Money formatter that never renders a null as $0. */
export function money(n: number | null | undefined, opts: { decimals?: number } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'UNKNOWN';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  });
}

export function num(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'UNKNOWN';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function pct(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'UNKNOWN';
  return `${n.toFixed(decimals)}%`;
}

export function EvidenceRefs({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <span className="pill unknown">No evidence</span>;
  return (
    <div className="pills">
      {ids.map((id) => <span key={id} className="pill neutral mono">{id}</span>)}
    </div>
  );
}
