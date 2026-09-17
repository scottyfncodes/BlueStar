import type { Decision } from '../types';

/**
 * The decision log. History is append-only: a decision that is superseded is
 * marked 'Superseded' and left in place rather than edited away. The point is
 * institutional memory — being able to answer "why did we do it that way?"
 * three years later, when the reasoning has left everyone's head.
 *
 * Nothing here is decided FOR Scott. Options are laid out with what they
 * require, create, risk and cost; chosenOptionId stays null until he chooses.
 */
export const decisions: Decision[] = [
  {
    id: 'D-001',
    title: 'Which regulatory lane does Blue Star operate in?',
    status: 'Open',
    question:
      'Does Blue Star deliver pediatric therapy in the home as (a) a CDPHE-licensed Class A home care agency billing the per-visit home health benefit, or (b) an outpatient PT/OT provider billing CPT codes with the home as place of service — or (c) both?',
    stakes:
      'This is the highest-stakes decision in the entire plan. It determines whether a state facility license is required at all, what the startup timeline looks like, how revenue is earned (flat per-visit vs timed units), what the authorization workflow is, and what the minimum insurance limits are. Almost every number elsewhere in this system depends on it. Getting it wrong in either direction is expensive: unnecessary licensure burns months and capital, while operating unlicensed where a license is required is an existential compliance failure.',
    options: [
      {
        id: 'D-001-A',
        name: 'Licensed home care agency (Class A)',
        whatItIs:
          'Obtain a CDPHE Class A home care agency license, enroll as a home health provider with Health First Colorado, and bill the pediatric long-term home health benefit per visit.',
        requires: [
          'CDPHE Class A license — letter of intent, application, fees, policies, survey',
          'Administrator meeting state qualifications',
          'Full policy and procedure manual, personnel files, clinical records system',
          '$500,000 / $3,000,000 liability insurance minimum (EV-002)',
          'Substantially longer pre-revenue period',
        ],
        creates: [
          'Access to the pediatric LTHH benefit at roughly $143/visit (EV-007)',
          'A licensed, surveyable, transferable asset — licenses carry real enterprise value at exit',
          'Credibility with hospital and complex-care referral sources',
          'A structure that scales to nursing and multi-discipline services later',
        ],
        risks: [
          'Long licensure timeline before any revenue — the dominant capital risk',
          'Survey and compliance exposure from day one',
          'Flat per-visit rate means a 45-minute visit and a 2.5-hour visit pay the same',
          'Rates can fall — they already did this year (EV-007)',
        ],
        tradeoffs: [
          'Harder and slower to start; stronger and more defensible once running',
          'Higher fixed compliance overhead; higher barrier to entry against competitors',
        ],
        reversibility: 'Difficult',
      },
      {
        id: 'D-001-B',
        name: 'Outpatient therapy provider, home as place of service',
        whatItIs:
          'Enroll as an outpatient PT/OT provider with Health First Colorado and deliver therapy in the child\'s home, billing timed CPT codes rather than the home health per-visit rate.',
        requires: [
          'Medicaid provider enrollment (EV-013)',
          'Licensed therapists — no facility license apparent, BUT THIS IS UNCONFIRMED',
          'Authorization once a member passes 48 units in a rolling 12 months (EV-009)',
          'Legal confirmation that this does not constitute operating a home care agency (EV-003)',
        ],
        creates: [
          'A dramatically shorter path to first revenue',
          'Much lower startup capital requirement',
          'Timed billing, so longer or more intensive visits earn more',
          'Freedom to test the market before committing to licensure',
        ],
        risks: [
          'REGULATORY RISK IS THE WHOLE STORY. If Colorado deems this "managing and offering skilled home health services", operating without a license is a serious violation.',
          'Five-unit daily cap limits revenue per visit (EV-009)',
          'May carry less weight with institutional referral sources',
          'Could require restructuring later, at a worse time',
        ],
        tradeoffs: [
          'Fast and cheap to start; legally less certain until confirmed',
          'Lower fixed overhead; potentially lower ceiling',
        ],
        reversibility: 'Moderate',
      },
      {
        id: 'D-001-C',
        name: 'Start outpatient, license deliberately later',
        whatItIs:
          'Launch in the outpatient lane to generate revenue and validate demand, while running the Class A licensure process in parallel as a planned phase-two step.',
        requires: [
          'Everything in Option B now',
          'Everything in Option A later, funded from operations rather than savings',
          'Legal confirmation that the outpatient lane is lawful in the interim — this is the precondition for the whole option',
        ],
        creates: [
          'Revenue during the licensure waiting period, which is exactly when cash pressure peaks',
          'Real operating data before committing to the heavier structure',
          'Optionality — the licence can be abandoned if the outpatient lane proves better',
        ],
        risks: [
          'Two compliance regimes to understand instead of one',
          'Transition complexity for patients mid-course of care',
          'Depends entirely on Option B being lawful; if it is not, this option does not exist',
        ],
        tradeoffs: [
          'Best expected cash profile; highest demand on owner attention',
          'Preserves the most optionality; requires the most discipline to actually execute phase two',
        ],
        reversibility: 'Moderate',
      },
    ],
    evidenceIds: ['EV-001', 'EV-003', 'EV-006', 'EV-007', 'EV-008', 'EV-009', 'EV-014'],
    chosenOptionId: null,
    decidedOn: null,
    rationale: null,
    whatWouldChangeThis: [
      'A definitive answer from a Colorado healthcare attorney on whether the outpatient lane requires a home care agency license',
      'A written answer from CDPHE Health Facilities to the same question',
      'The true licensure timeline — if Class A takes 3 months, Option A gets far more attractive; at 9 months, far less',
      'Confirmation of the actual FY2026-27 per-visit rate vs. what outpatient CPT billing yields for a comparable visit',
    ],
    revisitTrigger:
      'Immediately upon receiving legal counsel on the licensure question. Do not commit capital in either direction before then.',
    dueByPhase: 0,
  },
  {
    id: 'D-002',
    title: 'Employment structure for clinicians — W-2 or 1099?',
    status: 'Open',
    question:
      'Are Blue Star therapists employees or independent contractors, and does Ellen hold a different structure from later hires?',
    stakes:
      'Drives payroll tax, workers compensation exposure, benefits cost, control over scheduling and quality, misclassification liability, and how attractive the company is to clinicians. It also shapes enterprise value: a contractor-only workforce is generally seen as a weaker, less transferable asset.',
    options: [
      {
        id: 'D-002-A',
        name: 'W-2 employees',
        whatItIs: 'Therapists are employees with payroll, tax withholding, workers compensation and benefits.',
        requires: [
          'Workers compensation from employee one, including family members (EV-017)',
          'Payroll infrastructure, FAMLI withholding, SUTA registration (EV-018, EV-019)',
          'A benefits decision and its cost',
        ],
        creates: [
          'Full control over scheduling, quality standards and documentation practice',
          'A genuine employment relationship, which is the foundation of culture and retention',
          'Clean misclassification posture',
          'A more valuable, more transferable business',
        ],
        risks: ['Higher fixed cost per clinician', 'Cost continues when caseload dips'],
        tradeoffs: ['More expensive and less flexible; far more defensible and more valuable'],
        reversibility: 'Moderate',
      },
      {
        id: 'D-002-B',
        name: '1099 contractors',
        whatItIs: 'Therapists engage as independent contractors, typically paid per visit.',
        requires: [
          'Genuine contractor independence — the test is the actual working relationship, not the contract wording',
          'Contractor agreements reviewed by an employment attorney',
        ],
        creates: ['Variable cost that flexes with caseload', 'Lower fixed burn', 'Faster, lighter scaling'],
        risks: [
          'MISCLASSIFICATION IS THE CENTRAL RISK. Clinical oversight, mandatory scheduling and required documentation standards all point toward employment.',
          'Reduced control over quality and availability — in a business whose product IS the clinician',
          'Weaker retention and weaker culture',
          'Back taxes, penalties and interest if reclassified',
        ],
        tradeoffs: ['Cheaper and more flexible; carries real legal tail risk and a weaker asset'],
        reversibility: 'Moderate',
      },
      {
        id: 'D-002-C',
        name: 'W-2 core, PRN/contract surge capacity',
        whatItIs: 'A small W-2 core team with contracted PRN clinicians for overflow, coverage and new disciplines.',
        requires: ['Both structures maintained correctly', 'Clear, defensible distinction between the two roles'],
        creates: ['Stable core with flexible edge', 'A low-commitment way to test OT and ST demand'],
        risks: ['Two structures to administer', 'The contractor side still carries misclassification risk'],
        tradeoffs: ['Operationally more complex; strategically the most flexible'],
        reversibility: 'Moderate',
      },
    ],
    evidenceIds: ['EV-017', 'EV-018', 'EV-019'],
    chosenOptionId: null,
    decidedOn: null,
    rationale: null,
    whatWouldChangeThis: [
      'Colorado-specific employment counsel on how the misclassification test applies to supervised clinical work',
      'Actual workers compensation quotes for the therapy class code',
      'What clinicians in this market actually want — a recruiting question as much as a legal one',
    ],
    revisitTrigger: 'Before the first person other than Ellen is engaged.',
    dueByPhase: 1,
  },
  {
    id: 'D-003',
    title: 'Does Blue Star need physical office space?',
    status: 'Open',
    question: 'No office, home office, coworking, or leased administrative space?',
    stakes:
      'Rent is the classic overhead that quietly consumes a small healthcare company. It may also be a licensure requirement rather than a preference — which would move it out of the discretionary column entirely.',
    options: [
      {
        id: 'D-003-A',
        name: 'No office / home office',
        whatItIs: 'Fully distributed. Clinicians work from home and travel to patients; administration runs from Scott\'s home office.',
        requires: [
          'Confirmation that CDPHE licensure does not mandate a physical business location — UNRESOLVED and potentially decisive',
          'Secure, HIPAA-appropriate storage for any physical records',
          'Deliberate effort to build culture without a shared space',
        ],
        creates: ['Near-zero facilities overhead', 'Lower break-even', 'Geographic hiring flexibility'],
        risks: [
          'May be foreclosed by licensure requirements in the agency lane',
          'Isolation is a documented driver of home health clinician burnout',
          'No natural place for equipment, storage or team gathering',
        ],
        tradeoffs: ['Cheapest by a wide margin; hardest for culture and cohesion'],
        reversibility: 'Easy',
      },
      {
        id: 'D-003-B',
        name: 'Coworking or small administrative office',
        whatItIs: 'A modest space for administration, meetings, storage and team gathering — not for treating patients.',
        requires: ['Monthly cost', 'A lease or membership commitment'],
        creates: ['A business address', 'Somewhere to meet, train and store equipment', 'A focal point for culture'],
        risks: ['Fixed cost that does not flex with caseload', 'Easy to over-buy space too early'],
        tradeoffs: ['Real monthly burn in exchange for cohesion and a professional footprint'],
        reversibility: 'Moderate',
      },
    ],
    evidenceIds: ['EV-001'],
    chosenOptionId: null,
    decidedOn: null,
    rationale: null,
    whatWouldChangeThis: [
      'Whether CDPHE requires a physical location for a licensed agency — this may convert the decision into a requirement',
      'Whether clinician isolation emerges as a real retention problem once a team exists',
    ],
    revisitTrigger: 'On resolution of D-001, since the agency lane may decide this.',
    dueByPhase: 2,
  },
  {
    id: 'D-004',
    title: 'Which disciplines at launch — PT only, or broader?',
    status: 'Open',
    question:
      'Does Blue Star launch PT-only with Ellen as clinical anchor, or build toward OT and ST from the start?',
    stakes:
      'Determines recruiting difficulty, addressable referrals, administrative complexity, capital need, and how quickly the business stops depending on one person.',
    options: [
      {
        id: 'D-004-A',
        name: 'PT only',
        whatItIs: 'Launch with physical therapy alone, anchored on Ellen\'s expertise.',
        requires: ['One discipline\'s workflows, documentation and payer rules'],
        creates: ['Fastest, simplest launch', 'Lowest capital need', 'Deep focus and quality in one discipline'],
        risks: [
          'MAXIMUM DEPENDENCY ON ELLEN — this is the defining risk of the option',
          'Referral sources often want a single multi-discipline partner',
          'Narrower revenue base',
        ],
        tradeoffs: ['Simplest to start; most fragile in its dependence on one clinician'],
        reversibility: 'Easy',
      },
      {
        id: 'D-004-B',
        name: 'PT core with contracted PRN OT and ST',
        whatItIs: 'PT is the employed core; OT and ST demand is met through contracted PRN clinicians.',
        requires: ['PRN relationships in two additional disciplines', 'Contractor structure resolved (D-002)'],
        creates: [
          'A multi-discipline story for referral sources without multi-discipline fixed cost',
          'Real demand data for OT and ST before hiring',
          'Reduced dependency on any one clinician',
        ],
        risks: ['PRN availability is unreliable', 'Less control over quality in the contracted disciplines'],
        tradeoffs: ['Broader offering at low fixed cost; less reliable delivery'],
        reversibility: 'Easy',
      },
      {
        id: 'D-004-C',
        name: 'Full PT + OT + ST from launch',
        whatItIs: 'Build the complete multi-discipline offering immediately.',
        requires: ['Recruiting in three disciplines at once', 'More capital', 'Three sets of clinical workflows'],
        creates: ['Strongest referral proposition', 'Fastest path to scale if it works', 'Least key-person risk'],
        risks: [
          'Highest capital requirement and longest runway to break-even',
          'Recruiting three disciplines while also learning the industry',
          'Fixed cost committed before demand is proven',
        ],
        tradeoffs: ['Highest ceiling; highest risk and the least forgiving of early mistakes'],
        reversibility: 'Difficult',
      },
    ],
    evidenceIds: ['EV-006', 'EV-024'],
    chosenOptionId: null,
    decidedOn: null,
    rationale: null,
    whatWouldChangeThis: [
      'What referral sources actually require — worth asking before deciding',
      'Whether OT and ST reimbursement is materially better than PT (ST was the highest pediatric rate found, EV-006)',
      'Ellen\'s view on realistic caseload and her own capacity',
    ],
    revisitTrigger: 'After the first 10 referral-source conversations.',
    dueByPhase: 0,
  },
];

export const decisionsById = new Map(decisions.map((d) => [d.id, d]));
