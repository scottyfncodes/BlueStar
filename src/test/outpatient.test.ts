import { describe, it, expect } from 'vitest';
import { unitsForMinutes, outpatientVisitRevenue, laneComparison } from '../model/outpatient';
import { assumptionsById } from '../data/assumptions';
import { evidenceById } from '../data/evidence';

describe('8-minute rule (HCPF therapy training, EV-044)', () => {
  it('matches the published unit table', () => {
    expect(unitsForMinutes(7)).toBe(0);
    expect(unitsForMinutes(8)).toBe(1);
    expect(unitsForMinutes(22)).toBe(1);
    expect(unitsForMinutes(23)).toBe(2);
    expect(unitsForMinutes(37)).toBe(2);
    expect(unitsForMinutes(38)).toBe(3);
    expect(unitsForMinutes(52)).toBe(3);
    expect(unitsForMinutes(53)).toBe(4);
    expect(unitsForMinutes(67)).toBe(4);
    expect(unitsForMinutes(68)).toBe(5);
  });

  it('caps at five PT units a day', () => {
    expect(unitsForMinutes(120)).toBe(5);
    expect(unitsForMinutes(120, 99)).toBe(8);
  });

  it("Ellen's visit lengths bill 2 and 4 units", () => {
    expect(unitsForMinutes(30)).toBe(2);
    expect(unitsForMinutes(60)).toBe(4);
  });
});

describe('outpatient revenue per visit', () => {
  it('multiplies units by the per-unit rate', () => {
    const v = outpatientVisitRevenue(60, 34.97);
    expect(v.units).toBe(4);
    expect(v.grossRevenue).toBeCloseTo(139.88, 6);
  });
});

describe('lane comparison', () => {
  const base = {
    homeHealthRatePerVisit: 140.16,
    outpatientRatePerUnit: 30.37,
    eiVisitMinutes: 60,
    nonEiVisitMinutes: 30,
    eiVisitShare: 1 / 3,
    visitsPerWeek: 33,
  };

  it('pays a 60-minute visit most of the home health rate, a 30-minute visit under half', () => {
    const c = laneComparison(base);
    expect(c.ei.outpatient).toBeCloseTo(121.48, 6);
    expect(c.nonEi.outpatient).toBeCloseTo(60.74, 6);
    expect(c.ei.outpatient / c.ei.homeHealth).toBeGreaterThan(0.85);
    expect(c.nonEi.outpatient / c.nonEi.homeHealth).toBeLessThan(0.45);
  });

  it("weights by the visit mix and reports Ellen's weekly gap", () => {
    const c = laneComparison(base);
    const expected = (121.48 * 1) / 3 + (60.74 * 2) / 3;
    expect(c.weighted.outpatient).toBeCloseTo(expected, 6);
    expect(c.weighted.ratio).toBeLessThan(0.6);
    expect(c.weeklyGross!.homeHealth).toBeCloseTo(33 * 140.16, 6);
    expect(c.weeklyGross!.outpatient).toBeCloseTo(33 * expected, 6);
  });

  it('holds no rate of its own — rates trace to the register and a direct read', () => {
    const a = assumptionsById.get('AS-032')!;
    expect(a.value).toBe(30.37);
    expect(a.evidenceIds).toContain('EV-051');
    expect(evidenceById.get('EV-051')!.retrieval).toBe('direct-read');
    expect(assumptionsById.get('AS-033')!.value).toBe(25.15);
  });
});
