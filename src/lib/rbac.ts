import type { RoleName } from '../types'

// Mirrors the "Auth" column of Sahl_API_Contracts.md — kept as a single
// table so every screen's action-gating traces back to one place.
export type Action =
  | 'entity.create'
  | 'entity.confirm'
  | 'riskLink.manage'
  | 'auditScore.adjust'
  | 'plan.create'
  | 'plan.edit'
  | 'plan.approve'
  | 'plan.ratify'
  | 'engagement.create'
  | 'engagement.statusEdit'
  | 'rcm.edit'
  | 'sample.create'
  | 'testResult.create'
  | 'exception.validate'
  | 'finding.create'
  | 'finding.approve'
  | 'correctiveAction.updateStatus'
  | 'correctiveAction.validateClosure'
  | 'report.edit'
  | 'report.issue'

const matrix: Record<Action, RoleName[]> = {
  'entity.create': ['auditor', 'audit_manager'],
  'entity.confirm': ['audit_manager'],
  'riskLink.manage': ['auditor'],
  'auditScore.adjust': ['auditor'],
  'plan.create': ['audit_manager'],
  'plan.edit': ['audit_manager'],
  'plan.approve': ['audit_manager'],
  'plan.ratify': ['audit_committee'],
  'engagement.create': ['audit_manager'],
  'engagement.statusEdit': ['auditor', 'audit_manager'],
  'rcm.edit': ['auditor'],
  'sample.create': ['auditor'],
  'testResult.create': ['auditor'],
  'exception.validate': ['auditor'],
  'finding.create': ['auditor'],
  'finding.approve': ['audit_manager'],
  'correctiveAction.updateStatus': ['control_owner'],
  'correctiveAction.validateClosure': ['auditor', 'audit_manager'],
  'report.edit': ['audit_manager'],
  'report.issue': ['audit_manager'],
}

export function can(role: RoleName, action: Action): boolean {
  if (role === 'admin') return true
  return matrix[action]?.includes(role) ?? false
}

export const roleLabels: Record<RoleName, string> = {
  auditor: 'Auditor',
  audit_manager: 'Audit Manager / CAE',
  control_owner: 'Control Owner',
  risk_owner: 'Risk Owner',
  audit_committee: 'Audit Committee',
  admin: 'Admin',
}
