import type { StrategyPath } from '../types';

/**
 * Strategy paths. Deliberately unranked — no "recommended" flag, no scoring
 * that resolves to a winner. Each path is described so Scott can see what it
 * demands and what it produces, and choose.
 */
export const paths: StrategyPath[] = [
  {
    id: 'PATH-A',
    name: 'PT only',
    summary: 'Launch with physical therapy alone, anchored on Ellen. Smallest possible surface area.',
    disciplines: ['PT'],
    staffingModel: 'Ellen plus, eventually, one or two PTs',
    initialCapitalBand: 'Lowest of the five paths',
    recruitingComplexity: 1, adminComplexity: 1, clinicalComplexity: 1,
    revenuePotential: 2, timeToScale: 'Slow — one discipline limits referral capture',
    overhead: 1, operationalRisk: 2, ellenDependency: 5, ownerWorkload: 2,
    speedToMultidisciplinary: 1,
    enterpriseValueNote:
      'Single-discipline and heavily key-person dependent, which a buyer discounts. Concentration risk is the main valuation drag.',
    bestWhen: 'Capital is tight, the model is unproven, and learning the industry safely matters more than speed.',
    worstWhen: 'Referral sources want one multi-discipline partner, or Ellen becomes unavailable.',
  },
  {
    id: 'PATH-B',
    name: 'PT → OT → ST sequential',
    summary: 'Start with PT, add OT once stable, then ST. Each discipline proves itself before the next.',
    disciplines: ['PT', 'OT', 'ST'],
    staffingModel: 'Sequential hiring, one discipline at a time',
    initialCapitalBand: 'Low initially, rising with each expansion',
    recruitingComplexity: 3, adminComplexity: 3, clinicalComplexity: 3,
    revenuePotential: 4, timeToScale: 'Moderate — deliberately staged',
    overhead: 3, operationalRisk: 2, ellenDependency: 3, ownerWorkload: 3,
    speedToMultidisciplinary: 3,
    enterpriseValueNote:
      'Builds a genuine multi-discipline asset while keeping risk staged. Generally the most conventional path to a saleable business.',
    bestWhen: 'The PT model proves out and cash allows measured expansion.',
    worstWhen: 'Competitors capture multi-discipline referral relationships during the staging period.',
  },
  {
    id: 'PATH-C',
    name: 'PT + OT + ST from launch',
    summary: 'Full multi-discipline offering from day one.',
    disciplines: ['PT', 'OT', 'ST'],
    staffingModel: 'Hire across three disciplines simultaneously',
    initialCapitalBand: 'Highest of the five paths',
    recruitingComplexity: 5, adminComplexity: 4, clinicalComplexity: 4,
    revenuePotential: 5, timeToScale: 'Fast if it works',
    overhead: 4, operationalRisk: 5, ellenDependency: 2, ownerWorkload: 5,
    speedToMultidisciplinary: 5,
    enterpriseValueNote:
      'Strongest asset if it succeeds. Also the path most likely to exhaust capital before revenue stabilises.',
    bestWhen: 'Capital is ample and referral demand for all three is already demonstrated.',
    worstWhen: 'Demand is unproven — fixed cost in three disciplines arrives long before revenue does.',
  },
  {
    id: 'PATH-D',
    name: 'PT core + contracted PRN OT/ST',
    summary: 'Employed PT core, with OT and ST delivered by contracted PRN clinicians.',
    disciplines: ['PT', 'OT', 'ST'],
    staffingModel: 'W-2 PT core, 1099 or PRN for other disciplines',
    initialCapitalBand: 'Low to moderate',
    recruitingComplexity: 3, adminComplexity: 3, clinicalComplexity: 3,
    revenuePotential: 4, timeToScale: 'Moderate — limited by PRN availability',
    overhead: 2, operationalRisk: 3, ellenDependency: 3, ownerWorkload: 3,
    speedToMultidisciplinary: 4,
    enterpriseValueNote:
      'Multi-discipline capability at low fixed cost, but a contractor-heavy delivery model is typically valued below an employed one.',
    bestWhen: 'Referral sources want breadth before volume justifies full-time hires in each discipline.',
    worstWhen: 'PRN clinicians prove unreliable, or the contractor structure invites misclassification scrutiny (see D-002).',
  },
  {
    id: 'PATH-E',
    name: 'Outpatient-lane launch, agency licensure later',
    summary:
      'Launch as an outpatient therapy provider delivering in homes, then add home care agency licensure once revenue supports it. Structurally different from A–D: this varies the REGULATORY lane, not the discipline mix, and can be combined with any of them.',
    disciplines: ['PT'],
    staffingModel: 'Whatever discipline mix is chosen, in the outpatient regulatory lane first',
    initialCapitalBand: 'Potentially the lowest — avoids the licensure waiting period',
    recruitingComplexity: 2, adminComplexity: 3, clinicalComplexity: 2,
    revenuePotential: 3, timeToScale: 'Potentially fastest to first revenue',
    overhead: 1, operationalRisk: 4, ellenDependency: 4, ownerWorkload: 3,
    speedToMultidisciplinary: 2,
    enterpriseValueNote:
      'Preserves capital and generates operating history early. Carries regulatory uncertainty until D-001 is answered by counsel.',
    bestWhen: 'Counsel confirms the outpatient lane is lawful for this model, and speed to revenue matters.',
    worstWhen:
      'The lane turns out to require licensure after all. THIS PATH IS CONDITIONAL — it does not exist until D-001 is answered.',
  },
];
