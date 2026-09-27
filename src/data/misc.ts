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
    surprise: 'Colorado Medicaid pediatric therapy rates went DOWN twice in nine months.',
    whyItMatters:
      'The pediatric PT home health rate fell from $145.31 to $143.02 in October 2025 (-1.6%) and again to $140.16 on July 1, 2026 (-2.0%, HB 26-1410, EV-046) — read directly off the FY2026-27 schedule (EV-007). The first step: Business plans routinely assume reimbursement rises with inflation. Here it did the opposite, and now we know why: in September 2025 the Governor declared a revenue shortfall and HCPF took back the 1.6% increase the legislature had granted for FY2025-26, effective October 1, 2025 (EV-037). Margin has to come from operating efficiency, any plan that needs a rate increase to work is not a plan, and Colorado can cut mid-year on about a month\'s notice.',
    costImpact: 'Reduces revenue per visit and compresses margin on every future visit.',
    timelineImpact: 'None directly, but it lengthens time to break-even.',
    dependency: 'AS-001', owner: 'Scott',
    evidenceIds: ['EV-007', 'EV-006', 'EV-037', 'EV-046'], status: 'Understood',
  },
  {
    id: 'UU-003',
    surprise: 'Prior authorisation for pediatric LTHH therapy restarted in July 2025 as a "fresh start" — every child re-reviewed.',
    whyItMatters:
      'OM 25-037, read directly (EV-004): therapy PARs restarted July 1, 2025 after a five-year pause, every member underwent a full medical necessity review by April 2026, and HCPF enforces with weekly tracking and payment withholding. A new entrant starts directly into the strictest authorisation regime this benefit has had. Authorisation competence is not a back-office nicety — it is the gate on revenue from day one. (The "May 4 / June 1, 2026" dates the first build cited are not in this memo and remain unverified.)',
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
  {
    id: 'UU-007',
    surprise: 'No new home health agency can enroll in Medicare anywhere in the country right now.',
    whyItMatters:
      'CMS froze Medicare enrollment of new home health agencies nationwide on May 13, 2026, for six months and extendable (EV-033). Colorado Medicaid will not enroll a home health agency that is not Medicare enrolled (EV-031). Put together: the agency lane — the one the whole $143-per-visit model is built on — is closed to Blue Star until at least mid-November 2026, and the date could slip. This is the single largest change to the plan since it was written.',
    costImpact: 'Removes the agency lane from the near-term option set; every revenue figure that assumes $143.02 per visit is, for now, describing a business Blue Star cannot be.',
    timelineImpact: 'At least six months, possibly more, before the agency lane can even be applied for.',
    dependency: 'D-001', owner: 'Scott',
    evidenceIds: ['EV-033', 'EV-031'], status: 'Open',
  },
  {
    id: 'UU-008',
    surprise: 'A home health agency must provide skilled NURSING — therapy alone does not qualify.',
    whyItMatters:
      'Medicare certification is a precondition for Colorado Medicaid home health enrollment (EV-031), and Medicare will only certify an agency that provides skilled nursing plus at least one other service (EV-032). So "a pediatric therapy agency billing the home health benefit" is not a thing that can exist on its own. Blue Star would have to hire and supervise nurses to earn the per-visit rate for therapy. That is a different company, and D-004 (which disciplines?) now has a nursing option it never contemplated.',
    costImpact: 'Adds an entire nursing service line to the cost of the agency lane; also adds accreditation fees, a three-month cash reserve and pre-survey unpaid patient care (EV-035).',
    timelineImpact: 'Agency lane timeline now includes accreditation (roughly 3-9 months by accreditor estimates) on top of state licensure.',
    dependency: 'D-001', owner: 'Attorney + accreditor',
    evidenceIds: ['EV-032', 'EV-031', 'EV-035'], status: 'Open',
  },
  {
    id: 'UU-009',
    surprise: 'In the outpatient lane a visit is paid by the 15-minute unit — and nobody has looked up the rate.',
    whyItMatters:
      'Every dollar figure in this system assumes $143.02 per visit. In the outpatient lane that number does not exist: a 30-minute visit bills 2 units and a 60-minute visit 4 (unit counts now confirmed from the HCPF training deck, EV-044), at a per-unit rate published in a fee schedule this pass could not open (EV-043). Medicaid therapy unit rates elsewhere run roughly $20-$40, which would put a 30-minute visit at a fraction of the home health rate — but that is an out-of-state bracket, not a Colorado figure, and it must not be used. The point is that the single most decision-relevant number in the plan is currently blank (AS-032).',
    costImpact: 'Unknown, and potentially the difference between viable and not viable in the only lane currently open.',
    timelineImpact: 'None — the number can be looked up in an afternoon (roadmap T-008).',
    dependency: 'AS-032', owner: 'Scott',
    evidenceIds: ['EV-043', 'EV-044', 'EV-009'], status: 'Open',
  },
  {
    id: 'UU-010',
    surprise: 'A therapist working entirely alone is expressly exempt from home care agency licensing.',
    whyItMatters:
      'Rule 2.10(B)(3), read directly, excludes from "home care agency" an individual who is not employed by or affiliated with a home care agency and who acts alone, without employees or contractors (EV-034); the licence requirement and its $10,000-per-violation penalty are in statute section 103, read in full (EV-045). That is exactly the first phase of the Founder Ramp — Ellen, alone, at $0 owner compensation. It means a lawful first paid visit may not require any facility licence at all. The catch is the word "individual": whether the exemption covers Ellen practising through Blue Star LLC, and it certainly ends the moment a second clinician is engaged, are questions for counsel. It is an on-ramp, not a destination.',
    costImpact: 'Could remove licensure cost and timeline from the launch phase entirely.',
    timelineImpact: 'Could compress time to first revenue to the length of Medicaid provider enrollment.',
    dependency: 'D-001', owner: 'Attorney',
    evidenceIds: ['EV-034', 'EV-045', 'EV-003'], status: 'Open',
  },
  {
    id: 'UU-011',
    surprise: 'Early Intervention services are excluded from home care agency licensing altogether.',
    whyItMatters:
      'Rule 2.10(B)(9), read directly, says services provided by a qualified Early Intervention service provider are not home care agency activity (EV-047). Eleven of Ellen\'s twenty-five children are EI. That means a third lane exists: serve birth-to-three children under IFSPs with a whole team and no Class A licence, no Medicare, no moratorium. What it takes to become a qualified EI provider, and what EI pays, are the two things nobody has looked up (Q-014).',
    costImpact: 'Could remove licensure entirely for the EI slice of the market; revenue per visit unknown and possibly the lowest of the three lanes.',
    timelineImpact: 'Unknown — depends on the EI qualification process.',
    dependency: 'D-001', owner: 'Scott',
    evidenceIds: ['EV-047', 'EV-041', 'EV-044'], status: 'Open',
  },
  {
    id: 'UU-012',
    surprise: 'The state licence does not require nursing. Medicare does. The plan had merged the two.',
    whyItMatters:
      'The home care agency rule, read directly, contemplates therapy-only Class A agencies: other healthcare services may be supervised by a licensed healthcare professional, and the initial assessment may be done by that professional when it is the only service ordered (EV-048). So a licensed Class A therapy agency is lawful in Colorado. What it cannot do is bill the Medicaid home health benefit, because HCPF requires Medicare certification for that (EV-031) and Medicare requires nursing (EV-032). A Class A licence without Medicaid home health enrollment would let Blue Star operate with employees in the home lawfully, billing outpatient rates — which may or may not be worth the licence.',
    costImpact: 'Adds a middle path: licence cost and administrator overhead without Medicare, at outpatient revenue.',
    timelineImpact: 'State licensure timeline only, without the accreditation and Medicare enrollment steps.',
    dependency: 'D-001', owner: 'Attorney + CDPHE',
    evidenceIds: ['EV-048', 'EV-031', 'EV-032'], status: 'Open',
  },
];

