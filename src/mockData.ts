import type {
  AuditPlan,
  AuditPlanAssignment,
  AuditPlanEntity,
  AuditRiskRegisterEntry,
  AuditUniverseEntity,
  Control,
  CorrectiveAction,
  Engagement,
  EntityRiskMap,
  ExceptionRecord,
  Finding,
  Framework,
  OrgUnit,
  RcmEntry,
  Report,
  Risk,
  Role,
  Sample,
  TestProcedure,
  TestResult,
  User,
} from './types'

export const roles: Role[] = [
  { role_id: 'role-auditor', name: 'auditor', description: 'Executes fieldwork, drafts RCM/findings' },
  { role_id: 'role-audit-manager', name: 'audit_manager', description: 'CAE — approves plans, findings, issues reports' },
  { role_id: 'role-control-owner', name: 'control_owner', description: 'Owns remediation of corrective actions' },
  { role_id: 'role-risk-owner', name: 'risk_owner', description: 'Owns risk entries in ERM' },
  { role_id: 'role-audit-committee', name: 'audit_committee', description: 'Ratifies plans, receives issued reports' },
  { role_id: 'role-admin', name: 'admin', description: 'System administration' },
]

export const orgUnits: OrgUnit[] = [
  { org_unit_id: 'ou-finance', name: 'Finance Operations', parent_org_unit_id: null, business_owner_id: 'user-noura' },
  { org_unit_id: 'ou-it', name: 'IT & Cybersecurity', parent_org_unit_id: null, business_owner_id: 'user-fahad' },
  { org_unit_id: 'ou-hr', name: 'HR & Payroll', parent_org_unit_id: null, business_owner_id: 'user-maha' },
  { org_unit_id: 'ou-procurement', name: 'Procurement', parent_org_unit_id: null, business_owner_id: 'user-noura' },
  { org_unit_id: 'ou-retail', name: 'Retail Operations', parent_org_unit_id: null, business_owner_id: 'user-fahad' },
]

export const users: User[] = [
  { user_id: 'user-sara', name: 'Sara Al-Otaibi', email: 'sara.alotaibi@sahl.io', role_id: 'role-auditor', org_unit_id: null, is_active: true },
  { user_id: 'user-omar', name: 'Omar Al-Qahtani', email: 'omar.alqahtani@sahl.io', role_id: 'role-auditor', org_unit_id: null, is_active: true },
  { user_id: 'user-yousef', name: 'Yousef Al-Harbi', email: 'yousef.alharbi@sahl.io', role_id: 'role-audit-manager', org_unit_id: null, is_active: true },
  { user_id: 'user-fahad', name: 'Fahad Al-Dosari', email: 'fahad.aldosari@sahl.io', role_id: 'role-control-owner', org_unit_id: 'ou-it', is_active: true },
  { user_id: 'user-noura', name: 'Noura Al-Shammari', email: 'noura.alshammari@sahl.io', role_id: 'role-risk-owner', org_unit_id: 'ou-finance', is_active: true },
  { user_id: 'user-maha', name: 'Maha Al-Zahrani', email: 'maha.alzahrani@sahl.io', role_id: 'role-control-owner', org_unit_id: 'ou-hr', is_active: true },
  { user_id: 'user-layla', name: 'Layla Al-Ghamdi', email: 'layla.alghamdi@sahl.io', role_id: 'role-audit-committee', org_unit_id: null, is_active: true },
  { user_id: 'user-admin', name: 'Ayesha Mansha', email: 'ayesha@getsahl.io', role_id: 'role-admin', org_unit_id: null, is_active: true },
]

export const frameworks: Framework[] = [
  { framework_id: 'fw-iso27001', name: 'ISO 27001:2022', description: 'Information security management' },
  { framework_id: 'fw-pdpl', name: 'KSA PDPL', description: 'Saudi Personal Data Protection Law' },
  { framework_id: 'fw-finance', name: 'Internal Finance Policy', description: 'Internal financial control policy' },
]

