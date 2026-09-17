import type { CostItem } from '../types';
import { annualModel, type ScenarioInputs } from './economics';

/**
 * Capital requirement. Deliberately split into five buckets, because a single
 * "startup cost" number hides the thing that actually matters: WHEN the cash is
 * needed. A business can be profitable on paper and still fail because the
 * money arrives two months after the payroll run.
 */
export interface CapitalRequirement {
  oneTimeStartup: { low: number; typical: number; high: number; unknownItems: string[] };
  monthlyBurn: { low: number; typical: number; high: number; unknownItems: string[] };
  workingCapital: number | null;
  contingency: number | null;
  /** Months of burn before revenue is expected to arrive. */
  preRevenueMonths: number;
  preRevenueBurn: { low: number; typical: number; high: number };
  totalRequired: { low: number | null; typical: number | null; high: number | null };
  /** Named so nobody mistakes an incomplete total for a complete one. */
  completeness: string;
}

const ONE_TIME: CostItem['frequency'][] = ['One-time'];
const MONTHLY: CostItem['frequency'][] = ['Monthly'];

export function capitalRequirement(
  costs: CostItem[],
  scenario: ScenarioInputs,
  preRevenueMonths: number,
  contingencyRate = 0.2,
): CapitalRequirement {
  const sum = (items: CostItem[], key: 'low' | 'typical' | 'high') =>
    items.reduce((acc, c) => acc + (c.actualQuote ?? c[key] ?? 0), 0);

  const unknownsIn = (items: CostItem[]) =>
    items.filter((c) => c.actualQuote === null && c.typical === null).map((c) => c.item);

  const oneTimeItems = costs.filter((c) => ONE_TIME.includes(c.frequency) && c.required !== 'Optional');
  const monthlyItems = costs.filter((c) => MONTHLY.includes(c.frequency) && c.required !== 'Optional');

  // Annual costs contribute to monthly burn on a straight-line basis.
  const annualItems = costs.filter((c) => c.frequency === 'Annual' && c.required !== 'Optional');
  const annualMonthlyEquivalent = (key: 'low' | 'typical' | 'high') => sum(annualItems, key) / 12;

  const oneTimeStartup = {
    low: sum(oneTimeItems, 'low'),
    typical: sum(oneTimeItems, 'typical'),
    high: sum(oneTimeItems, 'high'),
    unknownItems: unknownsIn(oneTimeItems),
  };

  const monthlyBurn = {
    low: sum(monthlyItems, 'low') + annualMonthlyEquivalent('low'),
    typical: sum(monthlyItems, 'typical') + annualMonthlyEquivalent('typical'),
    high: sum(monthlyItems, 'high') + annualMonthlyEquivalent('high'),
    unknownItems: [...unknownsIn(monthlyItems), ...unknownsIn(annualItems)],
  };

  const model = annualModel(scenario);
  const workingCapital = model.workingCapitalRequired;

  const preRevenueBurn = {
    low: monthlyBurn.low * preRevenueMonths,
    typical: monthlyBurn.typical * preRevenueMonths,
    high: monthlyBurn.high * preRevenueMonths,
  };

  const baseTypical =
    oneTimeStartup.typical + preRevenueBurn.typical + (workingCapital ?? 0);
  const contingency = workingCapital === null ? null : baseTypical * contingencyRate;

  const total = (key: 'low' | 'typical' | 'high') => {
    if (workingCapital === null) return null;
    const base = oneTimeStartup[key] + preRevenueBurn[key] + workingCapital;
    return base * (1 + contingencyRate);
  };

  const unknownCount = oneTimeStartup.unknownItems.length + monthlyBurn.unknownItems.length;

  return {
    oneTimeStartup,
    monthlyBurn,
    workingCapital,
    contingency,
    preRevenueMonths,
    preRevenueBurn,
    totalRequired: { low: total('low'), typical: total('typical'), high: total('high') },
    completeness:
      unknownCount === 0
        ? 'All modelled cost lines have figures.'
        : `INCOMPLETE — ${unknownCount} required cost line(s) have no established figure and are counted as zero. The real requirement is HIGHER than shown.`,
  };
}

/** Capital bands for comparison against the modelled requirement. */
export const CAPITAL_BANDS = [10000, 25000, 50000, 75000, 100000, 150000, 250000];

export function bandAssessment(
  band: number,
  req: CapitalRequirement,
): { band: number; verdict: 'Insufficient' | 'Tight' | 'Adequate' | 'Comfortable'; note: string } {
  const typical = req.totalRequired.typical;
  if (typical === null) {
    return { band, verdict: 'Insufficient', note: 'Cannot assess — working capital is unknown.' };
  }
  const ratio = band / typical;
  if (ratio < 0.75) return { band, verdict: 'Insufficient', note: 'Below the modelled requirement.' };
  if (ratio < 1.0) return { band, verdict: 'Tight', note: 'Close to the requirement with no room for error.' };
  if (ratio < 1.5) return { band, verdict: 'Adequate', note: 'Covers the modelled requirement.' };
  return { band, verdict: 'Comfortable', note: 'Covers the requirement with genuine headroom.' };
}
