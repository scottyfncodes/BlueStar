import type { Competitor, UnknownUnknown, OpenQuestion, EnterpriseLever } from '../types';

export const competitors: Competitor[] = [
  {
    id: 'CO-001', name: 'Spark Home Health', location: 'Denver, CO',
    services: ['PT', 'OT', 'SLP', 'Pediatric home healthcare', 'Medically fragile children'],
    medicaid: 'Yes', commercial: 'Unknown', serviceArea: 'Denver metro',
    positioning: 'Positions as Denver\'s newest and most progressive pediatric home health agency. Medicare/Medicaid certified.',
    observedPattern:
      'A fully certified agency competing on modernity rather than tenure — which suggests the incumbents are seen as dated, and that "newer and better run" is a viable wedge.',
    evidenceIds: ['EV-024'], confidence: 'Reasonable estimate',
  },
  {
    id: 'CO-002', name: 'OASIS Pediatric Therapy', location: 'Colorado Front Range',
    services: ['PT', 'OT', 'ST'], medicaid: 'Yes', commercial: 'No',
    serviceArea: 'Front Range, multiple counties including Denver',
    positioning: 'Serves ONLY families with Medicaid as primary or secondary insurance.',
    observedPattern:
      'The most informative competitor in the set. A deliberately Medicaid-only model operating at multi-county scale is strong indirect evidence that Colorado pediatric Medicaid home therapy economics are viable — nobody scales a losing model across a region.',
    evidenceIds: ['EV-024'], confidence: 'Reasonable estimate',
  },
  {
    id: 'CO-003', name: 'KidsCare', location: '3801 E. Florida Ave Ste 917, Denver, CO 80210',
    services: ['PT', 'OT', 'ST'], medicaid: 'Yes', commercial: 'Yes',
    serviceArea: 'Colorado', positioning: 'Multi-state pediatric home health, accepting Medicaid, commercial and self-pay.',
    observedPattern:
      'A multi-state operator competing on payer breadth. Larger organisations typically create the service gaps a local operator can fill: continuity of therapist, responsiveness, and a family knowing who to call.',
    evidenceIds: ['EV-024'], confidence: 'Reasonable estimate',
  },
  {
    id: 'CO-004', name: 'PASCO Home Healthcare', location: 'Denver, Colorado Springs, Fort Collins',
    services: ['Pediatric personal care'], medicaid: 'Yes', commercial: 'Unknown',
    serviceArea: 'Front Range',
    positioning: 'Pediatric personal care with help coordinating Health First Colorado documentation.',
    observedPattern:
      'Adjacent rather than directly competing — personal care, not skilled therapy. Potentially a referral partner rather than a rival.',
    evidenceIds: ['EV-024'], confidence: 'Unverified',
  },
];