export const risks: Risk[] = [
  { risk_id: 'risk-access-mgmt', org_unit_id: 'ou-it', framework_id: 'fw-iso27001', category: 'cyber', description: 'Inadequate user access review for privileged accounts', inherent_likelihood: 4, inherent_impact: 5, residual_likelihood: 3, residual_impact: 5, status: 'open', owner_id: 'user-fahad' },
  { risk_id: 'risk-data-privacy', org_unit_id: 'ou-hr', framework_id: 'fw-pdpl', category: 'compliance', description: 'Employee PII retained beyond policy without a documented basis', inherent_likelihood: 3, inherent_impact: 4, residual_likelihood: 2, residual_impact: 4, status: 'open', owner_id: 'user-maha' },
  { risk_id: 'risk-payment-approval', org_unit_id: 'ou-finance', framework_id: 'fw-finance', category: 'financial', description: 'Vendor payments processed without dual approval above threshold', inherent_likelihood: 3, inherent_impact: 5, residual_likelihood: 2, residual_impact: 5, status: 'open', owner_id: 'user-noura' },
  { risk_id: 'risk-vendor-onboarding', org_unit_id: 'ou-procurement', framework_id: 'fw-finance', category: 'operational', description: 'New vendors onboarded without completed due-diligence checklist', inherent_likelihood: 3, inherent_impact: 3, residual_likelihood: 2, residual_impact: 3, status: 'mitigated', owner_id: 'user-noura' },
  { risk_id: 'risk-pos-reconciliation', org_unit_id: 'ou-retail', framework_id: null, category: 'operational', description: 'Daily point-of-sale reconciliation not consistently performed at store level', inherent_likelihood: 4, inherent_impact: 3, residual_likelihood: 3, residual_impact: 3, status: 'open', owner_id: 'user-fahad' },
  { risk_id: 'risk-change-mgmt', org_unit_id: 'ou-it', framework_id: 'fw-iso27001', category: 'cyber', description: 'Production changes deployed without documented change approval', inherent_likelihood: 3, inherent_impact: 4, residual_likelihood: 2, residual_impact: 4, status: 'open', owner_id: 'user-fahad' },
]

export const controls: Control[] = [
  { control_id: 'ctrl-access-review', description: 'Quarterly access recertification for privileged accounts', control_type: 'detective', automation_level: 'manual', frequency: 'quarterly', effectiveness_rating: 'partially_effective', owner_id: 'user-fahad', risk_ids: ['risk-access-mgmt'] },
  { control_id: 'ctrl-retention-policy', description: 'Automated purge of HR records past retention period', control_type: 'preventive', automation_level: 'automated', frequency: 'continuous', effectiveness_rating: 'not_tested', owner_id: 'user-maha', risk_ids: ['risk-data-privacy'] },
  { control_id: 'ctrl-dual-approval', description: 'System-enforced dual approval for payments above SAR 50,000', control_type: 'preventive', automation_level: 'automated', frequency: 'continuous', effectiveness_rating: 'effective', owner_id: 'user-noura', risk_ids: ['risk-payment-approval'] },
  { control_id: 'ctrl-vendor-checklist', description: 'Due-diligence checklist required before vendor activation', control_type: 'preventive', automation_level: 'manual', frequency: 'continuous', effectiveness_rating: 'effective', owner_id: 'user-noura', risk_ids: ['risk-vendor-onboarding'] },
  { control_id: 'ctrl-pos-recon', description: 'Store manager daily POS-to-bank reconciliation', control_type: 'detective', automation_level: 'manual', frequency: 'daily', effectiveness_rating: 'ineffective', owner_id: 'user-fahad', risk_ids: ['risk-pos-reconciliation'] },
  { control_id: 'ctrl-change-approval', description: 'Change advisory board sign-off required before production deploy', control_type: 'preventive', automation_level: 'manual', frequency: 'continuous', effectiveness_rating: 'partially_effective', owner_id: 'user-fahad', risk_ids: ['risk-change-mgmt'] },
]

export const testProcedures: TestProcedure[] = [
  { procedure_id: 'proc-access-recert', control_type: 'detective', description: 'Inspect quarterly access recertification evidence', steps: 'Pull the latest recertification sign-off; trace a sample of privileged accounts to an approved reviewer and date.', is_template: true },
  { procedure_id: 'proc-payment-dual-approval', control_type: 'preventive', description: 'Test system enforcement of dual approval threshold', steps: 'Select a sample of payments above SAR 50,000; confirm two distinct approvers are recorded in the payment log.', is_template: true },
  { procedure_id: 'proc-pos-recon', control_type: 'detective', description: 'Test daily POS reconciliation performance', steps: 'Select a sample of store-days; confirm a reconciliation record exists and variances were investigated.', is_template: true },
]

