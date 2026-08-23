import { Link } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Badge, Button, Card, EmptyState, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function FindingsList() {
  const { state, currentUser, getEntity, getUser, approveFinding } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName
  const findings = [...state.findings].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div>
      <PageHeader
        title="Findings"
        description="Manual structured entry (condition / criteria / cause / effect / recommendation). Approval writes a corrective action back to ERM."
        actions={
          can(role, 'finding.create') ? (
            <Link to="/findings/new">
              <Button>+ New finding</Button>
            </Link>
          ) : (
            <Locked reason={`Requires ${roleLabels['auditor']}`} />
          )
        }
      />

      {findings.length === 0 ? (
        <EmptyState title="No findings yet" />
      ) : (
        <div className="space-y-3">
          {findings.map((f) => {
            const engagement = state.engagements.find((e) => e.engagement_id === f.engagement_id)
            return (
              <Card key={f.finding_id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{engagement && getEntity(engagement.entity_id)?.name}</p>
                    <p className="mt-0.5 font-medium text-slate-800">{f.condition_text}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        <span className="text-slate-400">Cause:</span> {f.cause_text}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={f.severity === 'critical' || f.severity === 'high' ? 'red' : f.severity === 'medium' ? 'amber' : 'slate'}>{f.severity}</Badge>
                    <StatusBadge status={f.status} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">Owner: {getUser(f.owner_auditor_id)?.name}</p>
                  {f.status === 'draft' &&
                    (can(role, 'finding.approve') ? (
                      <Button size="sm" onClick={() => approveFinding(f.finding_id)}>
                        Approve
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-300">Awaiting Audit Manager approval</span>
                    ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
