import type { Evidence } from '../types';

/**
 * RETRIEVAL HONESTY NOTE
 * ----------------------
 * This session's network egress policy blocked direct HTTPS access to
 * colorado.gov, sos.state.co.us and several legal-reference hosts (HTTP 403 at
 * the proxy). Every item below was therefore reached through a search index
 * that summarised the primary document, not by opening the document itself.
 *
 * That is why almost every record carries retrieval: 'search-summary'. The URLs
 * are real and are the correct primary sources — but the exact figures have NOT
 * been read off the source PDFs by this system. Treat every dollar figure here
 * as requiring one human confirmation pass before it drives a real decision.
 * VERIFY-FIRST items are listed in the Evidence view.
 */

const ACCESSED = '2026-09-17';

export const evidence: Evidence[] = [
  // -------------------------------------------------------------------------
  // 01 — REGULATORY / LICENSING
  // -------------------------------------------------------------------------
  {
    id: 'EV-001',
    category: '03-Licensing',
    topic: 'Home care agency license classes',
    claim:
      'Colorado issues Class A home care agency licenses for agencies providing any skilled health care service delivered by a licensed professional — explicitly including licensed therapy professionals. Class B covers personal care services only, and a Class B agency may not provide skilled services.',
    source: 'Colorado Department of Public Health & Environment (CDPHE)',
    url: 'https://cdphe.colorado.gov/home-care-agencies',
    document: 'Home Care Agencies — CDPHE Health Facilities',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'License classes',
    appliesTo: ['Entity structure', 'Licensing', 'Service model'],
    interpretation:
      'If Blue Star operates as an AGENCY that manages and offers skilled therapy services, it falls in the Class A bucket, not Class B. Class B is irrelevant to a therapy business. This is the single most consequential structural fact found so far.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes:
      'Direct page fetch blocked by egress policy. Confirm class definitions against 6 CCR 1011-1 Chapter 26 text before relying on this.',
  },
  {
    id: 'EV-002',
    category: '05-Insurance',
    topic: 'Home care agency liability insurance minimums',
    claim:
      'Colorado home care agency rules set minimum liability insurance at $500,000 per occurrence / $3,000,000 aggregate for Class A licensees, and $100,000 per occurrence / $300,000 aggregate for Class B.',
    source: 'Colorado Secretary of State — Code of Colorado Regulations',
    url: 'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=8507&fileName=6+CCR+1011-1+Chapter+26',
    document: '6 CCR 1011-1 Chapter 26 — Home Care Agencies',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Insurance requirements',
    appliesTo: ['Insurance', 'Licensing', 'Startup capital'],
    interpretation:
      'If Blue Star licenses as a Class A home care agency, $500K/$3M is a regulatory floor, not a shopping preference. This sets a hard minimum on the liability insurance line in the cost model.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes:
      'Multiple rule versions exist in CCR (ruleVersionIds 5624, 5907, 7003, 8507, 12016). Confirm which version is currently in force — one search result flagged a part as "[Effective until 7/1/2025]", so the chapter has been amended recently.',
  },
  {
    id: 'EV-003',
    category: '01-Regulatory',
    topic: 'Definition of "home care agency"',
    claim:
      'A "home care agency" means any sole proprietorship, partnership, association, corporation, not-for-profit agency, or other legal or commercial entity that manages and offers, directly or by contract, skilled home health services or personal care services to a home care consumer.',
    source: 'Colorado Secretary of State — Code of Colorado Regulations',
    url: 'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=8507&fileName=6+CCR+1011-1+Chapter+26',
    document: '6 CCR 1011-1 Chapter 26 — Home Care Agencies',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Definitions',
    appliesTo: ['Entity structure', 'Licensing', 'Regulatory lane'],
    interpretation:
      'The trigger is "manages and offers ... skilled home health services". The open question is whether an outpatient therapy practice whose therapists travel to homes is "offering skilled home health services" in the regulatory sense, or is an outpatient provider practising at an alternate site. That distinction is the hinge of Decision D-001 and is NOT resolved by this definition alone.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Searches did not surface any express licensure exemption for independent therapists in private practice. Absence of evidence is not evidence of absence — this needs a healthcare attorney or a direct CDPHE inquiry.',
  },

  // -------------------------------------------------------------------------
  // 02 — HCPF / MEDICAID BENEFIT DESIGN
  // -------------------------------------------------------------------------
  {
    id: 'EV-004',
    category: '02-Payers',
    topic: 'Pediatric LTHH prior authorization — PT/OT/ST',
    claim:
      'PAR requirements for Pediatric Long-Term Home Health PT, OT and ST/SLP began July 1, 2025. Effective May 4, 2026, PARs are required for all new and existing members receiving Pediatric LTHH services including PT, OT and ST; beginning June 1, 2026, PAR compliance is fully enforced. PARs are submitted through the Atrezzo Provider Portal.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/OM%2025-037%20Pediatric%20Long-Term%20Home%20Health%20(LTHH)%20Prior%20Authorization%20Request%20(PAR)%20RN%20and%20CNA%20Go-Live.pdf',
    document: 'OM 25-037 — Pediatric Long-Term Home Health (LTHH) PAR Go-Live',
    publicationDate: null,
    effectiveDate: '2026-05-04',
    accessedDate: ACCESSED,
    section: 'PAR go-live schedule',
    appliesTo: ['Revenue cycle', 'Operations', 'Cash timing', 'Technology'],
    interpretation:
      'Authorization is now a hard gate on pediatric LTHH revenue, and enforcement is already live as of this build. Every visit must sit behind an approved PAR. This makes PAR preparation a first-class operational process from day one, not a scale-up concern — and it directly lengthens the cash conversion cycle.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Operational memos OM 25-033, OM 25-036 and OM 25-037 are all relevant. Read all three. Atrezzo is the Acentra/Kepro utilization-management portal.',
  },
  {
    id: 'EV-005',
    category: '02-Payers',
    topic: 'Acute vs Long-Term Home Health',
    claim:
      'Acute Home Health serves members with acute needs and is allowed without prior authorization for up to 60 calendar days or until the acute condition resolves, whichever comes first. Long-Term Home Health does require prior authorization.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/home-health-program-0',
    document: 'Long-Term Home Health Program — HCPF',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Program overview',
    appliesTo: ['Benefit design', 'Revenue cycle', 'Clinical intake'],
    interpretation:
      'Pediatric therapy for developmental and chronic conditions is almost entirely long-term, so Blue Star should plan for the authorization-gated path as the default case. The 60-day acute window is not a business model — it is an exception.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes: 'Confirm against the Home Health Billing Manual before building intake workflows.',
  },
  {
    id: 'EV-006',
    category: '02-Payers',
    topic: 'Home health per-visit reimbursement — pediatric (FY2025-26)',
    claim:
      'Colorado Medicaid home health fee schedule effective July 1, 2025 – June 30, 2026 reimburses pediatric (ages 0–20) therapy per visit of up to 2.5 hours: PT (revenue code 421) $145.31; OT (revenue code 431) $146.31; Speech/Language (revenue code 441) $157.97.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/10A_CO_FeeSchedule_HomeHealth_10.2025-26_v1.0.pdf',
    document: 'Home Health Fee Schedule Rates, Effective July 1, 2025 – June 30, 2026',
    publicationDate: null,
    effectiveDate: '2025-07-01',
    accessedDate: ACCESSED,
    section: 'Pediatric therapy rates',
    appliesTo: ['Visit economics', 'Revenue model', 'Path comparison'],
    interpretation:
      'This is the anchor revenue number for the home health lane: roughly $145 per pediatric PT visit, flat, regardless of whether the visit runs 45 minutes or 2.5 hours. That single fact reshapes the whole economic model — under a flat per-visit rate, profitability is driven by VISITS PER DAY, not minutes per visit, which makes travel time the dominant cost variable.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-10-15',
    notes:
      'MUST VERIFY against the source PDF. This number drives every downstream financial conclusion in the app.',
  },
  {
    id: 'EV-007',
    category: '02-Payers',
    topic: 'Home health per-visit reimbursement — pediatric (FY2026-27, current)',
    claim:
      'Colorado Medicaid home health fee schedule effective July 1, 2026 – June 30, 2027 reimburses pediatric (ages 0–20) PT at $143.02 per visit (one visit up to 2.5 hours, revenue codes 420/421).',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/10A_CO_FeeSchedule_HomeHealth_07.01.2026-27_v1.0.pdf',
    document: 'Home Health Fee Schedule Rates, Effective July 1, 2026 – June 30, 2027',
    publicationDate: null,
    effectiveDate: '2026-07-01',
    accessedDate: ACCESSED,
    section: 'Pediatric therapy rates',
    appliesTo: ['Visit economics', 'Revenue model', 'Rate risk'],
    interpretation:
      'The current-year pediatric PT rate appears to have DECREASED from $145.31 to $143.02 — about -1.6% year over year. Two things follow. First, use $143.02, not $145.31, as the live modelling rate. Second, and more important: Colorado Medicaid therapy rates can go DOWN. Any plan that assumes rate growth is unsupported. Model flat-to-declining reimbursement and make margin from operating efficiency, not from rate increases.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-10-15',
    notes:
      'HIGHEST-PRIORITY VERIFICATION ITEM IN THE SYSTEM. Open the PDF, confirm $143.02, and confirm the OT and ST lines which were not returned by search.',
  },
  {
    id: 'EV-008',
    category: '02-Payers',
    topic: 'Outpatient PT/OT delivered in the home',
    claim:
      'Health First Colorado covers outpatient physical and occupational therapy, and those services take place in the office, hospital, HOME and other settings. Services rendered at the member\'s home are reported using CPT codes.',
    source: 'Health First Colorado (Colorado Medicaid member site) / HCPF',
    url: 'https://hcpf.colorado.gov/outpatient-ptot-benefits',
    document: 'Outpatient PT/OT Benefits — HCPF',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Covered settings',
    appliesTo: ['Regulatory lane', 'Revenue model', 'Licensing', 'Strategy'],
    interpretation:
      'THIS IS THE MOST STRATEGICALLY IMPORTANT FINDING IN THE RESEARCH PASS. There appear to be two legally distinct ways to deliver pediatric therapy in a child\'s home in Colorado: (1) as a licensed home care agency billing the per-visit home health benefit, or (2) as an outpatient PT/OT provider billing CPT codes with the home as the place of service. These have different licensure burdens, different reimbursement mechanics (flat per-visit vs. timed units), and different startup costs. Blue Star should not assume lane (1) simply because the service happens at home.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-10-15',
    notes:
      'Do NOT act on this without confirmation. The open question is whether an entity can operate lane (2) at scale without a CDPHE home care agency license. Confirm with a Colorado healthcare attorney AND directly with CDPHE Health Facilities. This is Decision D-001.',
  },
  {
    id: 'EV-009',
    category: '02-Payers',
    topic: 'Outpatient therapy visit limits and PAR threshold',
    claim:
      'The outpatient PT/OT benefit has no hard annual limit for children or adults. Members may receive up to 48 units of any combination of PT/OT services per rolling 12-month period before a PAR is required (evaluations and orthotics excluded), where a unit is 15 minutes — roughly 12 hours of therapy. A daily limit of five units of PT and five units of OT applies.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/outpatient-ptot-benefits',
    document: 'Outpatient PT/OT Benefits / Outpatient Therapy Provider Training — HCPF',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Units and limits',
    appliesTo: ['Revenue model', 'Authorization workflow', 'Visit economics'],
    interpretation:
      'In the outpatient lane, a typical pediatric patient receiving weekly 60-minute therapy (4 units) burns the 48-unit no-PAR allowance in about 12 weeks. So authorization is unavoidable in BOTH lanes for ongoing pediatric care — it just arrives on a different schedule. The 5-unit daily cap also puts a ceiling on revenue per visit in the outpatient lane.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes: 'Confirm against the Physical and Occupational Therapy Billing Manual (hcpf.colorado.gov/ptot-manual).',
  },
  {
    id: 'EV-010',
    category: '02-Payers',
    topic: 'EPSDT entitlement for members under 21',
    claim:
      'Health First Colorado must provide Early and Periodic Screening, Diagnostic and Treatment (EPSDT) benefits to all members under 21. Any medically necessary service that corrects or improves a physical, mental or developmental condition identified through screening must be covered, even if not explicitly listed in Colorado\'s State Medicaid Plan.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/outpatient-ptot-benefits',
    document: 'Outpatient PT/OT Benefits — HCPF',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'EPSDT',
    appliesTo: ['Market size', 'Medical necessity', 'Appeals strategy'],
    interpretation:
      'EPSDT is a structural tailwind for a paediatric-only business: for the under-21 population the coverage standard is broader than the adult standard, and arbitrary visit caps are harder for a payer to defend. It also means strong documentation of medical necessity is the core revenue-protection skill in the company.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-03-01',
    notes:
      'EPSDT is federal (42 U.S.C. 1396d(r)). This is one of the few claims here that rests on stable federal law rather than a state schedule.',
  },
  {
    id: 'EV-011',
    category: '02-Payers',
    topic: 'Managed care enrollment for outpatient therapy',
    claim:
      'Health First Colorado provider enrollment is online. Enrollment in managed care networks is only required if the member being treated is in the Denver Health or Rocky Mountain Health Plan networks.',
    source: 'Health First Colorado',
    url: 'https://www.healthfirstcolorado.com/frequently-asked-questions/health-first-colorado-outpatient-therapy-benefits-frequently-asked-questions/',
    document: 'Outpatient PT and OT Benefits: Frequently Asked Questions',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Provider enrollment FAQ',
    appliesTo: ['Credentialing', 'Payer strategy', 'Launch sequence'],
    interpretation:
      'Materially reduces expected credentialing burden at launch: the fee-for-service enrollment may be the only mandatory step, with managed care contracting needed selectively rather than universally. Denver Health matters specifically because of its Denver-metro Medicaid footprint.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Treat cautiously — ACC Phase III (July 1, 2025) restructured managed care, so an older FAQ may be stale. Verify current-state with HCPF provider services.',
  },
  {
    id: 'EV-012',
    category: '02-Payers',
    topic: 'Regional Accountable Entity structure',
    claim:
      'Accountable Care Collaborative (ACC) Phase III launched July 1, 2025, restructuring RAE regions. Colorado Access is the RAE covering the Denver metro region; Rocky Mountain Health Plans covers Region 1; Northeast Health Partners covers Region 2.',
    source: 'HCPF / Rocky Mountain Health Plans',
    url: 'https://www.rmhp.org/about-us/rae/',
    document: 'Understanding RAEs in Colorado\'s Medicaid Program',
    publicationDate: null,
    effectiveDate: '2025-07-01',
    accessedDate: ACCESSED,
    section: 'RAE regions',
    appliesTo: ['Payer strategy', 'Referral sources', 'Care coordination'],
    interpretation:
      'Colorado Access is the relationship that matters for a Denver-metro pediatric business. RAEs coordinate care and hold regional strategy, which makes them a referral-relationship target, not just an administrative entity.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Sources conflicted on whether Colorado Access is Region 3 or Region 4 — one directory listing said Region 3, a newer source said Region 4. Confirm the post-Phase III region number before using it in any document.',
  },

  // -------------------------------------------------------------------------
  // 03 — PROVIDER ENROLLMENT
  // -------------------------------------------------------------------------
  {
    id: 'EV-013',
    category: '03-Licensing',
    topic: 'Medicaid provider enrollment mechanics',
    claim:
      'Gainwell Technologies is the fiscal agent for Health First Colorado and manages provider enrollment. The Colorado interChange and Provider Web Portal let providers maintain licenses and payment information, check member eligibility, view prior authorization requests, submit claims, and view remittance advice.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/web-portal-register',
    document: 'Provider Web Portal Registration — HCPF',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Provider enrollment',
    appliesTo: ['Enrollment', 'Revenue cycle', 'Technology'],
    interpretation:
      'The Provider Web Portal is free infrastructure that covers eligibility checks, PAR visibility, claim submission and remittance. For a small launch this may remove the need for a paid clearinghouse initially — a real overhead saving worth testing before buying billing software.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-01',
    notes:
      'Enrollment application fee amount was NOT established. Federal rules (42 CFR 455.460) impose an application fee on institutional providers, adjusted annually — confirm whether it applies to the chosen provider type.',
  },
  {
    id: 'EV-014',
    category: '03-Licensing',
    topic: 'CDPHE role in Medicaid certification',
    claim:
      'CDPHE is contracted by HCPF to recommend certification and licensure for applicable HCBS providers. CDPHE reviews and provides recommendations for approval to HCPF, but it remains the provider\'s responsibility to enroll with HCPF separately.',
    source: 'Colorado Department of Public Health & Environment (CDPHE)',
    url: 'https://cdphe.colorado.gov/health-facilities/facility-licensing-fees-and-certification/health-facilities-letter-of-intent-1',
    document: 'Medicaid Certification Guidance Document for HCBS Waiver Services',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Certification process',
    appliesTo: ['Licensing', 'Enrollment', 'Sequencing'],
    interpretation:
      'Confirms the dependency chain is genuinely serial in the agency lane: licensure activity precedes and feeds certification, which precedes payer enrollment, which precedes billable care. Two separate agencies must each be satisfied, and neither will chase the other on your behalf.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes:
      'This source is about HCBS waiver services specifically, which may not be the pathway Blue Star uses. Do not over-generalise it.',
  },
  {
    id: 'EV-015',
    category: '03-Licensing',
    topic: 'Physical therapist individual licensure',
    claim:
      'Colorado PT licensure is administered by the State Physical Therapy Board within DORA\'s Division of Professions and Occupations. Licensure by examination requires a passing NPTE score (FSBPT fees paid separately). Fingerprint-based criminal history background checks are authorised. The renewal fee is $52 biennially.',
    source: 'Colorado DORA — Division of Professions and Occupations',
    url: 'https://dpo.colorado.gov/PhysicalTherapy/LicensingServices',
    document: 'State Physical Therapy Board: Licensing Services',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Licensing services',
    appliesTo: ['Clinician onboarding', 'HR', 'Credentialing'],
    interpretation:
      'Individual clinician licensure is cheap and administratively light in Colorado — not a barrier. Ellen\'s existing license should carry over directly. Budget impact is trivial; the real constraint is recruiting, not licensing.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-01',
    notes:
      'Initial application fee amount NOT established by search. The $52 biennial renewal figure came from a secondary aggregator, not DORA directly.',
  },

  // -------------------------------------------------------------------------
  // 04 — BUSINESS FORMATION / EMPLOYER OBLIGATIONS
  // -------------------------------------------------------------------------
  {
    id: 'EV-016',
    category: '04-Financial',
    topic: 'Colorado LLC formation and maintenance cost',
    claim:
      'Colorado Articles of Organization cost $50 and must be filed online (paper filing is not available). The annual Periodic Report fee is $25, with a $50 late fee.',
    source: 'Secondary aggregators (LLC University, ZenBusiness, Northwest Registered Agent)',
    url: 'https://www.llcuniversity.com/colorado-llc/costs/',
    document: 'Colorado LLC cost guides (multiple, consistent)',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Filing fees',
    appliesTo: ['Formation', 'Startup cost'],
    interpretation:
      'Entity formation is essentially a rounding error in the capital model — under $100 in year one. It should never be the reason a decision is delayed. The expensive part of formation is legal advice, not filing fees.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-01',
    notes:
      'Multiple independent secondary sources agree, which raises confidence, but the Colorado Secretary of State fee page itself was blocked and not read.',
  },
  {
    id: 'EV-017',
    category: '08-HR',
    topic: 'Workers compensation requirement',
    claim:
      'Colorado employers must carry workers\' compensation insurance if they have one or more employees, regardless of whether those employees are part-time, full-time, or family members.',
    source: 'Colorado Department of Labor and Employment (CDLE)',
    url: 'https://cdle.colorado.gov/dwc/employers',
    document: 'Employers — Insurance Requirements, CDLE Division of Workers\' Compensation',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Insurance requirements',
    appliesTo: ['HR', 'Insurance', 'W-2 vs 1099 decision'],
    interpretation:
      'The "family members" clause matters directly: if Ellen is a W-2 employee of the business, workers comp is mandatory from employee number one. This is a real cost trigger attached to the employment-structure decision, and it is one of the cleanest arguments for thinking carefully about W-2 vs contractor structure — though misclassification risk cuts the other way.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes: 'Premium amount depends on class code and payroll. Get a real quote; do not estimate.',
  },
  {
    id: 'EV-018',
    category: '08-HR',
    topic: 'Colorado FAMLI paid leave premium',
    claim:
      'The Colorado FAMLI premium rate for 2026 is 0.88% of wages, split 0.44% employer / 0.44% employee, on wages up to the federal Social Security wage cap of $184,500. Employers with fewer than 10 employees are exempt from the employer share but must still withhold and remit the employee share.',
    source: 'Colorado FAMLI Division / CDLE (via HR advisory summaries)',
    url: 'https://famli.colorado.gov/individuals-and-families/individuals-and-families-faqs',
    document: 'Colorado FAMLI — premium rates 2026',
    publicationDate: null,
    effectiveDate: '2026-01-01',
    accessedDate: ACCESSED,
    section: 'Premium rates',
    appliesTo: ['Payroll', 'Fully loaded clinician cost', 'HR'],
    interpretation:
      'Direct and favourable input to the loaded-cost model: below 10 employees Blue Star carries only the administrative burden of withholding, not the 0.44% employer cost. That exemption expires exactly when the company reaches 10 employees — a real, modellable step-change in cost that should be visible in the scaling plan.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-15',
    notes:
      'Rate reportedly DECREASED for 2026 from the prior year. Confirm directly with famli.colorado.gov before running payroll. Also confirm how the under-10 headcount is counted.',
  },
  {
    id: 'EV-019',
    category: '08-HR',
    topic: 'Colorado unemployment insurance wage base',
    claim:
      'The Colorado unemployment insurance chargeable wage base increased to $30,600 for 2026, up from $27,200 in 2025. New employers who do not qualify for a computed experience rate are assigned an introductory rate based on their industry.',
    source: 'Colorado Department of Labor and Employment (CDLE)',
    url: 'https://cdle.colorado.gov/employers/unemployment-insurance-premiums/premium-rates',
    document: 'Premium Rates — CDLE Unemployment Insurance',
    publicationDate: null,
    effectiveDate: '2026-01-01',
    accessedDate: ACCESSED,
    section: 'Chargeable wage base',
    appliesTo: ['Payroll', 'Fully loaded clinician cost'],
    interpretation:
      'SUTA applies to the first $30,600 of each employee\'s wages. For therapists earning well above that, SUTA is effectively a fixed per-employee cost rather than a percentage — which means it scales with HEADCOUNT, not payroll dollars. That favours fewer, better-paid clinicians over many part-timers, all else equal.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-15',
    notes: 'The new-employer introductory rate for the relevant NAICS industry was NOT established. Needed for accurate loaded cost.',
  },

  // -------------------------------------------------------------------------
  // 05 — LABOUR ECONOMICS
  // -------------------------------------------------------------------------
  {
    id: 'EV-020',
    category: '08-HR',
    topic: 'Pediatric PT compensation — Denver (CONFLICTING SOURCES)',
    claim:
      'Reported compensation for pediatric / home health physical therapists in Denver varies widely by source: Salary.com reports an average pediatric PT salary in Denver of $78,825 (range $69,835–$89,266) as of January 2026; Salary.com separately reports Home Health PT in Denver at $113,401/yr (~$55/hr) as of February 2026; Glassdoor reports a Colorado pediatric PT average of $135,278.',
    source: 'Salary.com, Glassdoor (secondary compensation aggregators)',
    url: 'https://www.salary.com/research/salary/alternate/home-health-physical-therapist-salary/denver-co',
    document: 'Multiple compensation aggregator pages',
    publicationDate: '2026-02-01',
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Denver metro',
    appliesTo: ['Clinician cost', 'Hiring', 'Break-even'],
    interpretation:
      'These sources disagree by more than $56,000 — a spread far too wide to plan on. Aggregator data is self-reported and methodologically weak. The only reliable way to price this labour market is primary research: pull live Colorado job postings (Colorado\'s pay transparency law requires posted ranges), and ask Ellen what she and her peers are actually paid. Until then this is a RANGE, not a number, and it is the single largest uncertainty in the cost model.',
    confidence: 'Unverified',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2026-10-15',
    notes:
      'ACTION: Colorado\'s Equal Pay for Equal Work Act requires employers to disclose compensation in job postings. Scraping live competitor postings would produce far better data than any aggregator. Ellen is a primary source here and should be treated as one.',
  },

  // -------------------------------------------------------------------------
  // 06 — INSURANCE
  // -------------------------------------------------------------------------
  {
    id: 'EV-021',
    category: '05-Insurance',
    topic: 'Business insurance cost ranges',
    claim:
      'Broker/aggregator sources report: home care agencies average roughly $666/yr for medical malpractice coverage; small physical therapy businesses pay roughly $300–$1,500/yr for professional liability; general liability roughly $25/month; a non-medical home care agency typically $2,000–$7,500/yr for general liability plus caregiver professional liability at $1M/$3M limits; agencies providing skilled services $5,000–$10,000+/yr.',
    source: 'Insureon, TechInsurance, BizInsure (insurance marketplaces)',
    url: 'https://www.insureon.com/healthcare-professionals-business-insurance/home-healthcare-providers/cost',
    document: 'Home Health Care Business Insurance Costs',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Average costs',
    appliesTo: ['Insurance', 'Startup cost', 'Operating burn'],
    interpretation:
      'Useful only as an order-of-magnitude bracket: skilled-service agencies land in the $5,000–$10,000+/yr band, which is roughly 10x the naive "$666 malpractice" figure a quick search returns. Note these are marketing pages from companies that sell insurance, so they skew toward attractive low numbers. Budget the high end and replace with a real quote as early as possible.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'These are national marketplace figures, not Colorado quotes, and they do not reflect the $500K/$3M Class A regulatory minimum (EV-002). Get three real quotes.',
  },

  // -------------------------------------------------------------------------
  // 07 — TECHNOLOGY
  // -------------------------------------------------------------------------
  {
    id: 'EV-022',
    category: '09-Technology',
    topic: 'Pediatric therapy EMR pricing',
    claim:
      'Fusion by Ensora Health (pediatric therapy EMR) is reported to start at $49/month for the first user plus $39/month per additional user, with higher tiers at $159 and $189 for the first user. Raintree Systems does not publish pricing; third-party estimates put it at $200–$400+/month per provider.',
    source: 'SoftwareFinder, Proactive Chart, PassageHealth (software comparison sites)',
    url: 'https://softwarefinder.com/emr-software/fusion-web-clinic',
    document: 'Fusion By Ensora Health — Pricing & Features',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Pricing',
    appliesTo: ['Technology', 'Operating burn', 'Overhead kill list'],
    interpretation:
      'EMR is affordable at small scale — plausibly under $150/month for a 2–3 clinician launch. This is NOT a capital barrier and should not delay launch. The real selection criteria are Colorado Medicaid billing support, PAR/authorization tracking, mobile documentation in the home (often without reliable connectivity), and a signed BAA — not headline price.',
    confidence: 'Unverified',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Third-party pricing pages for SaaS are frequently stale or wrong. Get direct quotes. Vendors not yet priced: WebPT, Axxess, HHAeXchange, Kinnser/WellSky, Alora.',
  },

  // -------------------------------------------------------------------------
  // 08 — MARKET
  // -------------------------------------------------------------------------
  {
    id: 'EV-023',
    category: '12-Market',
    topic: 'Colorado Medicaid enrollment',
    claim:
      'As of December 2025, 1,229,956 Coloradans were enrolled in Health First Colorado, and 74,432 children were enrolled in Child Health Plan Plus (CHP+). Children ages 0–18 are eligible for Health First Colorado at 142% FPL and for CHP+ at 265% FPL.',
    source: 'healthinsurance.org summarising HCPF enrollment data',
    url: 'https://www.healthinsurance.org/medicaid/colorado/',
    document: 'Medicaid eligibility and enrollment in Colorado',
    publicationDate: '2025-12-01',
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Enrollment figures',
    appliesTo: ['Market sizing', 'Payer mix'],
    interpretation:
      'Establishes that the Colorado Medicaid population is large, but does NOT size the addressable market. The needed number — children under 21 enrolled in Health First Colorado in the Denver metro, with therapy-relevant diagnoses — is not established. Do not confuse total enrollment with addressable demand.',
    confidence: 'Unverified',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'HCPF publishes county-level enrollment dashboards. That is the right primary source and was not reachable this session. CHP+ is a separate program from Medicaid proper — do not merge the two figures.',
  },

  // -------------------------------------------------------------------------
  // 09 — COMPETITORS
  // -------------------------------------------------------------------------
  {
    id: 'EV-024',
    category: '11-Competitors',
    topic: 'Denver-metro pediatric home therapy providers',
    claim:
      'Identified providers serving pediatric therapy in Colorado homes include: Spark Home Health (Denver, Medicare/Medicaid certified home health agency, PT/OT/SLP, medically fragile children); OASIS Pediatric Therapy (Front Range, PT/OT/ST, serves ONLY families with Medicaid as primary or secondary insurance); KidsCare (3801 E. Florida Ave Ste 917, Denver CO 80210; PT/OT/ST; Medicaid, commercial and self-pay); PASCO Home Healthcare (Denver, Colorado Springs, Fort Collins; pediatric personal care).',
    source: 'Company websites and LinkedIn',
    url: 'https://oasispediatrictherapy.com/home-health/',
    document: 'Multiple competitor websites',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: ACCESSED,
    section: 'Service descriptions',
    appliesTo: ['Competitive positioning', 'Market entry', 'Differentiation'],
    interpretation:
      'Two useful signals. First, the market is real and served — this is not a greenfield, which is reassuring (demand is proven) and sobering (differentiation is required). Second, OASIS operating a Medicaid-only model at Front Range scale is strong indirect evidence that the Medicaid pediatric home therapy economics DO work in Colorado. A company does not build a multi-county Medicaid-only business on a losing unit economic.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2026-12-01',
    notes:
      'No reviews, complaints, compensation data, ownership or company-size information was gathered. Parent-experience and clinician-experience research (PARTS 16–17) remains substantially undone.',
  },

  // -------------------------------------------------------------------------
  // 10 — OBSERVED OPERATIONAL BASELINE (first-hand, not external research)
  // -------------------------------------------------------------------------
  {
    id: 'EV-025',
    category: '14-Operations',
    topic: "Ellen's current observed pediatric home-health PT workload",
    claim:
      'Ellen currently averages 8 patient visits per day across a 9:00am-5:00pm workday, with approximately 15 minutes average drive time between visits and approximately 5 minutes of documentation per visit. Most documentation is completed DURING the patient visit rather than as separate end-of-day administrative time. This implies an approximate 60-minute visit cycle of roughly 45 minutes patient-facing time plus 15 minutes travel.',
    source: "Ellen — current observed workload (first-hand report)",
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's current observed workload, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Clinical productivity', 'Visit economics', 'Capacity', 'Staffing', 'Revenue model'],
    interpretation:
      'This is the first hard operational input the model has had, and it replaces four guesses at once. Two things stand out. First, 8 visits/day is far above the 5/day the model previously assumed, which changes the viability picture materially. Second, documentation happening DURING the visit rather than after it is the structural reason 8 visits fit an 8-hour day: 45 + 15 = a 60-minute cycle exactly, so 8 cycles = 480 minutes. If documentation were additive the day would run to 8.7 hours and the schedule would not close.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2027-03-01',
    notes:
      'IMPORTANT SCOPE LIMIT: this is ONE experienced clinician\'s observed baseline in her current role. It is NOT an industry productivity standard, NOT a benchmark, and NOT a target to hold other clinicians to. A new or less experienced PT should not be assumed to reach it. Treat it as a well-grounded starting point for modelling and label it as such wherever it appears.',
  },
  {
    id: 'EV-026',
    category: '14-Operations',
    topic: "Ellen's observed documentation workflow",
    claim:
      'Ellen spends approximately 5 minutes on documentation per visit. Approximately 90% of that documentation is completed during the visit itself or during natural downtime within the workday; the remaining approximately 10% is completed at home after the workday. Her current EMR is StateWise.',
    source: "Ellen — current observed workflow (first-hand report)",
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's current observed documentation workflow, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Clinical productivity', 'Capacity', 'Clinician burden', 'Technology'],
    interpretation:
      'This resolves the knife-edge left open by the Run 6 sensitivity analysis. The earlier model had only two buckets — documentation either absorbed into the day or extending it — and 100% absorption was the only setting under which an 8-visit day closed. Ellen\'s actual split is three-way: 90% inside the workday, 10% after it, and therefore NOTHING that extends the clinical schedule. The 10% is real work and is tracked as clinician burden, but it does not consume 9-to-5 capacity and so must not reduce the visit ceiling.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2027-03-01',
    notes:
      'STATEWISE IS CONTEXT, NOT CAUSE. StateWise is recorded only as the EMR Ellen currently uses. Nothing here establishes that StateWise produces a particular documentation efficiency, and no productivity assumption in this system is derived from the choice of EMR. If Blue Star later evaluates EMRs, the 90/10 split is a description of how Ellen works today, not a benchmark any product should be expected to reproduce.',
  },
  {
    id: 'EV-027',
    category: '14-Operations',
    topic: "Ellen's observed visit mix and visit lengths",
    claim:
      "Ellen's Early Intervention (EI) visits run approximately 60 minutes and all other visits run approximately 30 minutes. Her current schedule is approximately 50% EI and 50% other.",
    source: 'Ellen — current observed visit types and schedule mix (first-hand report)',
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's current observed visit mix, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Clinical productivity', 'Capacity', 'Revenue model', 'Referral strategy'],
    interpretation:
      'This replaces a standalone 45-minute patient-facing assumption with the structure that actually generates it. The 45-minute figure is now DERIVED from the mix, and that matters because reimbursement is flat per visit: a 60-minute EI visit earns exactly what a 30-minute visit earns while consuming twice the patient-facing time. The caseload mix is therefore a first-class capacity and profitability lever, not a clinical detail — and it is one of the few levers Blue Star can actually influence, through which referral sources it cultivates.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2026-12-01',
    notes:
      'The 50/50 split is APPROXIMATE and describes Ellen\'s present schedule only. It must not be treated as a permanent or universal mix: it will move as referral sources change, and the model exposes it as an editable input precisely so that movement can be tested rather than assumed away.',
  },
  {
    id: 'EV-028',
    category: '04-Financial',
    topic: 'Launch compensation plan — $0 owner compensation until full-time transition',
    claim:
      'Scott states that Blue Star will pay Ellen no owner compensation while she continues her current home-health job, and that she will move to Blue Star full time only at a later transition point. Owner compensation before that transition is therefore $0.',
    source: 'Scott — stated launch plan (first-hand)',
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: 'Founder Ramp scenario definition, stated by Scott',
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Cash model', 'Founder ramp', 'Owner compensation', 'Transition planning'],
    interpretation:
      'This is the defining condition of the launch scenario and it is unusually favourable: with no owner draw, essentially all operating cash flow accumulates in the business, so Blue Star can build a reserve while household income continues from elsewhere. It also means the usual founder-salary line is absent from the early model, and any figure that looks like a clinician salary in this phase would be wrong.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2027-03-01',
    notes:
      'The compensation LEVEL after transition (AS-024) is a separate and still-unknown question. This record establishes only the $0 figure before transition, not what replaces it.',
  },
  {
    id: 'EV-029',
    category: '14-Operations',
    topic: "Ellen's weekly schedule structure — 4 clinical days plus a makeup day",
    claim:
      'Ellen averages 8 visits per day across a FOUR-day week of regular visits, with one additional day each week held as a makeup visit day for rescheduled appointments.',
    source: 'Ellen — current observed schedule (first-hand report, correcting an earlier summary)',
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's weekly schedule structure, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Capacity', 'Annual volume', 'Cancellation economics', 'Revenue model'],
    interpretation:
      'Two consequences, and the second is the interesting one. First, regular weekly volume is 8 x 4 = 32 visits, not 8 x 5 — the model previously spread visits across an undifferentiated week and overstated annual scheduled volume. Second, and more structurally: the makeup day changes what a cancellation costs. A cancelled visit is rescheduled rather than lost, so the EFFECTIVE cancellation rate is only the portion that overflows the makeup day. At the modelled cancellation rate that overflow is zero, which means the assumed revenue loss from cancellations was largely illusory. The makeup day is recovery capacity for the existing caseload, not spare capacity for growth.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2027-03-01',
    notes:
      'This corrects the earlier characterisation of an 8-visit day across a generic working week (EV-025). The 8 visits/day figure itself is unchanged; what changed is how many days per week carry that load, and what happens to cancellations.',
  },
  {
    id: 'EV-030',
    category: '14-Operations',
    topic: "Ellen's observed caseload composition",
    claim:
      "Ellen's current schedule of weekly visits comprises: 6 patients seen once weekly at 30 minutes; 8 patients seen twice weekly at 30 minutes; and 11 patients seen once weekly at 60 minutes. She separately stated 23 distinct patients and 32 visits per week.",
    source: 'Ellen — current observed caseload (first-hand report)',
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's caseload composition, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Capacity', 'Visit mix', 'Visit frequency', 'Founder ramp', 'Revenue model'],
    interpretation:
      'This single report resolves four previously unknown or estimated inputs and corrects two. Visit frequency (AS-020, AS-021) was null and is now observed. Caseload size (AS-027) was null and is now 25. The EI share was estimated at 50% of visits and is actually 33%, which drops the weighted visit length from an assumed 45 minutes to 40 and shortens the visit cycle from 60 to 55 minutes. Most importantly it exposes a distinction the model had been eliding: EI is 33% of VISITS but 44% of PATIENTS, because EI children are seen weekly while some non-EI children are seen twice weekly. Visit duration must use the visit share; a patient census must use the patient share.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2026-12-01',
    notes:
      'UNRESOLVED ARITHMETIC. The itemised cohorts sum to 25 patients and 33 weekly visits, against the separately stated 23 patients and 32 visits. The model uses the cohort figures because they are itemised and internally consistent, and surfaces both gaps. The difference is small but it has not been reconciled, and either figure could be the correct one.',
  },
];

export const evidenceById = new Map(evidence.map((e) => [e.id, e]));