export const auditUniverseEntities: AuditUniverseEntity[] = [
  { entity_id: 'entity-it-access', org_unit_id: 'ou-it', name: 'IT Access & Identity Management', description: 'Provisioning, review, and deprovisioning of user access across core systems.', current_risk_score: 20, last_audit_date: '2025-02-10', audit_cycle_months: 12, status: 'confirmed', confirmed_by: 'user-yousef', confirmed_at: '2026-01-12T09:00:00Z', created_at: '2026-01-05T09:00:00Z' },
  { entity_id: 'entity-finance-payments', org_unit_id: 'ou-finance', name: 'Vendor Payments Processing', description: 'End-to-end vendor payment cycle from invoice receipt to disbursement.', current_risk_score: 10, last_audit_date: '2024-11-02', audit_cycle_months: 12, status: 'confirmed', confirmed_by: 'user-yousef', confirmed_at: '2026-01-12T09:05:00Z', created_at: '2026-01-05T09:05:00Z' },
  { entity_id: 'entity-retail-pos', org_unit_id: 'ou-retail', name: 'Retail Point-of-Sale Operations', description: 'Store-level cash handling, POS transactions, and daily reconciliation.', current_risk_score: 12, last_audit_date: null, audit_cycle_months: 12, status: 'confirmed', confirmed_by: 'user-yousef', confirmed_at: '2026-01-12T09:10:00Z', created_at: '2026-01-05T09:10:00Z' },
  { entity_id: 'entity-hr-data', org_unit_id: 'ou-hr', name: 'HR Data & Records Management', description: 'Employee personal data lifecycle: collection, storage, retention, and disposal.', current_risk_score: 8, last_audit_date: '2023-06-15', audit_cycle_months: 18, status: 'confirmed', confirmed_by: 'user-yousef', confirmed_at: '2026-01-12T09:15:00Z', created_at: '2026-01-05T09:15:00Z' },
  { entity_id: 'entity-it-change', org_unit_id: 'ou-it', name: 'IT Change Management', description: 'Change request, approval, testing, and deployment process for production systems.', current_risk_score: null, last_audit_date: null, audit_cycle_months: 12, status: 'draft', confirmed_by: null, confirmed_at: null, created_at: '2026-08-01T10:00:00Z' },
  { entity_id: 'entity-procurement-vendor', org_unit_id: 'ou-procurement', name: 'Vendor Onboarding & Due Diligence', description: 'New vendor evaluation, approval, and master-file setup.', current_risk_score: null, last_audit_date: '2025-09-20', audit_cycle_months: 12, status: 'draft', confirmed_by: null, confirmed_at: null, created_at: '2026-08-05T10:00:00Z' },
]

export const entityRiskMap: EntityRiskMap[] = [
  { id: 'erm-1', entity_id: 'entity-it-access', risk_id: 'risk-access-mgmt', match_type: 'direct', match_confidence: null, needs_manual_review: false, confirmed_by: 'user-sara', confirmed_at: '2026-01-13T09:00:00Z' },
  { id: 'erm-2', entity_id: 'entity-finance-payments', risk_id: 'risk-payment-approval', match_type: 'direct', match_confidence: null, needs_manual_review: false, confirmed_by: 'user-sara', confirmed_at: '2026-01-13T09:05:00Z' },
  { id: 'erm-3', entity_id: 'entity-retail-pos', risk_id: 'risk-pos-reconciliation', match_type: 'direct', match_confidence: null, needs_manual_review: false, confirmed_by: 'user-omar', confirmed_at: '2026-01-13T09:10:00Z' },
  { id: 'erm-4', entity_id: 'entity-hr-data', risk_id: 'risk-data-privacy', match_type: 'direct', match_confidence: null, needs_manual_review: false, confirmed_by: 'user-omar', confirmed_at: '2026-01-13T09:15:00Z' },
]