export const openQuestions: OpenQuestion[] = [
  {
    id: 'Q-001',
    question: 'Can an entity employ licensed therapists to treat children in their homes, billing the outpatient PT/OT benefit, WITHOUT a CDPHE home care agency licence?',
    whyItMatters:
      'Governs licensure, timeline, capital requirement, insurance minimums and the revenue mechanism. Every other number depends on it. It is the single highest-value question in the plan.',
    askWho: 'Colorado healthcare attorney, and CDPHE Health Facilities in writing. Frame it around C.R.S. 25-27.5-103 and its exemption for an individual acting alone (EV-034): does the exemption survive an LLC, and what exactly ends it?',
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
    question: 'Does a home office satisfy rule 5.1\'s requirement that a licensed home care agency have "a physical business office capable of conducting day-to-day business" in Colorado?',
    whyItMatters: 'The requirement itself is now confirmed (EV-048, read directly); what remains is whether a residence counts. If not, office space becomes a mandatory cost in the agency lane, changing the burn model and D-003.',
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
  {
    id: 'Q-010',
    question: 'What does Health First Colorado pay per 15-minute unit for the CPT codes a pediatric home visit would bill, and what does that make a 30-minute and a 60-minute visit worth?',
    whyItMatters:
      'This is the revenue figure for the only lane currently open (the agency lane is frozen, EV-033). The system holds no value for it (AS-032). Until it is filled, no profitability conclusion in this app applies to a realistic Blue Star launch.',
    askWho: 'Nobody — read it off the Health First Colorado Physician Fee Schedule (EV-043) or the HCPF code lookup. Codes: 97110, 97530, 97140, 97161-97163, 97165-97167, 92507, 92523.',
    estimatedCostRange: 'Free — one afternoon',
    category: '02-Payers', priority: 'Critical', blocksTaskIds: ['T-008', 'T-007'],
  },
  {
    id: 'Q-011',
    question: 'How is Ellen paid today — salary, hourly, or per visit — and how does her employer bill the Early Intervention children on her caseload?',
    whyItMatters:
      'Two model-shaping facts Ellen already knows. If she is paid per visit (Denver postings advertise $65-$95 per visit, EV-039) then clinician cost is variable, not fixed, and the break-even arithmetic changes shape. If her employer bills EI children as home health visits, that confirms the $143 rate belongs to the agency lane only (EV-041).',
    askWho: 'Ellen',
    estimatedCostRange: 'Free',
    category: '08-HR', priority: 'Critical', blocksTaskIds: ['T-009', 'T-004'],
  },
  {
    id: 'Q-012',
    question: 'Has HCPF mirrored the federal home health enrollment moratorium in Colorado Medicaid, and when does the federal one lift?',
    whyItMatters:
      'The federal freeze runs six months from May 13, 2026 and can be extended (EV-033). CMS invited states to impose their own. Either answer sets the earliest date the agency lane could be re-opened as an option.',
    askWho: 'HCPF Provider Services; CMS moratorium page; recheck after 2026-11-13',
    estimatedCostRange: 'Free',
    category: '01-Regulatory', priority: 'High', blocksTaskIds: ['T-020'],
  },
  {
    id: 'Q-013',
    question: 'A PT may supervise up to four assistants (EV-044). Is a PT-plus-PTA model the scaling path, and what do Denver pediatric PTAs earn?',
    whyItMatters:
      'Every staffing path in this system assumes each additional clinician is a physical therapist. If a physical therapist assistant can deliver routine follow-up visits under Ellen\'s supervision at a lower loaded cost, cost per visit falls and Ellen\'s time concentrates on evaluations and plans of care — which are also the visits the outpatient lane pays best. PTA pay was not researched. Note the training deck: assistants cannot enroll and bill under the supervising PT\'s NPI, and documentation must name who did what.',
    askWho: 'Ellen (clinical view); live Colorado PTA postings for pay',
    estimatedCostRange: 'Free',
    category: '08-HR', priority: 'Medium', blocksTaskIds: [],
  },
  {
    id: 'Q-014',
    question: 'How does a provider become a "qualified early intervention service provider" in Colorado, and what does Early Intervention pay per visit?',
    whyItMatters:
      'Such providers are excluded from home care agency licensing by rule (EV-047). If qualification is straightforward, Blue Star could serve EI children with a team, lawfully, without a licence or Medicare — a lane the plan never had. The revenue side matters equally: EV-041 suggests EI rates have historically sat well below home health rates, and Medicaid is billed first for Medicaid-enrolled children.',
    askWho: 'Early Intervention Colorado (Department of Early Childhood) and the Denver-area EI program; Ellen, who already treats EI children and knows who assigns them',
    estimatedCostRange: 'Free',
    category: '01-Regulatory', priority: 'Critical', blocksTaskIds: ['T-007', 'T-006'],
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
    currentState: 'Plan is Medicaid-centric. Commercial payer diversification is unexplored. The October 2025 mid-year cut (EV-037) and the 2026 enrollment freeze (EV-033) are both examples of the policy risk this lever tracks.',
    direction: 'At risk', decisionIds: ['D-001'],
  },
];