export const unknownUnknowns: UnknownUnknown[] = [
  {
    id: 'UU-001',
    surprise: 'Therapy in the home may not legally require a home health agency licence at all.',
    whyItMatters:
      'The entire plan naturally assumes "care at home = home health agency". Colorado appears to cover outpatient PT/OT delivered in the home under a different benefit with different rules. If true, the cheapest and fastest path to launch is completely different from the obvious one — and months of licensure work might be avoidable.',
    costImpact: 'Potentially very large in both directions. Could remove a licence, a survey and their timeline, or could be a costly misreading.',
    timelineImpact: 'Could compress the pre-revenue period substantially.',
    dependency: 'D-001', owner: 'Attorney + CDPHE',
    evidenceIds: ['EV-008', 'EV-003', 'EV-009'], status: 'Open',
  },
  {
    id: 'UU-002',
    surprise: 'Colorado Medicaid pediatric therapy rates went DOWN this year.',
    whyItMatters:
      'The pediatric PT home health rate appears to have fallen from $145.31 to $143.02 — roughly -1.6%. Business plans routinely assume reimbursement rises with inflation. Here it did the opposite, which means margin has to come from operating efficiency, and any plan that needs a rate increase to work is not a plan.',
    costImpact: 'Reduces revenue per visit and compresses margin on every future visit.',
    timelineImpact: 'None directly, but it lengthens time to break-even.',
    dependency: 'AS-001', owner: 'Scott',
    evidenceIds: ['EV-007', 'EV-006'], status: 'Open',
  },
  {
    id: 'UU-003',
    surprise: 'Prior authorisation enforcement for pediatric LTHH went fully live in June 2026.',
    whyItMatters:
      'PARs are now required for all new AND EXISTING pediatric LTHH members, enforced since June 1, 2026. A new entrant is starting directly into the strictest authorisation regime this benefit has had. Authorisation competence is not a back-office nicety — it is the gate on revenue from day one.',
    costImpact: 'Adds administrative labour per patient and creates denial risk on every visit.',
    timelineImpact: 'Lengthens the cash cycle: PAR approval must precede billable care.',
    dependency: 'T-031', owner: 'Scott',
    evidenceIds: ['EV-004'], status: 'Open',
  },
  {
    id: 'UU-004',
    surprise: 'Flat per-visit reimbursement means visit LENGTH does not affect revenue.',
    whyItMatters:
      'Pediatric home health pays one rate for a visit of up to 2.5 hours. A 45-minute visit and a 2.5-hour visit pay identically. This inverts normal healthcare economics: profitability is driven by visits per day, which makes TRAVEL TIME the dominant cost variable and geographic density the core operating strategy. A tight service radius is worth more than a large one.',
    costImpact: 'Reframes the whole cost model around routing and density rather than billable minutes.',
    timelineImpact: 'None — but it should shape service-area strategy from the first patient.',
    dependency: 'AS-006', owner: 'Scott',
    evidenceIds: ['EV-006', 'EV-007'], status: 'Open',
  },
  {
    id: 'UU-005',
    surprise: 'Workers compensation is mandatory from employee one, explicitly including family members.',
    whyItMatters:
      'Colorado requires workers comp with one or more employees, and the rule names family members. The moment Ellen becomes a W-2 employee, coverage is mandatory — a cost many founders assume they can defer while "it is just us".',
    costImpact: 'Unknown premium, but it starts earlier than expected.',
    timelineImpact: 'Must be bound before the first employee works.',
    dependency: 'D-002', owner: 'Scott',
    evidenceIds: ['EV-017'], status: 'Understood',
  },
  {
    id: 'UU-006',
    surprise: 'The FAMLI employer premium exemption disappears at exactly 10 employees.',
    whyItMatters:
      'Under 10 employees, Blue Star withholds the employee share but pays no employer share. At 10, the 0.44% employer premium applies to all wages. It is a genuine step-change in cost triggered by a headcount threshold, and it belongs in the scaling model rather than being discovered on a payroll run.',
    costImpact: '0.44% of all wages up to the Social Security cap, arriving at once.',
    timelineImpact: 'Triggers at the tenth hire.',
    dependency: 'AS-004', owner: 'Scott',
    evidenceIds: ['EV-018'], status: 'Understood',
  },
];

export const openQuestions: OpenQuestion[] = [
  {
    id: 'Q-001',
    question: 'Can an entity employ licensed therapists to treat children in their homes, billing the outpatient PT/OT benefit, WITHOUT a CDPHE home care agency licence?',
    whyItMatters:
      'Governs licensure, timeline, capital requirement, insurance minimums and the revenue mechanism. Every other number depends on it. It is the single highest-value question in the plan.',
    askWho: 'Colorado healthcare attorney, and CDPHE Health Facilities in writing',
    estimatedCostRange: 'UNKNOWN — attorney rates not researched',
    category: '01-Regulatory', priority: 'Critical', blocksTaskIds: ['T-007', 'T-020'],
  },
  {
    id: 'Q-002',
    question: 'What is the actual CDPHE home care agency licensure timeline from letter of intent to licence issued?',
    whyItMatters:
      'Determines the pre-revenue period, which determines working capital. A three-month timeline and a nine-month timeline imply very different businesses and very different funding needs.',
    askWho: 'CDPHE Health Facilities; other Colorado agency owners',
    estimatedCostRange: 'Free to ask',
    category: '03-Licensing', priority: 'Critical', blocksTaskIds: ['T-020'],
  },
  {
    id: 'Q-003',
    question: 'What do pediatric PTs in Denver actually earn, including benefits and productivity expectations?',
    whyItMatters:
      'The largest cost in the business, and public sources disagree by more than $56,000. Break-even cannot be calculated without it.',
    askWho: 'Ellen; live Colorado job postings, which must disclose pay ranges by law',
    estimatedCostRange: 'Free',
    category: '08-HR', priority: 'Critical', blocksTaskIds: ['T-004'],
  },
  {
    id: 'Q-004',
    question: 'How many visits per day can a pediatric home therapist realistically complete in the Denver metro?',
    whyItMatters:
      'Under flat per-visit reimbursement this is THE profitability driver. The difference between 4 and 6 visits per day is the difference between a struggling business and a healthy one.',
    askWho: 'Ellen',
    estimatedCostRange: 'Free',
    category: '14-Operations', priority: 'Critical', blocksTaskIds: ['T-005'],
  },
  {
    id: 'Q-005',
    question: 'Does Colorado\'s corporate practice doctrine or any professional-entity rule restrict who may own a therapy business?',
    whyItMatters: 'Could constrain ownership structure, which is awkward and expensive to restructure after formation.',
    askWho: 'Colorado healthcare attorney',
    estimatedCostRange: 'UNKNOWN', category: '06-Legal', priority: 'High', blocksTaskIds: ['T-010'],
  },
  {
    id: 'Q-006',
    question: 'Does a licensed home care agency need a physical business location in Colorado?',
    whyItMatters: 'Converts office space from an optional overhead into a mandatory cost, changing the burn model and D-003.',
    askWho: 'CDPHE Health Facilities', estimatedCostRange: 'Free to ask',
    category: '03-Licensing', priority: 'High', blocksTaskIds: ['T-020'],
  },
  {
    id: 'Q-007',
    question: 'What are actual workers compensation and liability insurance premiums for a Colorado pediatric therapy employer?',
    whyItMatters: 'Two required costs currently modelled as unknown or from insurance-marketing estimates.',
    askWho: 'Three commercial insurance brokers', estimatedCostRange: 'Free to quote',
    category: '05-Insurance', priority: 'High', blocksTaskIds: ['T-015', 'T-022'],
  },
  {
    id: 'Q-009',
    question: "What EI / non-EI mix will Blue Star's own referral sources actually produce?",
    whyItMatters:
      "Ellen's current 33% EI visit share was assigned by her employer, not chosen, so it describes one company's allocation rather than the Denver market. Blue Star's mix will come from whichever referral sources it develops, and the mix is the single largest capacity lever in the model: at flat per-visit reimbursement an all-EI caseload cannot reach break-even, while a non-EI-weighted one carries roughly 25% more visits per day.",
    askWho: 'Referral sources directly (roadmap T-006); early intervention coordinators versus pediatricians and specialty clinics',
    estimatedCostRange: 'Free — part of the referral conversations already planned',
    category: '12-Market', priority: 'High', blocksTaskIds: ['T-006'],
  },
  {
    id: 'Q-008',
    question: 'How many children under 21 are enrolled in Health First Colorado in the Denver metro, and what share have therapy-relevant diagnoses?',
    whyItMatters: 'Sizes the addressable market. Total state enrollment is not the same thing and should not be used as a proxy.',
    askWho: 'HCPF county-level enrollment dashboards', estimatedCostRange: 'Free',
    category: '12-Market', priority: 'Medium', blocksTaskIds: [],
  },
];