export const auditRiskRegister: AuditRiskRegisterEntry[] = [
  { id: 'arr-1', entity_id: 'entity-it-access', erm_residual_score: 15, control_effectiveness_avg: 2.5, prior_findings_count: 2, months_since_last_audit: 18, adjusted_score: 5, adjustment_rationale: 'Privileged access is a recurring finding area and a board-level concern following the Q3 phishing incident; scoring at maximum despite moderate ERM residual score.', adjusted_by: 'user-sara', adjusted_at: '2026-01-14T10:00:00Z' },
  { id: 'arr-2', entity_id: 'entity-finance-payments', erm_residual_score: 10, control_effectiveness_avg: 4.0, prior_findings_count: 0, months_since_last_audit: 27, adjusted_score: 3, adjustment_rationale: 'Control is system-enforced and rated effective, but time since last audit exceeds two years — moderate score to ensure coverage.', adjusted_by: 'user-sara', adjusted_at: '2026-01-14T10:10:00Z' },
  { id: 'arr-3', entity_id: 'entity-retail-pos', erm_residual_score: 9, control_effectiveness_avg: 1.5, prior_findings_count: 3, months_since_last_audit: null, adjusted_score: 4, adjustment_rationale: 'Never audited, and the underlying control is rated ineffective with a history of prior findings in adjacent stores.', adjusted_by: 'user-omar', adjusted_at: '2026-01-14T10:20:00Z' },
  { id: 'arr-4', entity_id: 'entity-hr-data', erm_residual_score: 8, control_effectiveness_avg: null, prior_findings_count: 0, months_since_last_audit: 38, adjusted_score: null, adjustment_rationale: null, adjusted_by: null, adjusted_at: null },
]

export const auditPlans: AuditPlan[] = [
  { plan_id: 'plan-2026-h1', period: '2026-H1', status: 'approved', created_by: 'user-yousef', approved_by: 'user-yousef', approved_at: '2026-01-20T12:00:00Z', committee_ratified_at: '2026-01-25T09:00:00Z', created_at: '2026-01-15T09:00:00Z' },
  { plan_id: 'plan-2026-h2', period: '2026-H2', status: 'draft', created_by: 'user-yousef', approved_by: null, approved_at: null, committee_ratified_at: null, created_at: '2026-08-10T09:00:00Z' },
]

export const auditPlanEntities: AuditPlanEntity[] = [
  { id: 'pe-1', plan_id: 'plan-2026-h1', entity_id: 'entity-it-access', estimated_hours: 160, flag_type: 'fatigue' },
  { id: 'pe-2', plan_id: 'plan-2026-h1', entity_id: 'entity-retail-pos', estimated_hours: 120, flag_type: 'gap' },
  { id: 'pe-3', plan_id: 'plan-2026-h1', entity_id: 'entity-finance-payments', estimated_hours: 100, flag_type: 'none' },
  { id: 'pe-4', plan_id: 'plan-2026-h2', entity_id: 'entity-hr-data', estimated_hours: 90, flag_type: 'gap' },
]

export const auditPlanAssignments: AuditPlanAssignment[] = [
  { id: 'asn-1', plan_entity_id: 'pe-1', auditor_id: 'user-sara', role_on_engagement: 'lead' },
  { id: 'asn-2', plan_entity_id: 'pe-1', auditor_id: 'user-omar', role_on_engagement: 'team_member' },
  { id: 'asn-3', plan_entity_id: 'pe-2', auditor_id: 'user-omar', role_on_engagement: 'lead' },
  { id: 'asn-4', plan_entity_id: 'pe-3', auditor_id: 'user-sara', role_on_engagement: 'lead' },
]

export const engagements: Engagement[] = [
  { engagement_id: 'eng-it-access', plan_entity_id: 'pe-1', entity_id: 'entity-it-access', status: 'fieldwork', scope_text: 'Review of privileged access provisioning, quarterly recertification, and deprovisioning for core financial and IT systems, covering Q3–Q4 2025.', start_date: '2026-02-02', end_date: null, lead_auditor_id: 'user-sara', created_at: '2026-01-21T09:00:00Z' },
  { engagement_id: 'eng-retail-pos', plan_entity_id: 'pe-2', entity_id: 'entity-retail-pos', status: 'closed', scope_text: 'Review of daily POS reconciliation practices across a sample of 12 retail stores for FY2025.', start_date: '2026-02-10', end_date: '2026-03-05', lead_auditor_id: 'user-omar', created_at: '2026-01-21T09:10:00Z' },
]

export const rcmEntries: RcmEntry[] = [
  { rcm_id: 'rcm-1', engagement_id: 'eng-it-access', risk_id: 'risk-access-mgmt', control_id: 'ctrl-access-review', test_procedure_id: 'proc-access-recert', test_procedure_draft: null, expected_evidence: 'Signed quarterly recertification report; access-list export by system.', reviewed_by: 'user-sara', reviewed_at: '2026-02-03T09:00:00Z', created_at: '2026-02-02T09:00:00Z' },
  { rcm_id: 'rcm-2', engagement_id: 'eng-retail-pos', risk_id: 'risk-pos-reconciliation', control_id: 'ctrl-pos-recon', test_procedure_id: 'proc-pos-recon', test_procedure_draft: null, expected_evidence: 'Daily reconciliation log and variance-investigation notes per store.', reviewed_by: 'user-omar', reviewed_at: '2026-02-11T09:00:00Z', created_at: '2026-02-10T09:00:00Z' },
]

