import { useNavigate } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Button, Card, EmptyState, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function ReportsList() {
  const navigate = useNavigate()
  const { state, currentUser, getEntity, ensureReport } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName

  const reports = [...state.reports].sort((a, b) => (b.issue_date ?? '9999').localeCompare(a.issue_date ?? '9999'))
  const eligibleEngagements = state.engagements.filter(
    (e) => (e.status === 'reporting' || e.status === 'closed') && !state.reports.some((r) => r.engagement_id === e.engagement_id),
  )

  return (
    <div>
      <PageHeader title="Reports" description="Assembled from a structured template; the overall opinion is always written by the Audit Manager/CAE." />

      {eligibleEngagements.length > 0 && (
        <Card className="mb-6 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Engagements ready for a report</p>
          <div className="space-y-2">
            {eligibleEngagements.map((e) => (
              <div key={e.engagement_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{getEntity(e.entity_id)?.name}</span>
                {can(role, 'report.edit') ? (
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/reports/${ensureReport(e.engagement_id)}`)}>
                    Start report
                  </Button>
                ) : (
                  <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {reports.length === 0 ? (
        <EmptyState title="No reports yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Engagement</th>
                <th className="px-4 py-3 font-medium">Findings</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => {
                const engagement = state.engagements.find((e) => e.engagement_id === r.engagement_id)
                return (
                  <tr key={r.report_id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/reports/${r.report_id}`)}>
                    <td className="px-4 py-3 font-medium text-slate-800">{engagement && getEntity(engagement.entity_id)?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{r.finding_ids.length}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.issue_date ? new Date(r.issue_date).toLocaleDateString() : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
