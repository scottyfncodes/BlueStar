import { describe, it, expect } from 'vitest';
import { evidence, evidenceById } from '../data/evidence';
import { assumptions } from '../data/assumptions';
import { decisions } from '../data/decisions';
import { tasks, phases, tasksById } from '../data/roadmap';
import { costs } from '../data/costs';
import { paths } from '../data/paths';
import { processes } from '../data/automation';
import { competitors, unknownUnknowns, openQuestions, enterpriseLevers } from '../data/misc';

describe('evidence integrity', () => {
  it('has unique IDs', () => {
    const ids = evidence.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every record has a real URL', () => {
    for (const e of evidence) {
      expect(e.url, `${e.id} missing URL`).toMatch(/^https?:\/\//);
    }
  });

  it('every record has a claim, source and interpretation', () => {
    for (const e of evidence) {
      expect(e.claim.length, `${e.id} claim too short`).toBeGreaterThan(20);
      expect(e.source.length, `${e.id} source missing`).toBeGreaterThan(2);
      expect(e.interpretation.length, `${e.id} interpretation missing`).toBeGreaterThan(20);
    }
  });

  it('every record declares how it was retrieved', () => {
    for (const e of evidence) {
      expect(['direct-read', 'search-summary', 'not-accessed']).toContain(e.retrieval);
    }
  });

  it('every record has a recheck date in ISO form', () => {
    for (const e of evidence) {
      expect(e.recheckDate, `${e.id} bad recheck date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('financial claims are never marked Confirmed without a direct read', () => {
    // Guard against the exact failure mode this system exists to prevent:
    // a number acquiring more authority than its provenance supports.
    for (const e of evidence) {
      if (e.confidence === 'Confirmed') {
        expect(e.retrieval, `${e.id} claims Confirmed but was not directly read`).toBe('direct-read');
      }
    }
  });
});

describe('assumption register integrity', () => {
  it('has unique IDs', () => {
    const ids = assumptions.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every evidence reference resolves', () => {
    for (const a of assumptions) {
      for (const ref of a.evidenceIds) {
        expect(evidenceById.has(ref), `${a.id} references missing ${ref}`).toBe(true);
      }
    }
  });

  it('a null value is always explained', () => {
    for (const a of assumptions.filter((x) => x.value === null)) {
      expect(a.whyThisValue.length, `${a.id} null without explanation`).toBeGreaterThan(20);
      expect(a.confidence).toBe('Unknown');
    }
  });

  it('an assumption with no evidence is never high confidence', () => {
    for (const a of assumptions) {
      if (a.evidenceIds.length === 0) {
        expect(
          ['Confirmed', 'Strong evidence'].includes(a.confidence),
          `${a.id} claims ${a.confidence} with no evidence`,
        ).toBe(false);
      }
    }
  });

  it('every assumption says what would invalidate it', () => {
    for (const a of assumptions) {
      expect(a.whatWouldInvalidate.length, `${a.id}`).toBeGreaterThan(15);
    }
  });
});

describe('decision log integrity', () => {
  it('every decision has at least two options', () => {
    for (const d of decisions) {
      expect(d.options.length, `${d.id} needs real alternatives`).toBeGreaterThanOrEqual(2);
    }
  });

  it('every option states requires, creates and risks', () => {
    for (const d of decisions) {
      for (const o of d.options) {
        expect(o.requires.length, `${o.id} requires`).toBeGreaterThan(0);
        expect(o.creates.length, `${o.id} creates`).toBeGreaterThan(0);
        expect(o.risks.length, `${o.id} risks`).toBeGreaterThan(0);
      }
    }
  });

  it('an undecided decision has no chosen option or rationale', () => {
    for (const d of decisions.filter((x) => x.status === 'Open')) {
      expect(d.chosenOptionId, `${d.id} is Open but has a choice`).toBeNull();
      expect(d.rationale, `${d.id} is Open but has a rationale`).toBeNull();
    }
  });

  it('a decided decision names an option that exists', () => {
    for (const d of decisions.filter((x) => x.chosenOptionId !== null)) {
      expect(d.options.some((o) => o.id === d.chosenOptionId), `${d.id}`).toBe(true);
    }
  });

  it('every decision says what would change it', () => {
    for (const d of decisions) {
      expect(d.whatWouldChangeThis.length, `${d.id}`).toBeGreaterThan(0);
    }
  });

  it('every evidence reference resolves', () => {
    for (const d of decisions) {
      for (const ref of d.evidenceIds) {
        expect(evidenceById.has(ref), `${d.id} references missing ${ref}`).toBe(true);
      }
    }
  });
});

describe('roadmap dependency graph', () => {
  it('every dependency resolves to a real task', () => {
    for (const t of tasks) {
      for (const dep of t.dependsOn) {
        expect(tasksById.has(dep), `${t.id} depends on missing ${dep}`).toBe(true);
      }
    }
  });

  it('no task depends on a task in a later phase', () => {
    for (const t of tasks) {
      for (const dep of t.dependsOn) {
        const d = tasksById.get(dep)!;
        expect(d.phase, `${t.id} (phase ${t.phase}) depends on ${dep} (phase ${d.phase})`).toBeLessThanOrEqual(t.phase);
      }
    }
  });

  it('has no dependency cycles', () => {
    const state = new Map<string, 'visiting' | 'done'>();
    const walk = (id: string, trail: string[]): void => {
      const s = state.get(id);
      if (s === 'done') return;
      if (s === 'visiting') throw new Error(`Cycle: ${[...trail, id].join(' -> ')}`);
      state.set(id, 'visiting');
      for (const dep of tasksById.get(id)?.dependsOn ?? []) walk(dep, [...trail, id]);
      state.set(id, 'done');
    };
    expect(() => tasks.forEach((t) => walk(t.id, []))).not.toThrow();
  });

  it('every task belongs to a defined phase', () => {
    const numbers = new Set(phases.map((p) => p.number));
    for (const t of tasks) expect(numbers.has(t.phase), `${t.id} phase ${t.phase}`).toBe(true);
  });

  it('every cost reference resolves', () => {
    const costIds = new Set(costs.map((c) => c.id));
    for (const t of tasks) {
      for (const ref of t.costRefIds) {
        expect(costIds.has(ref), `${t.id} references missing cost ${ref}`).toBe(true);
      }
    }
  });

  it('phases are numbered 0 through 10 without gaps', () => {
    const nums = phases.map((p) => p.number).sort((a, b) => a - b);
    expect(nums).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('cost database integrity', () => {
  it('has unique IDs', () => {
    const ids = costs.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('low <= typical <= high wherever all three exist', () => {
    for (const c of costs) {
      if (c.low !== null && c.typical !== null) expect(c.low, `${c.id}`).toBeLessThanOrEqual(c.typical);
      if (c.typical !== null && c.high !== null) expect(c.typical, `${c.id}`).toBeLessThanOrEqual(c.high);
    }
  });

  it('a cost with no figures is marked Unknown confidence', () => {
    for (const c of costs) {
      if (c.low === null && c.typical === null && c.high === null && c.actualQuote === null) {
        expect(c.confidence, `${c.id} has no figures but claims ${c.confidence}`).toBe('Unknown');
      }
    }
  });

  it('every evidence reference resolves', () => {
    for (const c of costs) {
      for (const ref of c.evidenceIds) {
        expect(evidenceById.has(ref), `${c.id} references missing ${ref}`).toBe(true);
      }
    }
  });
});

describe('automation audit integrity', () => {
  it('classifications are valid', () => {
    const valid = ['AI', 'AUTOMATION', 'HUMAN', 'HUMAN + AI', 'ELIMINATE'];
    for (const p of processes) expect(valid).toContain(p.classification);
  });

  it('anything unacceptable to automate is classified HUMAN', () => {
    // The guard rail that matters: clinical judgement and trust relationships
    // must never drift into an automated classification.
    for (const p of processes.filter((x) => x.riskIfAutomated === 'Unacceptable')) {
      expect(p.classification, `${p.id} is unacceptable to automate but classified ${p.classification}`).toBe('HUMAN');
      expect(p.humanFloor, `${p.id} needs an explicit human floor`).not.toBeNull();
    }
  });

  it('clinical judgement is explicitly protected', () => {
    const clinical = processes.find((p) => p.id === 'P-008');
    expect(clinical?.classification).toBe('HUMAN');
    expect(clinical?.riskIfAutomated).toBe('Unacceptable');
  });

  it('high-risk automation always carries a human floor', () => {
    for (const p of processes.filter((x) => x.riskIfAutomated === 'High')) {
      expect(p.humanFloor, `${p.id} is high risk with no human floor`).not.toBeNull();
    }
  });
});

describe('strategy paths', () => {
  it('no path is labelled best or recommended', () => {
    // The brief is explicit: the system presents tradeoffs, the owner chooses.
    const text = JSON.stringify(paths).toLowerCase();
    expect(text).not.toContain('recommended');
    expect(text).not.toContain('"best"');
  });

  it('every path states both bestWhen and worstWhen', () => {
    for (const p of paths) {
      expect(p.bestWhen.length, `${p.id}`).toBeGreaterThan(20);
      expect(p.worstWhen.length, `${p.id}`).toBeGreaterThan(20);
    }
  });

  it('all ratings are on the 1-5 scale', () => {
    const keys = ['recruitingComplexity', 'adminComplexity', 'clinicalComplexity', 'revenuePotential',
      'overhead', 'operationalRisk', 'ellenDependency', 'ownerWorkload', 'speedToMultidisciplinary'] as const;
    for (const p of paths) {
      for (const k of keys) {
        expect(p[k], `${p.id}.${k}`).toBeGreaterThanOrEqual(1);
        expect(p[k], `${p.id}.${k}`).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe('supporting registers', () => {
  it('competitors, unknowns, questions and levers all have unique IDs', () => {
    for (const list of [competitors, unknownUnknowns, openQuestions, enterpriseLevers]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('open questions that block tasks reference real tasks', () => {
    for (const q of openQuestions) {
      for (const ref of q.blocksTaskIds) {
        expect(tasksById.has(ref), `${q.id} blocks missing ${ref}`).toBe(true);
      }
    }
  });

  it('every unknown-unknown explains why it matters', () => {
    for (const u of unknownUnknowns) {
      expect(u.whyItMatters.length, `${u.id}`).toBeGreaterThan(40);
    }
  });
});
