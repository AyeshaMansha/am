// Domain types mirror Sahl_Database_Schema.sql — field names match the
// schema/API contracts 1:1 so the mock layer traces directly back to the spec.

export type RoleName =
  | 'auditor'
  | 'audit_manager'
  | 'control_owner'
  | 'risk_owner'
  | 'audit_committee'
  | 'admin'

export interface Role {
  role_id: string
  name: RoleName
  description: string
}

export interface User {
  user_id: string
  name: string
  email: string
  role_id: string
  org_unit_id: string | null
  is_active: boolean
}

export interface OrgUnit {
  org_unit_id: string
  name: string
  parent_org_unit_id: string | null
  business_owner_id: string | null
}

export interface Framework {
  framework_id: string
  name: string
  description: string
}

export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'closed'

export interface Risk {
  risk_id: string
  org_unit_id: string
  framework_id: string | null
  category: string
  description: string
  inherent_likelihood: number
  inherent_impact: number
  residual_likelihood: number | null
  residual_impact: number | null
  status: RiskStatus
  owner_id: string
}

export type ControlType = 'preventive' | 'detective'
export type AutomationLevel = 'automated' | 'manual'
export type EffectivenessRating =
  | 'effective'
  | 'partially_effective'
  | 'ineffective'
  | 'not_tested'

export interface Control {
  control_id: string
  description: string
  control_type: ControlType
  automation_level: AutomationLevel
  frequency: string
  effectiveness_rating: EffectivenessRating | null
  owner_id: string
  risk_ids: string[]
}

export type CorrectiveActionSource = 'erm' | 'audit'
export type CorrectiveActionStatus =
  | 'open'
  | 'in_progress'
  | 'overdue'
  | 'complete'
  | 'closed'

export interface CorrectiveAction {
  action_id: string
  risk_id: string | null
  control_id: string | null
  source: CorrectiveActionSource
  origin_finding_id: string | null
  description: string
  owner_id: string
  due_date: string
  status: CorrectiveActionStatus
  evidence_ref: string | null
  closure_validated_by: string | null
  closure_validated_at: string | null
  created_at: string
  updated_at: string
}

export type EntityStatus = 'draft' | 'confirmed' | 'archived'

export interface AuditUniverseEntity {
  entity_id: string
  org_unit_id: string
  name: string
  description: string
  current_risk_score: number | null
  last_audit_date: string | null
  audit_cycle_months: number
  status: EntityStatus
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

export interface EntityRiskMap {
  id: string
  entity_id: string
  risk_id: string
  match_type: 'direct' | 'fuzzy_ai'
  match_confidence: number | null
  needs_manual_review: boolean
  confirmed_by: string | null
  confirmed_at: string | null
}

export interface AuditRiskRegisterEntry {
  id: string
  entity_id: string
  erm_residual_score: number
  control_effectiveness_avg: number | null
  prior_findings_count: number
  months_since_last_audit: number | null
  adjusted_score: number | null
  adjustment_rationale: string | null
  adjusted_by: string | null
  adjusted_at: string | null
}

export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'

export interface AuditPlan {
  plan_id: string
  period: string
  status: PlanStatus
  created_by: string
  approved_by: string | null
  approved_at: string | null
  committee_ratified_at: string | null
  created_at: string
}

export type FlagType = 'none' | 'gap' | 'fatigue'

export interface AuditPlanEntity {
  id: string
  plan_id: string
  entity_id: string
  estimated_hours: number | null
  flag_type: FlagType
}

export interface AuditPlanAssignment {
  id: string
  plan_entity_id: string
  auditor_id: string
  role_on_engagement: 'lead' | 'team_member'
}

export type EngagementStatus =
  | 'scoping'
  | 'fieldwork'
  | 'review'
  | 'reporting'
  | 'closed'

export interface Engagement {
  engagement_id: string
  plan_entity_id: string
  entity_id: string
  status: EngagementStatus
  scope_text: string
  start_date: string | null
  end_date: string | null
  lead_auditor_id: string
  created_at: string
}

export interface TestProcedure {
  procedure_id: string
  control_type: string
  description: string
  steps: string
  is_template: boolean
}

export interface RcmEntry {
  rcm_id: string
  engagement_id: string
  risk_id: string
  control_id: string
  test_procedure_id: string | null
  test_procedure_draft: string | null
  expected_evidence: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Sample {
  sample_id: string
  rcm_id: string
  population_size: number
  sample_method: string
  sample_refs: string[]
}

export type TestResultValue = 'pass' | 'fail' | 'exception' | 'pending'

export interface TestResult {
  result_id: string
  rcm_id: string
  sample_ref: string | null
  evidence_ref: string | null
  result: TestResultValue
  automated: boolean
  tested_by: string | null
  tested_at: string
}

export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ExceptionStatus = 'pending_review' | 'validated' | 'false_positive'

export interface ExceptionRecord {
  exception_id: string
  test_result_id: string
  description: string
  severity: ExceptionSeverity | null
  root_cause: string | null
  status: ExceptionStatus
  validated_by: string | null
  validated_at: string | null
  created_at: string
}

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FindingStatus = 'draft' | 'approved' | 'closed'

export interface Finding {
  finding_id: string
  engagement_id: string
  risk_id: string
  control_id: string
  exception_id: string | null
  condition_text: string
  criteria_text: string
  cause_text: string
  effect_text: string
  recommendation_text: string
  severity: FindingSeverity
  status: FindingStatus
  owner_auditor_id: string
  created_at: string
  approved_at: string | null
}

export type ReportStatus = 'draft' | 'issued'

export interface Report {
  report_id: string
  engagement_id: string
  executive_summary: string
  scope_text: string
  findings_summary: string
  remediation_status_summary: string
  overall_opinion: string | null
  status: ReportStatus
  issued_by: string | null
  issue_date: string | null
  finding_ids: string[]
}
