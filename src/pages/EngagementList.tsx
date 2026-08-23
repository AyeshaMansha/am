import { Link } from 'react-router-dom'
import { useData } from '../state/store'
import { Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'

export function EngagementList() {
  const { state, getEntity, getUser } = useData()
  const engagements = [...state.engagements].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div>
      <PageHeader title="Engagements" description="Scoping, RCM, sampling, evidence, and testing — created from approved plan lines." />

      {engagements.length === 0 ? (
        <EmptyState title="No engagements yet" description="Approve a plan and create an engagement from a plan line." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Lead auditor</th>
                <th className="px-4 py-3 font-medium">Findings</th>
                <th className="px-4 py-3 font-medium">Exceptions</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {engagements.map((e) => {
                const findingCount = state.findings.filter((f) => f.engagement_id === e.engagement_id).length
                const rcmIds = state.rcmEntries.filter((r) => r.engagement_id === e.engagement_id).map((r) => r.rcm_id)
                const resultIds = state.testResults.filter((tr) => rcmIds.includes(tr.rcm_id)).map((tr) => tr.result_id)
                const exceptionCount = state.exceptions.filter((x) => resultIds.includes(x.test_result_id)).length
                return (
                  <tr key={e.engagement_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/engagements/${e.engagement_id}`} className="font-medium text-slate-800 hover:underline">
                        {getEntity(e.entity_id)?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{getUser(e.lead_auditor_id)?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{findingCount}</td>
                    <td className="px-4 py-3 text-slate-500">{exceptionCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
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
