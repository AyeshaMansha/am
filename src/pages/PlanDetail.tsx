import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Badge, Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function PlanDetail() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const {
    state,
    currentUser,
    getPlan,
    getEntity,
    getUser,
    addEntityToPlan,
    removeEntityFromPlan,
    setPlanEntityHours,
    assignAuditor,
    submitPlanForApproval,
    approvePlan,
    ratifyPlan,
    createEngagement,
  } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName

  const plan = getPlan(planId)
  const [entityToAdd, setEntityToAdd] = useState('')
  const [hours, setHours] = useState(80)
  const auditors = state.users.filter((u) => u.role_id === 'role-auditor')

  if (!plan) return <EmptyState title="Plan not found" />

  const lines = state.auditPlanEntities.filter((pe) => pe.plan_id === plan.plan_id)
  const confirmedEntities = state.auditUniverseEntities.filter((e) => e.status === 'confirmed')
  const addedIds = new Set(lines.map((l) => l.entity_id))
  const addable = confirmedEntities.filter((e) => !addedIds.has(e.entity_id))
  const totalHours = lines.reduce((sum, l) => sum + (l.estimated_hours ?? 0), 0)

  const canEdit = plan.status === 'draft' && can(role, 'plan.edit')

  return (
    <div>
      <button onClick={() => navigate('/planning')} className="mb-3 text-xs text-slate-400 hover:text-slate-600">
        ← Back to Audit Planning
      </button>
      <PageHeader
        title={`Plan ${plan.period}`}
        description={`${lines.length} entities · ${totalHours} estimated hours`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={plan.status} />
            {plan.status === 'draft' &&
              (can(role, 'plan.edit') ? (
                <Button size="sm" onClick={() => submitPlanForApproval(plan.plan_id)} disabled={lines.length === 0}>
                  Submit for approval
                </Button>
              ) : null)}
            {plan.status === 'pending_approval' &&
              (can(role, 'plan.approve') ? (
                <Button size="sm" onClick={() => approvePlan(plan.plan_id)}>
                  Approve plan
                </Button>
              ) : (
                <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
              ))}
            {plan.status === 'approved' &&
              !plan.committee_ratified_at &&
              (can(role, 'plan.ratify') ? (
                <Button size="sm" variant="secondary" onClick={() => ratifyPlan(plan.plan_id)}>
                  Ratify (Committee)
                </Button>
              ) : (
                <Locked reason={`Requires ${roleLabels['audit_committee']}`} />
              ))}
          </div>
        }
      />

      {canEdit && addable.length > 0 && (
        <Card className="mb-6 flex flex-wrap items-end gap-3 p-4">
          <Field label="Add confirmed entity to plan">
            <select className={inputClass} value={entityToAdd} onChange={(e) => setEntityToAdd(e.target.value)}>
              <option value="">Select entity…</option>
              {addable.map((e) => (
                <option key={e.entity_id} value={e.entity_id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estimated hours">
            <input type="number" className={`${inputClass} w-28`} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </Field>
          <Button
            variant="secondary"
            disabled={!entityToAdd}
            onClick={() => {
              addEntityToPlan(plan.plan_id, entityToAdd, hours)
              setEntityToAdd('')
            }}
          >
            Add to plan
          </Button>
        </Card>
      )}

      {lines.length === 0 ? (
        <EmptyState title="No entities in this plan yet" description="Add confirmed audit universe entities above." />
      ) : (
        <div className="space-y-3">
          {lines.map((line) => {
            const entity = getEntity(line.entity_id)
            const assignments = state.auditPlanAssignments.filter((a) => a.plan_entity_id === line.id)
            const engagement = state.engagements.find((e) => e.plan_entity_id === line.id)
            return (
              <Card key={line.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{entity?.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {line.flag_type !== 'none' && (
                        <Badge tone={line.flag_type === 'gap' ? 'amber' : 'red'}>{line.flag_type === 'gap' ? 'Coverage gap' : 'Audit fatigue'}</Badge>
                      )}
                      <span className="text-xs text-slate-400">Audit risk score: {entity?.current_risk_score ?? '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <input
                        type="number"
                        className={`${inputClass} w-24 text-right`}
                        value={line.estimated_hours ?? 0}
                        onChange={(e) => setPlanEntityHours(line.id, Number(e.target.value))}
                      />
                    ) : (
                      <span className="text-sm text-slate-500">{line.estimated_hours} hrs</span>
                    )}
                    {canEdit && (
                      <Button size="sm" variant="ghost" onClick={() => removeEntityFromPlan(line.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-medium text-slate-500">Assigned:</span>
                  {assignments.length === 0 && <span className="text-xs text-slate-300">No auditors assigned</span>}
                  {assignments.map((a) => (
                    <Badge key={a.id} tone={a.role_on_engagement === 'lead' ? 'blue' : 'slate'}>
                      {getUser(a.auditor_id)?.name} {a.role_on_engagement === 'lead' && '(lead)'}
                    </Badge>
                  ))}
                  {canEdit && (
                    <select
                      className="ml-auto rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return
                        const isLead = assignments.every((a) => a.role_on_engagement !== 'lead')
                        assignAuditor(line.id, e.target.value, isLead ? 'lead' : 'team_member')
                      }}
                    >
                      <option value="">+ Assign auditor</option>
                      {auditors.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {plan.status === 'approved' && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {engagement ? (
                      <Link to={`/engagements/${engagement.engagement_id}`} className="text-xs font-medium text-slate-600 hover:underline">
                        Engagement created — view →
                      </Link>
                    ) : can(role, 'engagement.create') ? (
                      <Button size="sm" onClick={() => createEngagement(line.id)}>
                        Create engagement
                      </Button>
                    ) : (
                      <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
