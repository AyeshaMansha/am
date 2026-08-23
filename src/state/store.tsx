import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as seed from '../mockData'
import type {
  AuditPlan,
  AuditPlanAssignment,
  AuditPlanEntity,
  AuditRiskRegisterEntry,
  AuditUniverseEntity,
  Control,
  CorrectiveAction,
  CorrectiveActionStatus,
  Engagement,
  EngagementStatus,
  EntityRiskMap,
  ExceptionRecord,
  ExceptionSeverity,
  Finding,
  FlagType,
  Framework,
  OrgUnit,
  RcmEntry,
  Report,
  Risk,
  Role,
  RoleName,
  Sample,
  TestProcedure,
  TestResult,
  TestResultValue,
  User,
} from '../types'

const STORAGE_KEY = 'sahl-audit-mgmt-mock-v1'

export interface AppState {
  roles: Role[]
  orgUnits: OrgUnit[]
  users: User[]
  frameworks: Framework[]
  risks: Risk[]
  controls: Control[]
  correctiveActions: CorrectiveAction[]
  auditUniverseEntities: AuditUniverseEntity[]
  entityRiskMap: EntityRiskMap[]
  auditRiskRegister: AuditRiskRegisterEntry[]
  auditPlans: AuditPlan[]
  auditPlanEntities: AuditPlanEntity[]
  auditPlanAssignments: AuditPlanAssignment[]
  engagements: Engagement[]
  testProcedures: TestProcedure[]
  rcmEntries: RcmEntry[]
  samples: Sample[]
  testResults: TestResult[]
  exceptions: ExceptionRecord[]
  findings: Finding[]
  reports: Report[]
}

function seedState(): AppState {
  return {
    roles: seed.roles,
    orgUnits: seed.orgUnits,
    users: seed.users,
    frameworks: seed.frameworks,
    risks: seed.risks,
    controls: seed.controls,
    correctiveActions: seed.correctiveActions,
    auditUniverseEntities: seed.auditUniverseEntities,
    entityRiskMap: seed.entityRiskMap,
    auditRiskRegister: seed.auditRiskRegister,
    auditPlans: seed.auditPlans,
    auditPlanEntities: seed.auditPlanEntities,
    auditPlanAssignments: seed.auditPlanAssignments,
    engagements: seed.engagements,
    testProcedures: seed.testProcedures,
    rcmEntries: seed.rcmEntries,
    samples: seed.samples,
    testResults: seed.testResults,
    exceptions: seed.exceptions,
    findings: seed.findings,
    reports: seed.reports,
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    // ignore corrupt storage, fall back to seed
  }
  return seedState()
}

let idCounter = 1
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

function nowIso() {
  return new Date().toISOString()
}

interface Ctx {
  state: AppState
  currentUser: User
  setCurrentRole: (role: RoleName) => void
  resetDemoData: () => void

  // Lookups
  getUser: (id: string | null | undefined) => User | undefined
  getOrgUnit: (id: string | null | undefined) => OrgUnit | undefined
  getRisk: (id: string | null | undefined) => Risk | undefined
  getControl: (id: string | null | undefined) => Control | undefined
  getEntity: (id: string | null | undefined) => AuditUniverseEntity | undefined
  getPlan: (id: string | null | undefined) => AuditPlan | undefined
  getEngagement: (id: string | null | undefined) => Engagement | undefined
  getFinding: (id: string | null | undefined) => Finding | undefined

  // Audit Universe (A1 / B1)
  createDraftEntity: (data: { org_unit_id: string; name: string; description: string }) => void
  updateEntity: (id: string, patch: Partial<AuditUniverseEntity>) => void
  confirmEntity: (id: string) => void

  // Risk linking (A2 / B2)
  addManualRiskLink: (entityId: string, riskId: string) => void
  confirmRiskLink: (id: string) => void

  // Audit risk register (A3)
  setAdjustedScore: (entityId: string, adjusted_score: number, adjustment_rationale: string) => void

  // Planning (A4 / B3 / B4)
  createPlan: (period: string) => void
  addEntityToPlan: (planId: string, entityId: string, estimated_hours: number) => void
  removeEntityFromPlan: (planEntityId: string) => void
  setPlanEntityHours: (planEntityId: string, hours: number) => void
  assignAuditor: (planEntityId: string, auditorId: string, roleOnEngagement: 'lead' | 'team_member') => void
  submitPlanForApproval: (planId: string) => void
  approvePlan: (planId: string) => void
  ratifyPlan: (planId: string) => void