export const enterpriseLevers: EnterpriseLever[] = [
  {
    id: 'EL-001', lever: 'Owner dependency',
    whyItMatters: 'A business that cannot operate without its owners is worth far less to a buyer and is exhausting to keep in the family.',
    currentState: 'Total. Nothing exists yet, and the plan currently depends on Ellen clinically and Scott operationally.',
    direction: 'Not started', decisionIds: ['D-004'],
  },
  {
    id: 'EL-002', lever: 'Clinical leadership depth',
    whyItMatters: 'Ellen is the clinical anchor. A second clinical leader converts a key-person risk into an institution.',
    currentState: 'Single point of dependency.', direction: 'Not started', decisionIds: ['D-004'],
  },
  {
    id: 'EL-003', lever: 'Recurring, predictable revenue',
    whyItMatters: 'Ongoing pediatric therapy caseloads are genuinely recurring, which is unusually attractive to a buyer.',
    currentState: 'None yet, but the benefit design favours long-term relationships.',
    direction: 'Not started', decisionIds: ['D-001'],
  },
  {
    id: 'EL-004', lever: 'Financial cleanliness',
    whyItMatters: 'Messy books destroy value in diligence and are expensive to reconstruct years later.',
    currentState: 'Clean by default — nothing has happened yet. Set up properly from transaction one.',
    direction: 'Not started', decisionIds: [],
  },
  {
    id: 'EL-005', lever: 'Process maturity and documentation',
    whyItMatters: 'Documented processes are what make a business transferable rather than a job.',
    currentState: 'This system is the first instance of it.', direction: 'Improving', decisionIds: [],
  },
  {
    id: 'EL-006', lever: 'Referral relationship strength',
    whyItMatters: 'Referral relationships are the most durable competitive asset — and the hardest to transfer if they live in one person\'s head.',
    currentState: 'None yet. Build them institutionally, not personally, from the start.',
    direction: 'Not started', decisionIds: [],
  },
  {
    id: 'EL-007', lever: 'Clinician retention',
    whyItMatters: 'Turnover is the dominant hidden cost in therapy businesses and the main driver of poor family experience.',
    currentState: 'No team yet. Culture decisions made now are cheap; made later they are expensive.',
    direction: 'Not started', decisionIds: ['D-002'],
  },
  {
    id: 'EL-008', lever: 'Payer concentration',
    whyItMatters: 'A Medicaid-only business carries real policy risk — as this year\'s rate cut demonstrates.',
    currentState: 'Plan is Medicaid-centric. Commercial payer diversification is unexplored.',
    direction: 'At risk', decisionIds: ['D-001'],
  },
];