export const samples: Sample[] = [
  { sample_id: 'sample-1', rcm_id: 'rcm-1', population_size: 84, sample_method: 'risk_weighted', sample_refs: ['ACC-0231', 'ACC-0417', 'ACC-0552', 'ACC-0688', 'ACC-0710'] },
  { sample_id: 'sample-2', rcm_id: 'rcm-2', population_size: 12, sample_method: 'attribute', sample_refs: ['STORE-04', 'STORE-07', 'STORE-11'] },
]

export const testResults: TestResult[] = [
  { result_id: 'tr-1', rcm_id: 'rcm-1', sample_ref: 'ACC-0231', evidence_ref: 'evidence/acc-0231-recert.pdf', result: 'pass', automated: false, tested_by: 'user-sara', tested_at: '2026-02-15T10:00:00Z' },
  { result_id: 'tr-2', rcm_id: 'rcm-1', sample_ref: 'ACC-0417', evidence_ref: 'evidence/acc-0417-recert.pdf', result: 'exception', automated: false, tested_by: 'user-sara', tested_at: '2026-02-15T10:15:00Z' },
  { result_id: 'tr-3', rcm_id: 'rcm-1', sample_ref: 'ACC-0552', evidence_ref: 'evidence/acc-0552-recert.pdf', result: 'pass', automated: false, tested_by: 'user-sara', tested_at: '2026-02-15T10:30:00Z' },
  { result_id: 'tr-4', rcm_id: 'rcm-2', sample_ref: 'STORE-04', evidence_ref: 'evidence/store-04-recon.xlsx', result: 'fail', automated: false, tested_by: 'user-omar', tested_at: '2026-02-18T11:00:00Z' },
  { result_id: 'tr-5', rcm_id: 'rcm-2', sample_ref: 'STORE-07', evidence_ref: 'evidence/store-07-recon.xlsx', result: 'pass', automated: false, tested_by: 'user-omar', tested_at: '2026-02-18T11:15:00Z' },
]

export const exceptions: ExceptionRecord[] = [
  { exception_id: 'exc-1', test_result_id: 'tr-2', description: 'Account ACC-0417 (privileged, Finance ERP admin) was not included in the Q3 2025 recertification sign-off; access remained active with no reviewer attestation on file.', severity: 'high', root_cause: 'Recertification process relies on a manually maintained spreadsheet of in-scope accounts, which was not updated when the account role changed to privileged mid-quarter.', status: 'validated', validated_by: 'user-sara', validated_at: '2026-02-16T09:00:00Z', created_at: '2026-02-15T10:16:00Z' },
  { exception_id: 'exc-2', test_result_id: 'tr-4', description: 'Store STORE-04 has no reconciliation record for 6 of 30 sampled days in the period, with no variance investigation on file for those dates.', severity: null, root_cause: null, status: 'pending_review', validated_by: null, validated_at: null, created_at: '2026-02-18T11:01:00Z' },
]