  // Engagements (A5 / B5 / B6 / B7)
  createEngagement: (planEntityId: string) => void
  updateEngagementStatus: (engagementId: string, status: EngagementStatus) => void
  addRcmEntry: (data: { engagement_id: string; risk_id: string; control_id: string; test_procedure_id: string | null; test_procedure_draft: string | null; expected_evidence: string }) => void
  reviewRcmEntry: (rcmId: string) => void
  addSample: (rcmId: string, population_size: number, sample_method: string, sample_refs: string[]) => void
  addTestResult: (data: { rcm_id: string; sample_ref: string; evidence_ref: string; result: TestResultValue }) => void

  // Exceptions (A6)
  validateException: (id: string, data: { status: 'validated' | 'false_positive'; severity: ExceptionSeverity | null; root_cause: string | null }) => void

  // Findings (A7)
  createFinding: (data: Omit<Finding, 'finding_id' | 'status' | 'created_at' | 'approved_at'>) => void
  approveFinding: (id: string) => void

  // Corrective actions / follow-up (A8 / B9 / B10 / B12)
  updateCorrectiveActionStatus: (id: string, status: CorrectiveActionStatus, evidence_ref: string | null) => void
  validateClosure: (id: string) => void

  // Reports (A9)
  ensureReport: (engagementId: string) => string
  updateReport: (id: string, patch: Partial<Report>) => void
  issueReport: (id: string) => void
}

