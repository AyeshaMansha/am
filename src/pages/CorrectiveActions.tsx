import { useState } from 'react'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Badge, Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { CorrectiveActionStatus, RoleName } from '../types'

export function CorrectiveActions() {
  const { state, currentUser, getUser, getRisk, getControl, getFinding, updateCorrectiveActionStatus, validateClosure } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName
  const [statusFilter, setStatusFilter] = useState<'all' | CorrectiveActionStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'erm' | 'audit'>('all')
  const [mineOnly, setMineOnly] = useState(role === 'control_owner')

  let actions = [...state.correctiveActions].sort((a, b) => a.due_date.localeCompare(b.due_date))
  if (statusFilter !== 'all') actions = actions.filter((a) => a.status === statusFilter)
  if (sourceFilter !== 'all') actions = actions.filter((a) => a.source === sourceFilter)
  if (mineOnly) actions = actions.filter((a) => a.owner_id === currentUser.user_id)

  return (
    <div>
      <PageHeader
        title="Follow-up"
        description="Shared with ERM — audit-originated actions (source: audit) land in the same table as ERM-native corrective actions."
      />

      <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
        <Field label="Status">
          <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="overdue">Overdue</option>
            <option value="complete">Complete</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
        <Field label="Source">
          <select className={inputClass} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}>
            <option value="all">All</option>
            <option value="erm">ERM-native</option>
            <option value="audit">Audit-originated</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
          My actions only
        </label>
      </Card>

      {actions.length === 0 ? (
        <EmptyState title="No corrective actions match these filters" />
      ) : (
        <div className="space-y-3">
          {actions.map((a) => {
            const finding = getFinding(a.origin_finding_id)
            const isOwner = a.owner_id === currentUser.user_id
            const overdue = a.status !== 'closed' && a.status !== 'complete' && new Date(a.due_date) < new Date()
            return (
              <Card key={a.action_id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={a.source === 'audit' ? 'purple' : 'blue'}>{a.source === 'audit' ? 'Audit-originated' : 'ERM-native'}</Badge>
                      {finding && <span className="text-xs text-slate-400">from finding: {finding.condition_text.slice(0, 60)}…</span>}
                    </div>
                    <p className="mt-1 font-medium text-slate-800">{a.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {getRisk(a.risk_id)?.description ?? getControl(a.control_id)?.description} · Owner: {getUser(a.owner_id)?.name} · Due{' '}
                      {new Date(a.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {overdue && <Badge tone="red">Overdue</Badge>}
                    <StatusBadge status={a.status} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  {a.status !== 'complete' && a.status !== 'closed' && (
                    <>
                      {can(role, 'correctiveAction.updateStatus') && isOwner ? (
                        <>
                          {a.status === 'open' && (
                            <Button size="sm" variant="secondary" onClick={() => updateCorrectiveActionStatus(a.action_id, 'in_progress', null)}>
                              Start progress
                            </Button>
                          )}
                          {a.status === 'in_progress' && (
                            <MarkCompleteForm actionId={a.action_id} />
                          )}
                        </>
                      ) : can(role, 'correctiveAction.updateStatus') && !isOwner ? (
                        <span className="text-xs text-slate-300">Not your action</span>
                      ) : (
                        <Locked reason={`Requires ${roleLabels['control_owner']} (owner)`} />
                      )}
                    </>
                  )}
                  {a.status === 'complete' &&
                    (can(role, 'correctiveAction.validateClosure') ? (
                      <Button size="sm" onClick={() => validateClosure(a.action_id)}>
                        Validate &amp; close
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Evidence: {a.evidence_ref} — awaiting closure validation</span>
                    ))}
                  {a.status === 'closed' && (
                    <span className="text-xs text-slate-400">Closed{a.closure_validated_by ? ` · validated by ${getUser(a.closure_validated_by)?.name}` : ''}</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MarkCompleteForm({ actionId }: { actionId: string }) {
  const { updateCorrectiveActionStatus } = useData()
  const [evidence, setEvidence] = useState('')
  return (
    <div className="flex items-center gap-2">
      <input className={`${inputClass} w-56`} placeholder="Evidence reference" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
      <Button size="sm" disabled={!evidence.trim()} onClick={() => updateCorrectiveActionStatus(actionId, 'complete', evidence)}>
        Mark complete
      </Button>
    </div>
  )
}
