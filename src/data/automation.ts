import type { ProcessAudit } from '../types';

/**
 * The automation audit. The question is not "what can we automate?" but
 * "does a human actually need to do this?" — and, just as importantly, where
 * the answer is an unconditional yes.
 *
 * humanFloor records the part of a process that must stay human no matter how
 * good the tooling becomes. Where humanFloor is set, that boundary is not a
 * temporary limitation to engineer around.
 */
export const processes: ProcessAudit[] = [
  {
    id: 'P-001', process: 'Referral intake — receiving and logging referrals', area: 'Revenue cycle',
    classification: 'AUTOMATION',
    rationale: 'Structured capture into the EMR with automatic acknowledgement. No judgement required to record a referral.',
    humanFloor: null, estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Low',
    enablingTool: 'EMR intake forms', phase: 4,
  },
  {
    id: 'P-002', process: 'Extracting clinical data from referral documents', area: 'Revenue cycle',
    classification: 'HUMAN + AI',
    rationale: 'AI reads faxed and scanned referrals and drafts structured data; a human confirms before it enters the clinical record.',
    humanFloor: 'A human verifies clinical data before it becomes part of the record. An extraction error here propagates into care.',
    estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Moderate',
    enablingTool: 'Document AI with human review queue', phase: 4,
  },
  {
    id: 'P-003', process: 'Insurance eligibility verification', area: 'Revenue cycle',
    classification: 'AUTOMATION',
    rationale: 'The Provider Web Portal exposes eligibility directly. Checking it is a lookup, not a decision.',
    humanFloor: null, estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Low',
    enablingTool: 'Provider Web Portal / EMR eligibility check', phase: 3,
  },
  {
    id: 'P-004', process: 'Prior authorization (PAR) preparation', area: 'Revenue cycle',
    classification: 'HUMAN + AI',
    rationale:
      'AI assembles the packet and drafts the narrative from clinical documentation. The clinician owns the medical necessity argument, because it is a clinical assertion they are accountable for.',
    humanFloor: 'Medical necessity is a clinical judgement. AI drafts; the treating clinician asserts and signs.',
    estimatedHoursPerWeekSaved: 4, riskIfAutomated: 'High',
    enablingTool: 'AI drafting on top of EMR documentation', phase: 4,
  },
  {
    id: 'P-005', process: 'Scheduling and route optimisation', area: 'Operations',
    classification: 'AUTOMATION',
    rationale:
      'Under a flat per-visit rate, travel time is the main constraint on daily capacity. Route optimisation is one of the highest-return automations available to this business.',
    humanFloor: 'Clinician preferences, family constraints and continuity of therapist must override pure efficiency.',
    estimatedHoursPerWeekSaved: 5, riskIfAutomated: 'Low',
    enablingTool: 'Scheduling with routing', phase: 4,
  },
  {
    id: 'P-006', process: 'Appointment reminders', area: 'Patient communication',
    classification: 'AUTOMATION',
    rationale:
      'Automated reminders directly attack the cancellation rate — and with flat per-visit reimbursement, a prevented cancellation is pure recovered margin.',
    humanFloor: null, estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Low',
    enablingTool: 'EMR messaging', phase: 4,
  },
  {
    id: 'P-007', process: 'Clinical documentation — writing the note', area: 'Clinical',
    classification: 'HUMAN + AI',
    rationale:
      'AI assists with structure and drafting from clinician input. The clinical content, assessment and plan are the clinician\'s.',
    humanFloor:
      'The note is a legal and clinical record of professional judgement. AI may help express it; it may not originate the assessment.',
    estimatedHoursPerWeekSaved: 5, riskIfAutomated: 'High',
    enablingTool: 'EMR with AI documentation assist', phase: 5,
  },
  {
    id: 'P-008', process: 'Clinical judgement, evaluation, plan of care', area: 'Clinical',
    classification: 'HUMAN',
    rationale: 'This is the product. It is what the family is paying for and what the licence attests to.',
    humanFloor: 'Absolute. No AI involvement in forming clinical judgement.',
    estimatedHoursPerWeekSaved: null, riskIfAutomated: 'Unacceptable',
    enablingTool: null, phase: 5,
  },
  {
    id: 'P-009', process: 'Claim generation and submission', area: 'Revenue cycle',
    classification: 'AUTOMATION',
    rationale: 'Documentation plus authorisation plus fee schedule determines the claim. Rules, not judgement.',
    humanFloor: null, estimatedHoursPerWeekSaved: 4, riskIfAutomated: 'Low',
    enablingTool: 'EMR billing module', phase: 4,
  },
  {
    id: 'P-010', process: 'Pre-submission claim scrubbing', area: 'Revenue cycle',
    classification: 'AI',
    rationale:
      'AI checks claims against authorisation status, documentation completeness and coding rules before submission. Catching an error pre-submission is worth many times the cost of appealing it later.',
    humanFloor: null, estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Low',
    enablingTool: 'Claim scrubbing rules plus AI review', phase: 4,
  },
  {
    id: 'P-011', process: 'Denial detection and root-cause analysis', area: 'Revenue cycle',
    classification: 'AI',
    rationale:
      'AI spots denial patterns far faster than a human reading remittances one at a time. Pattern recognition across claims is exactly what this technology is good at.',
    humanFloor: 'A human decides what to change in response.',
    estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Low',
    enablingTool: 'Analytics over remittance data', phase: 6,
  },
  {
    id: 'P-012', process: 'Appeals — writing the argument', area: 'Revenue cycle',
    classification: 'HUMAN + AI',
    rationale: 'AI drafts from the record; a clinician confirms the clinical argument is accurate and defensible.',
    humanFloor: 'Any clinical assertion in an appeal must be verified by the clinician who can stand behind it.',
    estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'High',
    enablingTool: 'AI drafting', phase: 6,
  },
  {
    id: 'P-013', process: 'Credentialing and licence expiry tracking', area: 'Compliance',
    classification: 'AUTOMATION',
    rationale: 'Dates and reminders. A lapsed licence is a serious compliance event caused by a purely clerical failure.',
    humanFloor: null, estimatedHoursPerWeekSaved: 1, riskIfAutomated: 'Low',
    enablingTool: 'HR system or a tracked calendar', phase: 4,
  },
  {
    id: 'P-014', process: 'Recruiting — sourcing and initial screening', area: 'HR',
    classification: 'HUMAN + AI',
    rationale: 'AI drafts postings and organises applicants; humans evaluate clinical fit.',
    humanFloor:
      'Hiring decisions stay human. In a business whose product is the clinician, hiring IS the quality control.',
    estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Moderate',
    enablingTool: 'Applicant tracking plus AI drafting', phase: 7,
  },
  {
    id: 'P-015', process: 'Onboarding paperwork and training assignment', area: 'HR',
    classification: 'AUTOMATION',
    rationale: 'Checklists, forms and e-signature. Nothing here requires a person.',
    humanFloor: 'Welcoming a new clinician is a relationship, not a workflow. Automate the paperwork, not the welcome.',
    estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Low',
    enablingTool: 'HR platform with e-signature', phase: 7,
  },
  {
    id: 'P-016', process: 'SOP creation and maintenance', area: 'Operations',
    classification: 'HUMAN + AI',
    rationale: 'AI drafts and keeps procedures current from how work is actually done; a human owns accuracy.',
    humanFloor: 'Someone must be accountable for each procedure being correct.',
    estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Moderate',
    enablingTool: 'AI drafting over a document repository', phase: 4,
  },
  {
    id: 'P-017', process: 'Parent communication — clinical questions and concerns', area: 'Patient communication',
    classification: 'HUMAN',
    rationale:
      'This is a trust relationship with a parent about their child. Automating it would damage the thing that makes a small practice worth choosing.',
    humanFloor: 'Absolute for anything clinical or sensitive. Scheduling logistics may be automated; concerns may not.',
    estimatedHoursPerWeekSaved: null, riskIfAutomated: 'Unacceptable',
    enablingTool: null, phase: 5,
  },
  {
    id: 'P-018', process: 'Referral-source relationship management', area: 'Growth',
    classification: 'HUMAN',
    rationale:
      'Referrals follow trust between people. This is the most durable asset the company can build and it cannot be delegated to software.',
    humanFloor: 'Absolute. AI may track and remind; the relationship is Scott\'s or a clinical leader\'s.',
    estimatedHoursPerWeekSaved: null, riskIfAutomated: 'Unacceptable',
    enablingTool: 'CRM for tracking only', phase: 6,
  },
  {
    id: 'P-019', process: 'Financial reporting and dashboards', area: 'Finance',
    classification: 'AUTOMATION',
    rationale: 'Reports generate themselves from accounting and billing data.',
    humanFloor: 'Interpreting the numbers and deciding what to do is the owner\'s job.',
    estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Low',
    enablingTool: 'Accounting software reporting', phase: 6,
  },
  {
    id: 'P-020', process: 'Compliance monitoring — documentation completeness', area: 'Compliance',
    classification: 'AI',
    rationale: 'AI audits documentation against requirements continuously instead of discovering gaps during a survey.',
    humanFloor: 'Remediation and any regulator communication stay human.',
    estimatedHoursPerWeekSaved: 3, riskIfAutomated: 'Low',
    enablingTool: 'AI review over EMR records', phase: 6,
  },
  {
    id: 'P-021', process: 'Weekly internal status meeting', area: 'Operations',
    classification: 'ELIMINATE',
    rationale:
      'At launch scale, a recurring status meeting consumes clinician time that could be billable or spent at home. Status belongs in a dashboard; meetings should exist for decisions and for genuine human connection, not for reporting.',
    humanFloor: 'Keep deliberate team connection. Eliminate status reporting theatre, not the team.',
    estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'None',
    enablingTool: 'Async dashboard', phase: 5,
  },
  {
    id: 'P-022', process: 'Manual timesheet and mileage collection', area: 'Operations',
    classification: 'ELIMINATE',
    rationale:
      'Visit data already exists in the EMR with times and addresses. Asking clinicians to re-enter it is duplicate work that also produces worse data.',
    humanFloor: null, estimatedHoursPerWeekSaved: 2, riskIfAutomated: 'Low',
    enablingTool: 'Derive from EMR visit records', phase: 5,
  },
];
