import { Link } from 'react-router-dom'
import { useData } from '../state/store'
import { roleLabels } from '../lib/rbac'
import { Card, PageHeader, StatusBadge } from '../components/ui'

export function Dashboard() {
  const { state, currentUser } = useData()
  const role = state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor'

  const draftEntities = state.auditUniverseEntities.filter((e) => e.status === 'draft').length
  const confirmedEntities = state.auditUniverseEntities.filter((e) => e.status === 'confirmed').length
  const plansPendingApproval = state.auditPlans.filter((p) => p.status === 'pending_approval').length
  const openEngagements = state.engagements.filter((e) => e.status !== 'closed').length
  const pendingExceptions = state.exceptions.filter((e) => e.status === 'pending_review').length
  const draftFindings = state.findings.filter((f) => f.status === 'draft').length
  const overdueActions = state.correctiveActions.filter((a) => a.status === 'overdue' || (a.status !== 'closed' && new Date(a.due_date) < new Date())).length
  const draftReports = state.reports.filter((r) => r.status === 'draft').length

  const tiles = [
    { label: 'Draft entities awaiting confirmation', value: draftEntities, to: '/universe', tone: draftEntities ? 'amber' : 'slate' },
    { label: 'Confirmed audit universe', value: confirmedEntities, to: '/universe', tone: 'slate' },
    { label: 'Plans pending approval', value: plansPendingApproval, to: '/planning', tone: plansPendingApproval ? 'amber' : 'slate' },
    { label: 'Open engagements', value: openEngagements, to: '/engagements', tone: 'slate' },
    { label: 'Exceptions pending validation', value: pendingExceptions, to: '/engagements', tone: pendingExceptions ? 'red' : 'slate' },
    { label: 'Draft findings', value: draftFindings, to: '/findings', tone: draftFindings ? 'amber' : 'slate' },
    { label: 'Corrective actions overdue', value: overdueActions, to: '/corrective-actions', tone: overdueActions ? 'red' : 'slate' },
    { label: 'Draft reports', value: draftReports, to: '/reports', tone: draftReports ? 'amber' : 'slate' },
  ] as const

  const recentFindings = [...state.findings].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${currentUser.name} · ${roleLabels[role]}. This view reflects only what your role can see and act on.`}
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to}>
            <Card className="p-4 transition hover:border-slate-300 hover:shadow-sm">
              <p className="text-2xl font-semibold text-slate-900">{t.value}</p>
              <p className="mt-1 text-xs leading-snug text-slate-500">{t.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Core loop stages</h2>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">1</span>
              Audit universe — identify &amp; confirm entities
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">2</span>
              Risk linking — direct join to ERM risk register
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">3</span>
              Audit risk register — score &amp; rationale
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">4</span>
              Planning — plan, approve, ratify
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">5</span>
              Engagements — RCM, sampling, testing, evidence
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">6</span>
              Findings — structured entry &amp; approval
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">7</span>
              Follow-up — corrective action lands back in ERM
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">8</span>
              Reports — assemble, opine, issue
            </li>
          </ol>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent findings</h2>
          {recentFindings.length === 0 ? (
            <p className="text-sm text-slate-400">No findings recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentFindings.map((f) => (
                <li key={f.finding_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link to={`/engagements/${f.engagement_id}`} className="block truncate text-sm font-medium text-slate-800 hover:underline">
                      {f.condition_text}
                    </Link>
                    <p className="text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={f.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
