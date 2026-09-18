// ---------------------------------------------------------------------------
// Blue Star Navigator — core domain types.
//
// The central design rule: a fact, an estimate, and a quote are different
// things, and the system must never let them blur together. Every number that
// reaches the financial model carries its own provenance.
// ---------------------------------------------------------------------------

/** How sure are we? Confidence is a summary of evidence, never a substitute. */
export type Confidence =
  | 'Confirmed'
  | 'Strong evidence'
  | 'Reasonable estimate'
  | 'Unverified'
  | 'Unknown';

/**
 * Where a piece of information came from. These are deliberately not
 * interchangeable — see PART 37 of the build brief.
 */
export type FactKind =
  | 'LIVE_RESEARCH' // found via current web research this session
  | 'SAVED_EVIDENCE' // deliberately recorded in the knowledge base
  | 'USER_PROVIDED' // supplied by Scott or Ellen
  | 'ACTUAL_QUOTE' // a real vendor / lender / carrier / firm quote
  | 'ASSUMPTION'; // used for modelling, not yet verified

/**
 * How the source was actually reached. This distinction matters: reading a
 * fee-schedule PDF is not the same as reading a search engine's summary of it.
 */
export type Retrieval =
  | 'direct-read' // the source document itself was opened and read
  | 'search-summary' // a search index summarised the source; text not read directly
  | 'not-accessed' // we know the document exists but have not reached it
  | 'user-reported'; // observed and reported first-hand by Scott or Ellen

export type CategoryId =
  | '01-Regulatory'
  | '02-Payers'
  | '03-Licensing'
  | '04-Financial'
  | '05-Insurance'
  | '06-Legal'
  | '07-Clinical'
  | '08-HR'
  | '09-Technology'
  | '10-AI-Automation'
  | '11-Competitors'
  | '12-Market'
  | '13-Funding'
  | '14-Operations'
  | '15-Culture'
  | '16-Unknown-Unknowns';

export interface Evidence {
  id: string;
  category: CategoryId;
  topic: string;
  /** The claim, stated as narrowly as the source supports. */
  claim: string;
  source: string;
  url: string;
  document: string;
  publicationDate: string | null;
  effectiveDate: string | null;
  accessedDate: string;
  section: string | null;
  /** Which parts of the business this bears on. */
  appliesTo: string[];
  /** What it means for Blue Star specifically — our reading, not the source's words. */
  interpretation: string;
  confidence: Confidence;
  retrieval: Retrieval;
  requiresProfessionalVerification: boolean;
  recheckDate: string;
  notes: string;
}

export interface Assumption {
  id: string;
  name: string;
  /** Null means we genuinely do not have a number yet. Do not invent one. */
  value: number | null;
  unit: string;
  kind: FactKind;
  source: string;
  evidenceIds: string[];
  whyThisValue: string;
  confidence: Confidence;
  financialImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  operationalImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  whatWouldInvalidate: string;
  lastVerified: string;
  revisitDate: string;
}

export type Reversibility = 'Easy' | 'Moderate' | 'Difficult';

export interface DecisionOption {
  id: string;
  name: string;
  whatItIs: string;
  requires: string[];
  creates: string[];
  risks: string[];
  tradeoffs: string[];
  reversibility: Reversibility;
}

export interface Decision {
  id: string;
  title: string;
  status: 'Open' | 'Decided' | 'Deferred' | 'Superseded';
  /** Why this decision exists at all. */
  question: string;
  stakes: string;
  options: DecisionOption[];
  evidenceIds: string[];
  /** Populated only once Scott actually decides. */
  chosenOptionId: string | null;
  decidedOn: string | null;
  rationale: string | null;
  whatWouldChangeThis: string[];
  revisitTrigger: string;
  /** Roadmap phase in which this decision realistically must be made. */
  dueByPhase: number;
}

export interface RoadmapTask {
  id: string;
  phase: number;
  title: string;
  detail: string;
  /** IDs of tasks that must be complete first. Validated by tests. */
  dependsOn: string[];
  owner: 'Scott' | 'Ellen' | 'Attorney' | 'CPA' | 'Vendor' | 'State' | 'Payer' | 'Unassigned';
  status: 'Not started' | 'In progress' | 'Blocked' | 'Done';
  estimatedDurationDays: number | null;
  costRefIds: string[];
  evidenceIds: string[];
  /** Set where the task genuinely cannot start without outside input. */
  blockedBy: string | null;
}

