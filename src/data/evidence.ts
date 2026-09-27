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
      'Multiple rule versions exist in CCR (ruleVersionIds 5624, 5907, 7003, 8507, 11556, 12016). Confirm which version is currently in force — one search result flagged a part as "[Effective until 7/1/2025]", so the chapter has been amended recently. Cross-checked 2026-09-27: the LII copy of Chapter 26 states the same $500,000 / $3,000,000 Class A minimum.',
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
      'Operational memos OM 25-033, OM 25-036 and OM 25-037 are all relevant. Read all three. Atrezzo is the Acentra/Kepro utilization-management portal. Cross-checked 2026-09-27: search summaries of OM 25-037 repeat the May 4 and June 1, 2026 dates.',
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
      'Superseded as the modelling rate by EV-007 (read directly). Cross-check 2026-09-27: the FY2026-27 schedule\'s "effective 10/1/2025" column shows PT $143.02, OT $144.01 and speech $155.48 — each exactly the figure here divided by 1.016, which confirms these FY2025-26 values indirectly.',
  },
  {
    id: 'EV-007',
    category: '02-Payers',
    topic: 'Home health per-visit reimbursement — pediatric (FY2026-27, current) — READ DIRECTLY',
    claim:
      'The Home Health Fee Schedule effective July 1, 2026 – June 30, 2027 (version 1.0, updated 6/01/2026) shows two rate columns. Rate effective 10/1/2025: pediatric (0-20) PT, revenue codes 420/421, $143.02; OT 430/431 $144.01; speech 440/441 $155.48; RN/LPN $130.85. Rate effective 7/1/2026: PT $140.16; OT $141.13; speech $152.37; RN/LPN $128.23. Unit value for each therapy line is one visit up to 2½ hours. The long-term home health daily maximum ($445.82 from 7/1/2026) applies only to members aged 21 and older.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/10A_CO_FeeSchedule_HomeHealth_07.01.2026-27_v1.0.pdf',
    document: 'Home Health Fee Schedule Rates, Effective July 1, 2026 – June 30, 2027 (stored at docs/sources/)',
    publicationDate: '2026-06-01',
    effectiveDate: '2026-07-01',
    accessedDate: '2026-09-27',
    section: 'Pediatric therapy rates',
    appliesTo: ['Visit economics', 'Revenue model', 'Rate risk'],
    interpretation:
      'READ DIRECTLY from the PDF Scott supplied — the first figure in this system with that status. The current pediatric PT rate is $140.16, not $143.02: the model had been carrying the October 2025 rate as if it were the July 2026 rate. Two cuts now stack: -1.6% in October 2025 (the budget shortfall, EV-037) and -2.0% on July 1, 2026 (HB 26-1410, EV-046), taking pediatric PT from $145.31 to $140.16 — about -3.5% in nine months. Speech remains the best-paid pediatric discipline at $152.37; OT sits between. Everything else previously said about this rate still holds: flat per visit up to 2.5 hours, agency lane only, and the agency lane is currently closed to new entrants.',
    confidence: 'Confirmed',
    retrieval: 'direct-read',
    requiresProfessionalVerification: false,
    recheckDate: '2027-07-01',
    notes:
      'Under-21 members are exempt from the daily maximum, which matters for a child receiving two disciplines on one day. Recheck at the next fiscal-year schedule, and sooner if HCPF issues another mid-year bulletin.',
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
      'Enrollment application fee amount was NOT established in the first pass; see EV-036 ($750 for 2026, institutional providers only). Confirm whether it applies to the chosen provider type.',
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
      'Rate reportedly DECREASED for 2026 from the prior year. Confirm directly with famli.colorado.gov before running payroll. Also confirm how the under-10 headcount is counted. Cross-checked 2026-09-27 against Patriot, Paychex and Jackson Lewis summaries: all three agree on 0.88% / 0.44% / 0.44% and the under-10 employer exemption.',
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
      "Ellen's current schedule of weekly visits comprises: 6 patients seen once weekly at 30 minutes; 8 patients seen twice weekly at 30 minutes; and 11 patients seen once weekly at 60 minutes. She separately stated 23 distinct patients and 32 visits per week. This caseload was ASSIGNED to her by her current pediatric home health employer; she did not select the patients or the mix.",
    source: 'Ellen — current observed caseload (first-hand report)',
    url: 'https://github.com/scottyfncodes/BlueStar',
    document: "Ellen's caseload composition, reported by Scott",
    publicationDate: null,
    effectiveDate: '2026-09-18',
    accessedDate: '2026-09-18',
    section: null,
    appliesTo: ['Capacity', 'Visit mix', 'Visit frequency', 'Founder ramp', 'Revenue model'],
    interpretation:
      'Resolves four previously unknown or estimated inputs and corrects two — but only some of it transfers to Blue Star, and the difference matters. TRANSFERABLE: visit LENGTHS (60 min EI, 30 min non-EI) are service definitions, and per-patient FREQUENCIES (EI weekly, non-EI 1x or 2x weekly) are set by plan of care, medical necessity and payer authorisation. Those would plausibly hold for a Blue Star patient of the same type. NOT TRANSFERABLE: the MIX — 33% of visits and 44% of patients being EI, the 6/8 split between once- and twice-weekly non-EI children, and the caseload size of 25. Those are allocation decisions made by Ellen\'s employer, describing one scheduler\'s assignment to one clinician. They say nothing about what referrals exist in the Denver market or what Blue Star would be able to build. It also exposes a distinction the model had been eliding: EI is 33% of VISITS but 44% of PATIENTS, so visit duration must use the visit share and a patient census must use the patient share.',
    confidence: 'Strong evidence',
    retrieval: 'user-reported',
    requiresProfessionalVerification: false,
    recheckDate: '2026-12-01',
    notes:
      'UNRESOLVED ARITHMETIC. The itemised cohorts sum to 25 patients and 33 weekly visits, against the separately stated 23 patients and 32 visits. The model uses the cohort figures because they are itemised and internally consistent, and surfaces both gaps. The difference is small but it has not been reconciled, and either figure could be the correct one. SCOPE: this is an assigned caseload at another company — strong evidence about how Ellen currently works, and weak evidence about what Blue Star will look like.',
  },
  // -------------------------------------------------------------------------
  // 11 — VERIFICATION PASS 2026-09-27
  // Reached through a search index again: colorado.gov, sos.state.co.us,
  // cms.gov, ecfr.gov, irs.gov and the legal-reference hosts were still blocked
  // at the egress proxy. Nothing below was read off a source document.
  // -------------------------------------------------------------------------
  {
    id: 'EV-031',
    category: '02-Payers',
    topic: 'Medicaid home health enrollment requires Medicare certification',
    claim:
      'To enroll as a Health First Colorado home health provider an agency must (1) hold a current Class A home care agency license from CDPHE, (2) obtain Medicare certification and/or deemed status through an accepted home health accrediting body (The Joint Commission, CHAP or ACHC), (3) be enrolled as a Medicare provider, and (4) be in good standing with HCPF, CDPHE and Medicare. HCPF states that all licensed home health agencies in Colorado must be Medicare certified and follow 42 CFR 440.70 and 42 CFR Part 484.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/hh-billing_manual',
    document: 'Home Health Billing Manual — provider eligibility; Home Health FAQ',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Provider eligibility',
    appliesTo: ['Regulatory lane', 'Licensing', 'Timeline', 'Startup capital'],
    interpretation:
      "The agency lane (D-001 option A) is heavier than the plan assumed. A Class A license alone does not let Blue Star bill the per-visit home health benefit: Medicare certification is a precondition, and that brings the federal Conditions of Participation, an accreditation survey, a capitalisation test and a Medicare enrollment on top of the state license. Ellen's current employer almost certainly holds all of this, which is why it can bill per visit.",
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'Two separate HCPF pages (the billing manual and the Home Health FAQ) were summarised consistently. Read the "Provider Eligibility" section of the Home Health Billing Manual directly to confirm.',
  },
  {
    id: 'EV-032',
    category: '01-Regulatory',
    topic: 'Medicare will not certify a therapy-only home health agency',
    claim:
      "Under federal Medicare rules a home health agency must provide skilled nursing services AND at least one other therapeutic service (physical therapy, speech-language pathology, occupational therapy, medical social services or home health aide services) in the patient's home, and must furnish at least one of those services directly through its own employees. The statutory definition requires an agency to be 'primarily engaged in providing skilled nursing services and other therapeutic services' (Social Security Act section 1861(o)).",
    source: 'Centers for Medicare & Medicaid Services (CMS)',
    url: 'https://www.cms.gov/medicare/health-safety-standards/certification-compliance/home-health-agencies',
    document: 'CMS — Home Health Agencies: certification and compliance; State Operations Manual §2180',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Definition of a home health agency',
    appliesTo: ['Regulatory lane', 'Service model', 'Disciplines at launch', 'Staffing'],
    interpretation:
      'A therapy-only company cannot be Medicare certified, and therefore (per EV-031) cannot enroll as a Colorado Medicaid home health agency. To use the per-visit home health benefit Blue Star would have to add skilled nursing — a different business, with nurse recruitment, nursing supervision and a nursing compliance surface. This ties D-001 (lane) directly to D-004 (disciplines) in a way the plan had not recognised.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2027-03-01',
    notes:
      'Federal law, stable for decades; several state health departments restate it identically. Still confirm with the accrediting body or counsel that no therapy-only pathway exists in Colorado.',
  },
  {
    id: 'EV-033',
    category: '01-Regulatory',
    topic: 'Nationwide moratorium on new home health agency Medicare enrollment',
    claim:
      'CMS imposed a nationwide temporary moratorium on Medicare enrollment of new home health agencies (and, separately, hospices) effective May 13, 2026, published in the Federal Register on May 15, 2026 (document 2026-09717). It lasts six months, may be extended in further six-month increments, blocks new HHAs, new branches and new practice locations, and does not apply to applications a Medicare Administrative Contractor received before May 13, 2026. CMS invited each state to decide whether to mirror the moratorium in Medicaid under 42 CFR 455.470.',
    source: 'CMS / Federal Register',
    url: 'https://www.federalregister.gov/documents/2026/05/15/2026-09717/medicare-medicaid-and-childrens-health-insurance-programs-announcement-of-nationwide-temporary',
    document: 'Announcement of Nationwide Temporary Moratoria on Enrollment of Home Health Agencies (HHAs)',
    publicationDate: '2026-05-15',
    effectiveDate: '2026-05-13',
    accessedDate: '2026-09-27',
    section: 'Scope and duration',
    appliesTo: ['Regulatory lane', 'Timeline', 'Strategy', 'Rate risk'],
    interpretation:
      'As of this build a brand-new home health agency cannot enroll in Medicare anywhere in the United States, and Colorado Medicaid requires Medicare enrollment for home health providers (EV-031). The agency lane is therefore closed to Blue Star until at least mid-November 2026, and longer if CMS extends. The outpatient PT/OT lane is untouched — it involves no Medicare HHA enrollment. Whether HCPF has imposed a matching Medicaid moratorium was not established.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-13',
    notes:
      'Consistently reported by the CMS press release, the Federal Register notice, AHA, ACHC, CHAP and several health-law firms. Recheck on or after November 13, 2026 for extension or lifting.',
  },
  {
    id: 'EV-034',
    category: '01-Regulatory',
    topic: 'Home care agency licensing statute and its exemptions',
    claim:
      'The definition of "home care agency" in C.R.S. 25-27.5-102 excludes, among others: an individual who is not employed by or affiliated with a home care agency and who acts alone, without employees or contractors; outpatient rehabilitation agencies and comprehensive outpatient rehabilitation facilities; community and rural health networks making public-health home visits; consumer-directed attendant programs; and licensed dialysis centres providing in-home dialysis. CORRECTION 2026-09-27: these exclusions are NOT in section 103, which was read in full (EV-045) and contains only the licence requirement and penalties; they sit in the definitions section 102, which has not yet been read directly.',
    source: 'Colorado Revised Statutes § 25-27.5-102 (via Justia search summaries) and CDPHE compliance guidance quoting the exclusion',
    url: 'https://law.justia.com/codes/colorado/title-25/health-care/article-27-5/section-25-27-5-102/',
    document: 'C.R.S. 25-27.5-102 — Definitions ("home care agency")',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Exemptions',
    appliesTo: ['Regulatory lane', 'Founder ramp', 'Entity structure', 'Hiring'],
    interpretation:
      "Two things. First, a single therapist working entirely alone — no employees, no contractors — appears to sit outside the licensing statute. That is the legal shape of the Founder Ramp's first phase, where Ellen is the only clinician. Second, the exemption is written for an 'individual', so whether it survives once care is delivered through an LLC, or the moment a second clinician is engaged, is exactly the question D-001 already sends to counsel. The 'outpatient rehabilitation agency' exemption refers to a Medicare-certified rehabilitation agency, a specific federal category, not to any practice that happens to bill outpatient codes.",
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'The exclusion text is consistent across the Justia summary of section 102 and a CDPHE compliance page, but section 102 itself has not been read. The earlier reference to 25-27.5-103(1)(b)(III) was wrong — (1)(b) of section 103 is the civil-penalty clause. Next document to paste: 25-27.5-102 in full.',
  },
  {
    id: 'EV-035',
    category: '13-Funding',
    topic: 'Medicare HHA capitalisation test and pre-survey patient requirement',
    claim:
      'Under 42 CFR 489.28 a home health agency entering Medicare must hold initial reserve operating funds sufficient to run the agency for the three months after billing privileges are granted, excluding expected Medicare receivables, at application and throughout enrollment. Separately, CMS survey guidance requires a prospective agency to have provided skilled care to at least 10 patients (at least 7 active at the time of survey) before its initial certification survey; accrediting bodies describe roughly 3-9 months from start to survey.',
    source: 'CMS — 42 CFR 489.28; State Operations Manual, Appendix B (home health)',
    url: 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-489/subpart-B/section-489.28',
    document: '42 CFR 489.28 Special capitalization requirements for HHAs; SOM Appendix B',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Initial reserve operating funds; initial survey readiness',
    appliesTo: ['Startup capital', 'Cash timing', 'Sequencing'],
    interpretation:
      'Two hidden requirements in the agency lane. The agency must treat patients — paid some other way, or unpaid — BEFORE it can be surveyed, and must prove three months of operating cash in the bank. Neither appears in the current capital model, which counts unknown lines as zero. This is another reason the agency lane cannot be the first phase of anything.',
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes:
      'The regulation text is stable and quoted consistently; the 10-patient figure is survey guidance and can be reduced to 5 in a medically underserved area. Confirm current practice with the accrediting body.',
  },
  {
    id: 'EV-036',
    category: '13-Funding',
    topic: 'Federal provider enrollment application fee for 2026',
    claim:
      'The CMS provider enrollment application fee for calendar year 2026 is $750, payable by institutional providers — including home health agencies enrolling through CMS-855A or PECOS. Federal rules (42 CFR 455.460) apply the same fee to Medicaid institutional enrollment unless it has already been paid to Medicare.',
    source: 'Federal Register — provider enrollment application fee amount for CY2026',
    url: 'https://www.federalregister.gov/documents/2025/12/03/2025-21877/medicare-medicaid-and-childrens-health-insurance-programs-provider-enrollment-application-fee-amount',
    document: 'Provider Enrollment Application Fee Amount for Calendar Year 2026',
    publicationDate: '2025-12-03',
    effectiveDate: '2026-01-01',
    accessedDate: '2026-09-27',
    section: 'Fee amount',
    appliesTo: ['Startup cost', 'Enrollment'],
    interpretation:
      'Small but now known; it replaces the "not established" note in EV-013 for the agency lane. Individual practitioners and physician / non-physician practitioner groups are generally exempt from the federal fee, so it may not apply to an outpatient therapy group at all — confirm with HCPF enrollment for the chosen provider type.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-15',
    notes: 'Fee is adjusted annually; the 2027 figure will publish around December 2026.',
  },
  {
    id: 'EV-037',
    category: '02-Payers',
    topic: 'Why the pediatric therapy rate fell 1.6% — the October 2025 budget cut',
    claim:
      'Following Executive Order D 2025 014 (August 28, 2025), which declared a state revenue shortfall, HCPF issued Special Provider Bulletin B2500528 (September 2025) reducing all fee-for-service rates that had been raised 1.6% for FY2025-26, for dates of service on or after October 1, 2025. Dental, some HCBS services and pediatric behavioral therapies were cut by more than 1.6%.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/Special%20Provider%20Bulletin%20-%20Rate%20Reductions%20092025_B2500528_0.pdf',
    document: 'Special Provider Bulletin — Rate Reductions, September 2025 (B2500528)',
    publicationDate: '2025-09-01',
    effectiveDate: '2025-10-01',
    accessedDate: '2026-09-27',
    section: 'Across-the-board reduction',
    appliesTo: ['Visit economics', 'Rate risk', 'Revenue model'],
    interpretation:
      "This explains the rate movement between EV-006 and EV-007 exactly: $145.31 divided by 1.016 is $143.02. The FY2026-27 pediatric PT rate is the FY2025-26 rate with the legislature's 1.6% increase taken back, and the cut has almost certainly applied since October 1, 2025 rather than July 1, 2026. Two lessons: Colorado Medicaid rates move with the state budget, not with inflation, and they can move mid-year on about a month's notice.",
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-12-01',
    notes:
      "The arithmetic is ours, not the bulletin's — but the FY2026-27 schedule, now read directly (EV-007), labels its left column 'Rate Effective 10/1/2025' and shows $143.02 there, which confirms both the date and the amount of this cut.",
  },
  {
    id: 'EV-038',
    category: '04-Financial',
    topic: 'IRS standard mileage rate for 2026',
    claim:
      'The IRS business standard mileage rate is 72.5 cents per mile for January 1 – June 30, 2026 and 76 cents per mile for July 1 – December 31, 2026, after a mid-year increase attributed to fuel costs.',
    source: 'Internal Revenue Service',
    url: 'https://www.irs.gov/tax-professionals/standard-mileage-rates',
    document: 'IRS newsroom: 2026 standard mileage rates and mid-year adjustment',
    publicationDate: '2025-12-29',
    effectiveDate: '2026-07-01',
    accessedDate: '2026-09-27',
    section: 'Business rate',
    appliesTo: ['Mileage cost', 'Compensation policy'],
    interpretation:
      "AS-010's $12 per visit corresponds to roughly 16-17 miles round trip at these rates, which is plausible for a tight Denver-metro route but has no route data behind it. The RATE is now verified; the MILES are not. Note also that reimbursing mileage is a policy choice, not a legal requirement, though unreimbursed driving is a hidden pay cut that clinicians notice.",
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-15',
    notes: 'Reported identically by the IRS newsroom title, NATP, SHRM and the Journal of Accountancy.',
  },
  {
    id: 'EV-039',
    category: '08-HR',
    topic: 'Pediatric PT compensation — 2026 aggregator data and per-visit pay',
    claim:
      'Aggregator data as of mid-2026: ZipRecruiter reports Denver pediatric physical therapist pay averaging $100,277 per year (most between $76,200 and $114,800) and Denver home health physical therapist pay averaging $52.86 per hour (most between $44.62 and $57.50). At least one Denver pediatric home health posting advertised pay of $65-$95 per visit depending on experience.',
    source: 'ZipRecruiter, Glassdoor, Indeed job listings (secondary aggregators)',
    url: 'https://www.ziprecruiter.com/Jobs/Pediatric-Physical-Therapist/-in-Denver,CO',
    document: 'Pediatric Physical Therapist Jobs in Denver, CO; Home Health Physical Therapist Jobs in Denver, CO',
    publicationDate: '2026-09-02',
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Denver metro',
    appliesTo: ['Clinician cost', 'Compensation structure', 'Break-even'],
    interpretation:
      'Adds a fourth conflicting aggregator figure to the three in EV-020, so AS-003 stays null. The per-visit posting is the more useful signal: pediatric home health employers in Denver appear to pay per completed visit, which turns clinician cost from a fixed salary into a variable cost per visit — a structure the model does not yet represent, and one that changes the break-even arithmetic completely. Ellen knows how she is paid; ask her.',
    confidence: 'Unverified',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2026-10-15',
    notes:
      'Still aggregator data. The primary source remains live Colorado postings, which must disclose pay ranges, plus Ellen.',
  },
  {
    id: 'EV-040',
    category: '02-Payers',
    topic: 'Home health is only covered when outpatient care is not possible',
    claim:
      "Colorado's Medicaid home health rule (10 CCR 2505-10 § 8.520) covers home health only where the member's record shows the medically necessary service should be provided in the place of residence instead of an outpatient setting under stated guidelines — one of which is that the member, due to illness, injury or disability, is unable to travel to an outpatient setting for the needed service.",
    source: 'Code of Colorado Regulations — 10 CCR 2505-10 § 8.520 (via LII)',
    url: 'https://www.law.cornell.edu/regulations/colorado/10-CCR-2505-10-8.520',
    document: '10 CCR 2505-10-8.520 Home Health Services',
    publicationDate: null,
    effectiveDate: '2025-06-30',
    accessedDate: '2026-09-27',
    section: 'Criteria for home health services',
    appliesTo: ['Benefit design', 'Authorization workflow', 'Market size', 'Regulatory lane'],
    interpretation:
      "The home health lane is not simply 'therapy that happens at home'. Every PAR must justify why the child cannot be treated as an outpatient. Children with developmental delays who could attend a clinic may not qualify for the per-visit benefit at all, which would push them to the outpatient lane regardless of Blue Star's licence. This narrows the population lane A can serve and makes the justification a documentation skill in its own right.",
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'The search excerpt was truncated after the first guideline; the rule lists several. Read the full section before relying on it.',
  },
  {
    id: 'EV-041',
    category: '02-Payers',
    topic: 'How Early Intervention children are billed',
    claim:
      "HCPF publishes a separate Early Intervention billing manual. For a child with an IFSP, Health First Colorado must be billed first for PT/OT and state Early Intervention funds pay only for services Medicaid does not cover; outpatient PT/OT claims for IFSP services carry the IFSP referrer's NPI as the ordering provider. An HCPF-hosted rate document states that EI home visits run about an hour, allow only 4-5 visits a day, and that (for speech) an EI visit paid $62.46 against $131 for a home health visit.",
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/early-intervention-manual',
    document: 'Early Intervention Billing Manual; Outpatient PT/OT Billing Manual; EI speech rate memo',
    publicationDate: null,
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Payer of last resort; IFSP referrals',
    appliesTo: ['Visit mix', 'Revenue model', 'Referral strategy', 'Regulatory lane'],
    interpretation:
      "Which benefit an EI child is billed under depends on the PROVIDER's lane, not on the child. A Medicare-certified home health agency can bill an EI child's visit as a home health visit; a therapy practice bills it as outpatient PT/OT with the IFSP referral. So the model's assumption that every visit pays $143.02 is really an assumption that Blue Star is a certified home health agency. Ask Ellen how her employer bills the eleven EI children on her caseload.",
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: true,
    recheckDate: '2026-11-01',
    notes:
      'The $62.46 figure comes from an undated advocacy draft hosted on the HCPF site; treat it as historical context only, not a current rate.',
  },
  {
    id: 'EV-042',
    category: '08-HR',
    topic: 'Colorado unemployment insurance — new employer rate structure 2026',
    claim:
      'Colorado new employers pay an introductory unemployment insurance rate composed of a base rate, a support rate and (in 2026) a solvency surcharge, which applies because the 2025 trust fund reserve ratio (0.649%) was below the 0.7% trigger. 2026 combined rates for positive-rated employers range from 0.72% to 4.58%, charged on the first $30,600 of each employee\'s wages. The industry-specific introductory rate for health care was not surfaced.',
    source: 'Colorado Department of Labor and Employment (CDLE)',
    url: 'https://cdle.colorado.gov/employers/unemployment-insurance-premiums/introductory-rates',
    document: 'Introductory Rates; Premium Rates — CDLE Unemployment Insurance',
    publicationDate: null,
    effectiveDate: '2026-01-01',
    accessedDate: '2026-09-27',
    section: 'Introductory rates',
    appliesTo: ['Payroll', 'Fully loaded clinician cost'],
    interpretation:
      "Because the wage base is capped at $30,600, the whole SUTA line is bounded at roughly $220-$1,400 per employee per year even at the extremes. On a six-figure salary that moves loaded cost by about 1%, so AS-004's 11.5% burden estimate is not sensitive to the exact figure. What remains unverified here is small.",
    confidence: 'Reasonable estimate',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2026-12-15',
    notes: 'The FAMLI figures in EV-018 were cross-checked the same day against three payroll vendors and were consistent (0.88% total, 0.44% employee, employer share waived under 10 employees).',
  },
  {
    id: 'EV-043',
    category: '02-Payers',
    topic: 'Outpatient PT/OT per-unit rates — location known, figures NOT obtained',
    claim:
      'Outpatient PT/OT per-unit rates are published in the Health First Colorado Physician Fee Schedule (versions effective January 1, 2026 and April 1, 2026; only codes that were reduced appear on the April schedule) and in a searchable code lookup on the HCPF provider rates page. No per-unit dollar figure for CPT 97110, 97530, 97140 or the 97161-97163 evaluation codes was obtained in this pass.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/01_CO_Fee%20Schedule_Health%20First%20Colorado_04012026%20v1.0.pdf',
    document: 'Health First Colorado Physician Fee Schedule Rates Effective April 1, 2026',
    publicationDate: null,
    effectiveDate: '2026-04-01',
    accessedDate: '2026-09-27',
    section: 'CPT 97xxx therapy codes',
    appliesTo: ['Visit economics', 'Revenue model', 'Path comparison'],
    interpretation:
      'This is the number that decides whether the outpatient lane is a business or a hobby. Under it a 30-minute visit bills 2 units and a 60-minute visit 4, capped at 5 units a day (EV-009). Until it is read off the schedule, no revenue figure for lane B exists in this system, and AS-032 stays null. Do not guess it: Medicaid therapy per-unit rates vary by state by more than 2x.',
    confidence: 'Unknown',
    retrieval: 'not-accessed',
    requiresProfessionalVerification: false,
    recheckDate: '2026-10-15',
    notes:
      'Open the PDF or the lookup tool and record the rate per unit for 97110, 97530, 97140, 97161-97163 (PT evaluation), 97165-97167 (OT evaluation) and 92507 / 92523 (speech). Then compute revenue for a 30-minute and a 60-minute visit.',
  },
  {
    id: 'EV-044',
    category: '02-Payers',
    topic: 'Outpatient therapy rules — HCPF specialty training, READ DIRECTLY',
    claim:
      'HCPF Therapy (PT/OT/ST) Specialty Training dated 5/13/2026, read in full: outpatient therapy is covered in the office, hospital, home and other settings and is billed fee-for-service on the CMS-1500 / 837P to Gainwell. A PT enrolls individually as Provider Type 17, Specialty 451 (with SSN) and may affiliate with a group; the group must enroll first, as Provider Type 48 / Specialty 397 (Practitioner) or Provider Type 25 / Specialty 441, with its FEIN. Every episode needs an order from an enrolled physician, PA or NP; an approved IFSP counts as an order; services must start within 28 days; the plan of care may not exceed 90 days (or the IFSP period) and must be re-signed every 90 days. Limits: 5 units of PT and 5 of OT per day; 48 combined PT/OT units per rolling 12 months before a PAR (evaluations excluded); speech 12 sessions per rolling 12 months. Timed codes bill in 15-minute units under the 8-minute rule: 23-37 minutes = 2 units, 53-67 minutes = 4 units. Travel time, record-keeping and documentation time are explicitly not billable. Encounter notes must record start and stop times, total timed minutes and units billed. Modifiers: 96 habilitative, 97 rehabilitative, TL Early Intervention. A PT may supervise up to four individuals such as PTAs. Retroactive PARs are not allowed except for EI children aged 0-4 (30-day window). PARs for members under 21 are reviewed under EPSDT; ColoradoPAR (Acentra) is the vendor.',
    source: 'Colorado Department of Health Care Policy & Financing (HCPF)',
    url: 'https://hcpf.colorado.gov/ptot-manual',
    document: 'Therapy (Physical, Occupational, Speech) Specialty Training, 05/13/2026 (stored at docs/sources/PT_OT_ST_051326.pdf)',
    publicationDate: '2026-05-13',
    effectiveDate: null,
    accessedDate: '2026-09-27',
    section: 'Provider enrollment; benefit overview; PARs; billing and payment',
    appliesTo: ['Regulatory lane', 'Enrollment', 'Authorization workflow', 'Visit economics', 'Documentation', 'Staffing'],
    interpretation:
      "This is the operating manual for the lane that is actually open, read from the source. Four consequences. (1) A 30-minute non-EI visit is 2 units and a 60-minute EI visit is 4 units — the unit counts behind AS-032 are now confirmed; only the dollar rate per unit is missing. (2) The 48-unit allowance runs out in about 12 weeks for a weekly 60-minute patient and 24 weeks for a weekly 30-minute one, so PAR work starts within the first quarter for every child, and the plan of care needs a physician signature every 90 days regardless. (3) Documentation in this lane is heavier than Ellen's 5-minute home health note: timed minutes per code, start and stop times, SOAP elements — AS-007 may not transfer. (4) A PT may supervise up to four PTAs, a staffing lever the strategy paths do not consider at all.",
    confidence: 'Confirmed',
    retrieval: 'direct-read',
    requiresProfessionalVerification: false,
    recheckDate: '2027-05-01',
    notes:
      'The deck is training material, not the rule itself; the binding text is the PT/OT Billing Manual it points to. It also states that services provided to school-age children under an IEP are paid by the school district, not fee-for-service — a boundary on the referral base.',
  },
  {
    id: 'EV-045',
    category: '01-Regulatory',
    topic: 'C.R.S. 25-27.5-103 — licence requirement and penalties, READ DIRECTLY',
    claim:
      'C.R.S. 25-27.5-103 (2025 edition), read in full: since January 1, 2010 it is unlawful for any person, partnership, association or corporation to conduct or maintain a home care agency that provides skilled home health services without a CDPHE licence. Violation is a misdemeanor punishable by a $50-$500 fine, and the department may assess a civil penalty of up to $10,000 for each violation. Subsection (1.5) states that an entity which contracts or arranges with a service agency, and which itself meets the definition of a home care agency, is not relieved of its own duty to hold a licence. The section contains no exemptions; who counts as a "home care agency" is settled by the definitions in section 25-27.5-102.',
    source: 'Colorado Revised Statutes, 2025 (text supplied by Scott from Justia)',
    url: 'https://law.justia.com/codes/colorado/title-25/health-care/article-27-5/section-25-27-5-103/',
    document: 'C.R.S. 25-27.5-103 (stored at docs/sources/CRS_25-27.5-103_2025.txt)',
    publicationDate: null,
    effectiveDate: '2024-07-01',
    accessedDate: '2026-09-27',
    section: 'Subsections (1), (1.5), (3)',
    appliesTo: ['Regulatory lane', 'Compliance risk', 'Entity structure'],
    interpretation:
      "The cost of getting D-001 wrong is now concrete: a misdemeanor plus up to $10,000 per violation — and 'per violation' in a visit-based business could be read per visit. Subsection (1.5) is a direct warning against the 'we just contract with therapists' workaround: contracting does not remove the duty if the entity itself meets the definition. That moves the decisive question to section 102 — the definition of home care agency and its exclusion for an individual acting alone — which is the next document to read.",
    confidence: 'Confirmed',
    retrieval: 'direct-read',
    requiresProfessionalVerification: true,
    recheckDate: '2027-07-01',
    notes:
      'Subsection (3) is about licensed facilities extending services off-premises and does not apply to Blue Star. Still needs counsel: whether an LLC whose sole clinician is a member-owner is a "corporation" that "conducts a home care agency" once it bills for her services.',
  },
  {
    id: 'EV-046',
    category: '02-Payers',
    topic: 'Second rate cut — 2.0% across the board from July 1, 2026',
    claim:
      'Health First Colorado applied an across-the-board 2.0% provider rate reduction for dates of service on or after July 1, 2026, enacted through HB 26-1410 during the 2025-26 legislative session as part of balancing the FY2026-27 budget, and applied after all prior reductions.',
    source: 'HCPF Provider News; July 2026 Provider Bulletin (B2600540)',
    url: 'https://hcpf.colorado.gov/sites/hcpf/files/Bulletin%200726_B2600540.pdf',
    document: 'July 2026 Provider Bulletin; HCPF FY 2025-26 & 2026-27 Budget Reduction Fact Sheet',
    publicationDate: '2026-07-01',
    effectiveDate: '2026-07-01',
    accessedDate: '2026-09-27',
    section: 'Across-the-board rate reduction',
    appliesTo: ['Visit economics', 'Rate risk', 'Revenue model'],
    interpretation:
      'Second cut in nine months, and the arithmetic matches the directly read schedule exactly: $143.02 x 0.98 = $140.16 (EV-007). Together with EV-037 this is a pattern, not an event: Colorado has cut Medicaid provider rates twice in a year to balance its budget. Plan on flat-to-falling reimbursement and build the model to survive another 2-3%.',
    confidence: 'Strong evidence',
    retrieval: 'search-summary',
    requiresProfessionalVerification: false,
    recheckDate: '2027-01-15',
    notes: 'The bulletin itself was not opened; the rate schedule that results from it was.',
  },
];

export const evidenceById = new Map(evidence.map((e) => [e.id, e]));