export const findings: Finding[] = [
  {
    finding_id: 'finding-access-recert',
    engagement_id: 'eng-it-access',
    risk_id: 'risk-access-mgmt',
    control_id: 'ctrl-access-review',
    exception_id: 'exc-1',
    condition_text: 'A privileged Finance ERP admin account (ACC-0417) was excluded from the Q3 2025 quarterly access recertification and remained active without reviewer attestation.',
    criteria_text: 'Per the Access Recertification Policy, all privileged accounts must be reviewed and attested by the designated approver each quarter.',
    cause_text: 'The recertification scope list is maintained manually and was not updated when the account was elevated to privileged status mid-quarter.',
    effect_text: 'Unreviewed privileged access increases the risk of undetected unauthorized or excessive access to the Finance ERP for an extended period.',
    recommendation_text: 'Automate the privileged-account scope list from the IAM system of record so recertification scope updates in real time as roles change.',
    severity: 'high',
    status: 'approved',
    owner_auditor_id: 'user-sara',
    created_at: '2026-02-17T09:00:00Z',
    approved_at: '2026-02-20T09:00:00Z',
  },
  {
    finding_id: 'finding-pos-recon',
    engagement_id: 'eng-retail-pos',
    risk_id: 'risk-pos-reconciliation',
    control_id: 'ctrl-pos-recon',
    exception_id: null,
    condition_text: 'Store STORE-04 did not perform daily POS reconciliation on 6 of 30 sampled days, with no evidence of variance investigation.',
    criteria_text: 'Per the Retail Cash Handling Standard, store managers must complete and document a POS-to-bank reconciliation every business day.',
    cause_text: 'Store manager coverage gap during staff leave with no designated backup reconciler.',
    effect_text: 'Unreconciled days increase the risk that cash discrepancies go undetected and uncorrected.',
    recommendation_text: 'Require a designated backup reconciler at each store and add a system alert for any store-day missing a reconciliation record after 24 hours.',
    severity: 'medium',
    status: 'approved',
    owner_auditor_id: 'user-omar',
    created_at: '2026-02-22T09:00:00Z',
    approved_at: '2026-02-25T09:00:00Z',
  },
]

export const correctiveActions: CorrectiveAction[] = [
  { action_id: 'ca-erm-1', risk_id: 'risk-vendor-onboarding', control_id: 'ctrl-vendor-checklist', source: 'erm', origin_finding_id: null, description: 'Roll out the updated due-diligence checklist template to all procurement staff.', owner_id: 'user-noura', due_date: '2026-09-30', status: 'in_progress', evidence_ref: null, closure_validated_by: null, closure_validated_at: null, created_at: '2026-06-01T09:00:00Z', updated_at: '2026-08-10T09:00:00Z' },
  { action_id: 'ca-audit-1', risk_id: 'risk-access-mgmt', control_id: 'ctrl-access-review', source: 'audit', origin_finding_id: 'finding-access-recert', description: 'Integrate the IAM system of record with the recertification scope list so privileged-role changes update the review population automatically.', owner_id: 'user-fahad', due_date: '2026-04-15', status: 'in_progress', evidence_ref: null, closure_validated_by: null, closure_validated_at: null, created_at: '2026-02-20T09:05:00Z', updated_at: '2026-08-01T09:00:00Z' },
  { action_id: 'ca-audit-2', risk_id: 'risk-pos-reconciliation', control_id: 'ctrl-pos-recon', source: 'audit', origin_finding_id: 'finding-pos-recon', description: 'Assign a designated backup reconciler at every store and configure a 24-hour missing-reconciliation alert.', owner_id: 'user-fahad', due_date: '2026-03-31', status: 'complete', evidence_ref: 'evidence/backup-reconciler-rollout.pdf', closure_validated_by: null, closure_validated_at: null, created_at: '2026-02-25T09:05:00Z', updated_at: '2026-03-20T09:00:00Z' },
]

export const reports: Report[] = [
  {
    report_id: 'report-retail-pos',
    engagement_id: 'eng-retail-pos',
    executive_summary: 'This engagement reviewed daily point-of-sale reconciliation practices across a 3-store sample. One medium-severity finding was identified relating to inconsistent reconciliation during staff absences; remediation is complete pending closure validation.',
    scope_text: 'Review of daily POS reconciliation practices across a sample of 12 retail stores for FY2025.',
    findings_summary: 'Medium: 1 (POS reconciliation gaps at STORE-04). No high or critical findings identified.',
    remediation_status_summary: 'The single finding\'s corrective action is marked complete with evidence attached and is pending auditor closure validation.',
    overall_opinion: 'Controls over retail POS reconciliation are partially effective. A moderate gap in reconciliation consistency was identified and is being remediated; no indication of undetected cash loss was found in the sample tested.',
    status: 'issued',
    issued_by: 'user-yousef',
    issue_date: '2026-03-10',
    finding_ids: ['finding-pos-recon'],
  },
  {
    report_id: 'report-it-access',
    engagement_id: 'eng-it-access',
    executive_summary: '',
    scope_text: 'Review of privileged access provisioning, quarterly recertification, and deprovisioning for core financial and IT systems, covering Q3–Q4 2025.',
    findings_summary: '',
    remediation_status_summary: '',
    overall_opinion: null,
    status: 'draft',
    issued_by: null,
    issue_date: null,
    finding_ids: ['finding-access-recert'],
  },
]