export interface Phase {
  number: number;
  name: string;
  objective: string;
  exitCriteria: string[];
}

export type CostFrequency =
  | 'One-time'
  | 'Monthly'
  | 'Quarterly'
  | 'Annual'
  | 'Per employee'
  | 'Per clinician'
  | 'Per patient'
  | 'Per visit'
  | 'Per claim'
  | 'Percent of revenue'
  | 'Variable';

export interface CostItem {
  id: string;
  category: CategoryId;
  item: string;
  /** All three may be null when nothing defensible is known. */
  low: number | null;
  typical: number | null;
  high: number | null;
  actualQuote: number | null;
  kind: FactKind;
  source: string;
  evidenceIds: string[];
  required: 'Required' | 'Recommended' | 'Optional';
  frequency: CostFrequency;
  driver: string;
  effectiveDate: string | null;
  lastVerified: string;
  confidence: Confidence;
  alternatives: { approach: string; note: string }[];
  /** Overhead Kill List scoring — see PART 25. */
  kill: KillListScore | null;
}

export interface KillListScore {
  required: boolean;
  producesRevenue: boolean;
  reducesRisk: boolean;
  improvesPatientExperience: boolean;
  improvesClinicianRetention: boolean;
  softwareCanReplace: boolean;
  aiCanAssist: boolean;
  canConsolidate: boolean;
  canOutsource: boolean;
  canEliminate: boolean;
  verdict: 'Keep' | 'Keep — consolidate' | 'Defer' | 'Eliminate' | 'Revisit at scale';
  note: string;
}

export type AutomationClass = 'AI' | 'AUTOMATION' | 'HUMAN' | 'HUMAN + AI' | 'ELIMINATE';

export interface ProcessAudit {
  id: string;
  process: string;
  area: string;
  classification: AutomationClass;
  rationale: string;
  /** Explicit guard rails — some things must stay human. */
  humanFloor: string | null;
  estimatedHoursPerWeekSaved: number | null;
  riskIfAutomated: 'None' | 'Low' | 'Moderate' | 'High' | 'Unacceptable';
  enablingTool: string | null;
  phase: number;
}

export interface StrategyPath {
  id: string;
  name: string;
  summary: string;
  disciplines: ('PT' | 'OT' | 'ST')[];
  staffingModel: string;
  initialCapitalBand: string;
  recruitingComplexity: 1 | 2 | 3 | 4 | 5;
  adminComplexity: 1 | 2 | 3 | 4 | 5;
  clinicalComplexity: 1 | 2 | 3 | 4 | 5;
  revenuePotential: 1 | 2 | 3 | 4 | 5;
  timeToScale: string;
  overhead: 1 | 2 | 3 | 4 | 5;
  operationalRisk: 1 | 2 | 3 | 4 | 5;
  ellenDependency: 1 | 2 | 3 | 4 | 5;
  ownerWorkload: 1 | 2 | 3 | 4 | 5;
  speedToMultidisciplinary: 1 | 2 | 3 | 4 | 5;
  enterpriseValueNote: string;
  bestWhen: string;
  worstWhen: string;
}

export interface Competitor {
  id: string;
  name: string;
  location: string;
  services: string[];
  medicaid: 'Yes' | 'No' | 'Unknown';
  commercial: 'Yes' | 'No' | 'Unknown';
  serviceArea: string;
  positioning: string;
  observedPattern: string;
  evidenceIds: string[];
  confidence: Confidence;
}

export interface UnknownUnknown {
  id: string;
  surprise: string;
  whyItMatters: string;
  costImpact: string;
  timelineImpact: string;
  dependency: string;
  owner: string;
  evidenceIds: string[];
  status: 'Open' | 'Understood' | 'Resolved';
}

export interface OpenQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  askWho: string;
  estimatedCostRange: string;
  category: CategoryId;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  blocksTaskIds: string[];
}

/** Long-horizon enterprise-value scoring — PART 35. */
export interface EnterpriseLever {
  id: string;
  lever: string;
  whyItMatters: string;
  currentState: string;
  direction: 'Improving' | 'Flat' | 'At risk' | 'Not started';
  decisionIds: string[];
}