const DataContext = createContext<Ctx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [currentRole, setCurrentRole] = useState<RoleName>('audit_manager')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const currentUser = useMemo(() => {
    const roleId = state.roles.find((r) => r.name === currentRole)?.role_id
    return state.users.find((u) => u.role_id === roleId) ?? state.users[0]
  }, [state.roles, state.users, currentRole])

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY)
    setState(seedState())
  }

  const getUser = (id: string | null | undefined) => state.users.find((u) => u.user_id === id)
  const getOrgUnit = (id: string | null | undefined) => state.orgUnits.find((o) => o.org_unit_id === id)
  const getRisk = (id: string | null | undefined) => state.risks.find((r) => r.risk_id === id)
  const getControl = (id: string | null | undefined) => state.controls.find((c) => c.control_id === id)
  const getEntity = (id: string | null | undefined) => state.auditUniverseEntities.find((e) => e.entity_id === id)
  const getPlan = (id: string | null | undefined) => state.auditPlans.find((p) => p.plan_id === id)
  const getEngagement = (id: string | null | undefined) => state.engagements.find((e) => e.engagement_id === id)
  const getFinding = (id: string | null | undefined) => state.findings.find((f) => f.finding_id === id)

  // ---- Audit Universe --------------------------------------------------
  function createDraftEntity(data: { org_unit_id: string; name: string; description: string }) {
    setState((s) => ({
      ...s,
      auditUniverseEntities: [
        ...s.auditUniverseEntities,
        {
          entity_id: nextId('entity'),
          org_unit_id: data.org_unit_id,
          name: data.name,
          description: data.description,
          current_risk_score: null,
          last_audit_date: null,
          audit_cycle_months: 12,
          status: 'draft',
          confirmed_by: null,
          confirmed_at: null,
          created_at: nowIso(),
        },
      ],
    }))
  }

  function updateEntity(id: string, patch: Partial<AuditUniverseEntity>) {
    setState((s) => ({
      ...s,
      auditUniverseEntities: s.auditUniverseEntities.map((e) => (e.entity_id === id ? { ...e, ...patch } : e)),
    }))
  }

  // B2: direct ID join — here simulated via org-unit match, since risks
  // carry org_unit_id rather than entity_id in this schema.
  function confirmEntity(id: string) {
    setState((s) => {
      const entity = s.auditUniverseEntities.find((e) => e.entity_id === id)
      if (!entity) return s
      const alreadyLinked = new Set(s.entityRiskMap.filter((m) => m.entity_id === id).map((m) => m.risk_id))
      const directMatches = s.risks.filter((r) => r.org_unit_id === entity.org_unit_id && !alreadyLinked.has(r.risk_id))
      const newLinks: EntityRiskMap[] = directMatches.map((r) => ({
        id: nextId('erm'),
        entity_id: id,
        risk_id: r.risk_id,
        match_type: 'direct',
        match_confidence: null,
        needs_manual_review: false,
        confirmed_by: null,
        confirmed_at: null,
      }))
      const linkedScores = directMatches
        .map((r) => (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0))
        .filter((n) => n > 0)
      const currentRiskScore = linkedScores.length ? Math.max(...linkedScores) : entity.current_risk_score
      return {
        ...s,
        auditUniverseEntities: s.auditUniverseEntities.map((e) =>
          e.entity_id === id
            ? { ...e, status: 'confirmed', confirmed_by: currentUser.user_id, confirmed_at: nowIso(), current_risk_score: currentRiskScore }
            : e,
        ),
        entityRiskMap: [...s.entityRiskMap, ...newLinks],
      }
    })
  }

  // ---- Risk linking ------------------------------------------------------
  function addManualRiskLink(entityId: string, riskId: string) {
    setState((s) => ({
      ...s,
      entityRiskMap: [
        ...s.entityRiskMap,
        {
          id: nextId('erm'),
          entity_id: entityId,
          risk_id: riskId,
          match_type: 'fuzzy_ai',
          match_confidence: null,
          needs_manual_review: true,
          confirmed_by: null,
          confirmed_at: null,
        },
      ],
    }))
  }

  function confirmRiskLink(id: string) {
    setState((s) => ({
      ...s,
      entityRiskMap: s.entityRiskMap.map((m) =>
        m.id === id ? { ...m, needs_manual_review: false, confirmed_by: currentUser.user_id, confirmed_at: nowIso() } : m,
      ),
    }))
  }

  // ---- Audit risk register -----------------------------------------------
  function setAdjustedScore(entityId: string, adjusted_score: number, adjustment_rationale: string) {
    if (!adjustment_rationale.trim()) throw new Error('adjustment_rationale is required')
    setState((s) => ({
      ...s,
      auditRiskRegister: s.auditRiskRegister.map((r) =>
        r.entity_id === entityId
          ? { ...r, adjusted_score, adjustment_rationale, adjusted_by: currentUser.user_id, adjusted_at: nowIso() }
          : r,
      ),
    }))
  }

  // ---- Planning ------------------------------------------------------------
  function createPlan(period: string) {
    setState((s) => ({
      ...s,
      auditPlans: [
        ...s.auditPlans,
        { plan_id: nextId('plan'), period, status: 'draft', created_by: currentUser.user_id, approved_by: null, approved_at: null, committee_ratified_at: null, created_at: nowIso() },
      ],
    }))
  }

  // B3: gap/fatigue flags — deterministic threshold check before the plan line is added.
  function computeFlag(entity: AuditUniverseEntity): FlagType {
    if (!entity.last_audit_date) return 'gap'
    const months = (Date.now() - new Date(entity.last_audit_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (months > entity.audit_cycle_months * 1.5) return 'gap'
    if (months < 4) return 'fatigue'
    return 'none'
  }

  function addEntityToPlan(planId: string, entityId: string, estimated_hours: number) {
    const entity = getEntity(entityId)
    setState((s) => ({
      ...s,
      auditPlanEntities: [
        ...s.auditPlanEntities,
        { id: nextId('pe'), plan_id: planId, entity_id: entityId, estimated_hours, flag_type: entity ? computeFlag(entity) : 'none' },
      ],
    }))
  }

  function removeEntityFromPlan(planEntityId: string) {
    setState((s) => ({
      ...s,
      auditPlanEntities: s.auditPlanEntities.filter((pe) => pe.id !== planEntityId),
      auditPlanAssignments: s.auditPlanAssignments.filter((a) => a.plan_entity_id !== planEntityId),
    }))
  }

  function setPlanEntityHours(planEntityId: string, hours: number) {
    setState((s) => ({
      ...s,
      auditPlanEntities: s.auditPlanEntities.map((pe) => (pe.id === planEntityId ? { ...pe, estimated_hours: hours } : pe)),
    }))
  }

  function assignAuditor(planEntityId: string, auditorId: string, roleOnEngagement: 'lead' | 'team_member') {
    setState((s) => ({
      ...s,
      auditPlanAssignments: [
        ...s.auditPlanAssignments,
        { id: nextId('asn'), plan_entity_id: planEntityId, auditor_id: auditorId, role_on_engagement: roleOnEngagement },
      ],
    }))
  }

  function submitPlanForApproval(planId: string) {
    setState((s) => ({
      ...s,
      auditPlans: s.auditPlans.map((p) => (p.plan_id === planId ? { ...p, status: 'pending_approval' } : p)),
    }))
  }

  function approvePlan(planId: string) {
    setState((s) => ({
      ...s,
      auditPlans: s.auditPlans.map((p) =>
        p.plan_id === planId ? { ...p, status: 'approved', approved_by: currentUser.user_id, approved_at: nowIso() } : p,
      ),
    }))
  }

  function ratifyPlan(planId: string) {
    setState((s) => ({
      ...s,
      auditPlans: s.auditPlans.map((p) => (p.plan_id === planId ? { ...p, committee_ratified_at: nowIso() } : p)),
    }))
  }

  // ---- Engagements -----------------------------------------------------
  function createEngagement(planEntityId: string) {
    setState((s) => {
      const pe = s.auditPlanEntities.find((x) => x.id === planEntityId)
      if (!pe) return s
      const lead = s.auditPlanAssignments.find((a) => a.plan_entity_id === planEntityId && a.role_on_engagement === 'lead')
      const engagement: Engagement = {
        engagement_id: nextId('eng'),
        plan_entity_id: planEntityId,
        entity_id: pe.entity_id,
        status: 'scoping',
        scope_text: '',
        start_date: null,
        end_date: null,
        lead_auditor_id: lead?.auditor_id ?? currentUser.user_id,
        created_at: nowIso(),
      }
      return { ...s, engagements: [...s.engagements, engagement] }
    })
  }

  function updateEngagementStatus(engagementId: string, status: EngagementStatus) {
    setState((s) => ({
      ...s,
      engagements: s.engagements.map((e) => (e.engagement_id === engagementId ? { ...e, status } : e)),
    }))
  }

  function addRcmEntry(data: { engagement_id: string; risk_id: string; control_id: string; test_procedure_id: string | null; test_procedure_draft: string | null; expected_evidence: string }) {
    setState((s) => ({
      ...s,
      rcmEntries: [
        ...s.rcmEntries,
        { rcm_id: nextId('rcm'), ...data, reviewed_by: null, reviewed_at: null, created_at: nowIso() },
      ],
    }))
  }

  function reviewRcmEntry(rcmId: string) {
    setState((s) => ({
      ...s,
      rcmEntries: s.rcmEntries.map((r) => (r.rcm_id === rcmId ? { ...r, reviewed_by: currentUser.user_id, reviewed_at: nowIso() } : r)),
    }))
  }

  function addSample(rcmId: string, population_size: number, sample_method: string, sample_refs: string[]) {
    setState((s) => ({
      ...s,
      samples: [...s.samples, { sample_id: nextId('sample'), rcm_id: rcmId, population_size, sample_method, sample_refs }],
    }))
  }

  function addTestResult(data: { rcm_id: string; sample_ref: string; evidence_ref: string; result: TestResultValue }) {
    setState((s) => {
      const result: TestResult = {
        result_id: nextId('tr'),
        rcm_id: data.rcm_id,
        sample_ref: data.sample_ref,
        evidence_ref: data.evidence_ref || null,
        result: data.result,
        automated: false,
        tested_by: currentUser.user_id,
        tested_at: nowIso(),
      }
      let exceptionsList = s.exceptions
      if (data.result === 'fail' || data.result === 'exception') {
        exceptionsList = [
          ...exceptionsList,
          {
            exception_id: nextId('exc'),
            test_result_id: result.result_id,
            description: '',
            severity: null,
            root_cause: null,
            status: 'pending_review',
            validated_by: null,
            validated_at: null,
            created_at: nowIso(),
          },
        ]
      }
      return { ...s, testResults: [...s.testResults, result], exceptions: exceptionsList }
    })
  }

  // ---- Exceptions --------------------------------------------------------
  function validateException(id: string, data: { status: 'validated' | 'false_positive'; severity: ExceptionSeverity | null; root_cause: string | null }) {
    setState((s) => ({
      ...s,
      exceptions: s.exceptions.map((e) =>
        e.exception_id === id
          ? { ...e, ...data, validated_by: currentUser.user_id, validated_at: nowIso() }
          : e,
      ),
    }))
  }

  // ---- Findings ------------------------------------------------------------
  function createFinding(data: Omit<Finding, 'finding_id' | 'status' | 'created_at' | 'approved_at'>) {
    setState((s) => ({
      ...s,
      findings: [...s.findings, { ...data, finding_id: nextId('finding'), status: 'draft', created_at: nowIso(), approved_at: null }],
    }))
  }

  // B9 + B10: approving a finding auto-creates a corrective action tagged
  // source=audit and auto-assigns the owner from the control's owner_id.
  function approveFinding(id: string) {
    setState((s) => {
      const finding = s.findings.find((f) => f.finding_id === id)
      if (!finding) return s
      const control = s.controls.find((c) => c.control_id === finding.control_id)
      const owner = control?.owner_id ?? finding.owner_auditor_id
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 45)
      const action: CorrectiveAction = {
        action_id: nextId('ca'),
        risk_id: finding.risk_id,
        control_id: finding.control_id,
        source: 'audit',
        origin_finding_id: finding.finding_id,
        description: finding.recommendation_text,
        owner_id: owner,
        due_date: dueDate.toISOString().slice(0, 10),
        status: 'open',
        evidence_ref: null,
        closure_validated_by: null,
        closure_validated_at: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      }
      return {
        ...s,
        findings: s.findings.map((f) => (f.finding_id === id ? { ...f, status: 'approved', approved_at: nowIso() } : f)),
        correctiveActions: [...s.correctiveActions, action],
      }
    })
  }

  // ---- Corrective actions / follow-up -------------------------------------
  function updateCorrectiveActionStatus(id: string, status: CorrectiveActionStatus, evidence_ref: string | null) {
    setState((s) => ({
      ...s,
      correctiveActions: s.correctiveActions.map((a) =>
        a.action_id === id ? { ...a, status, evidence_ref: evidence_ref ?? a.evidence_ref, updated_at: nowIso() } : a,
      ),
    }))
  }

  function validateClosure(id: string) {
    setState((s) => ({
      ...s,
      correctiveActions: s.correctiveActions.map((a) =>
        a.action_id === id
          ? { ...a, status: 'closed', closure_validated_by: currentUser.user_id, closure_validated_at: nowIso(), updated_at: nowIso() }
          : a,
      ),
    }))
  }

  // ---- Reports --------------------------------------------------------------
  function ensureReport(engagementId: string): string {
    const existing = state.reports.find((r) => r.engagement_id === engagementId)
    if (existing) return existing.report_id
    const id = nextId('report')
    const findingIds = state.findings.filter((f) => f.engagement_id === engagementId).map((f) => f.finding_id)
    setState((s) => ({
      ...s,
      reports: [
        ...s.reports,
        {
          report_id: id,
          engagement_id: engagementId,
          executive_summary: '',
          scope_text: state.engagements.find((e) => e.engagement_id === engagementId)?.scope_text ?? '',
          findings_summary: '',
          remediation_status_summary: '',
          overall_opinion: null,
          status: 'draft',
          issued_by: null,
          issue_date: null,
          finding_ids: findingIds,
        },
      ],
    }))
    return id
  }

  function updateReport(id: string, patch: Partial<Report>) {
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) => (r.report_id === id ? { ...r, ...patch } : r)),
    }))
  }

  function issueReport(id: string) {
    setState((s) => {
      const report = s.reports.find((r) => r.report_id === id)
      if (!report || !report.overall_opinion) throw new Error('overall_opinion is required to issue')
      return {
        ...s,
        reports: s.reports.map((r) =>
          r.report_id === id ? { ...r, status: 'issued', issued_by: currentUser.user_id, issue_date: nowIso().slice(0, 10) } : r,
        ),
      }
    })
  }

  const value: Ctx = {
    state,
    currentUser,
    setCurrentRole: setCurrentRole as (role: RoleName) => void,
    resetDemoData,
    getUser,
    getOrgUnit,
    getRisk,
    getControl,
    getEntity,
    getPlan,
    getEngagement,
    getFinding,
    createDraftEntity,
    updateEntity,
    confirmEntity,
    addManualRiskLink,
    confirmRiskLink,
    setAdjustedScore,
    createPlan,
    addEntityToPlan,
    removeEntityFromPlan,
    setPlanEntityHours,
    assignAuditor,
    submitPlanForApproval,
    approvePlan,
    ratifyPlan,
    createEngagement,
    updateEngagementStatus,
    addRcmEntry,
    reviewRcmEntry,
    addSample,
    addTestResult,
    validateException,
    createFinding,
    approveFinding,
    updateCorrectiveActionStatus,
    validateClosure,
    ensureReport,
    updateReport,
    issueReport,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
