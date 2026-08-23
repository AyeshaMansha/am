import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function ReportDetail() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const { state, currentUser, getEntity, getFinding, updateReport, issueReport } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName

  const report = state.reports.find((r) => r.report_id === reportId)
  const [opinionError, setOpinionError] = useState('')

  if (!report) return <EmptyState title="Report not found" />

  const engagement = state.engagements.find((e) => e.engagement_id === report.engagement_id)
  const findings = report.finding_ids.map((id) => getFinding(id)).filter(Boolean)
  const editable = report.status === 'draft' && can(role, 'report.edit')

  function issue() {
    if (!report!.overall_opinion?.trim()) {
      setOpinionError('An overall audit opinion is required before the report can be issued.')
      return
    }
    issueReport(report!.report_id)
  }

  return (
    <div>
      <button onClick={() => navigate('/reports')} className="mb-3 text-xs text-slate-400 hover:text-slate-600">
        ← Back to Reports
      </button>
      <PageHeader
        title={`Report — ${engagement ? getEntity(engagement.entity_id)?.name : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
            {report.status === 'draft' &&
              (can(role, 'report.issue') ? (
                <Button size="sm" onClick={issue}>
                  Issue report
                </Button>
              ) : (
                <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
              ))}
          </div>
        }
      />

      <div className="space-y-4">
        <Card className="p-5">
          <Field label="Scope &amp; objectives">
            <textarea
              className={inputClass}
              rows={2}
              disabled={!editable}
              value={report.scope_text}
              onChange={(e) => updateReport(report.report_id, { scope_text: e.target.value })}
            />
          </Field>
        </Card>

        <Card className="p-5">
          <Field label="Executive summary">
            <textarea
              className={inputClass}
              rows={3}
              disabled={!editable}
              value={report.executive_summary}
              onChange={(e) => updateReport(report.report_id, { executive_summary: e.target.value })}
            />
          </Field>
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Findings summary</p>
          <Field label="">
            <textarea
              className={inputClass}
              rows={2}
              disabled={!editable}
              value={report.findings_summary}
              onChange={(e) => updateReport(report.report_id, { findings_summary: e.target.value })}
              placeholder="e.g. High: 1, Medium: 1. No critical findings identified."
            />
          </Field>
          <div className="mt-4 space-y-3">
            {findings.length === 0 ? (
              <p className="text-sm text-slate-400">No approved findings linked to this engagement.</p>
            ) : (
              findings.map(
                (f) =>
                  f && (
                    <div key={f.finding_id} className="rounded-lg bg-slate-50 p-3 text-sm">
                      <p className="font-medium text-slate-800">{f.condition_text}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-medium">Criteria:</span> {f.criteria_text}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-medium">Recommendation:</span> {f.recommendation_text}
                      </p>
                    </div>
                  ),
              )
            )}
          </div>
        </Card>

        <Card className="p-5">
          <Field label="Remediation status summary">
            <textarea
              className={inputClass}
              rows={2}
              disabled={!editable}
              value={report.remediation_status_summary}
              onChange={(e) => updateReport(report.report_id, { remediation_status_summary: e.target.value })}
            />
          </Field>
        </Card>

        <Card className="p-5">
          <Field label="Overall audit opinion" hint="Professional-judgment step — required before the report can be issued. Never system-generated.">
            <textarea
              className={inputClass}
              rows={2}
              disabled={!editable}
              value={report.overall_opinion ?? ''}
              onChange={(e) => {
                updateReport(report.report_id, { overall_opinion: e.target.value })
                if (opinionError) setOpinionError('')
              }}
            />
            {opinionError && <p className="mt-1 text-xs text-rose-600">{opinionError}</p>}
          </Field>
        </Card>

        {report.status === 'issued' && (
          <p className="text-xs text-slate-400">
            Issued on {report.issue_date && new Date(report.issue_date).toLocaleDateString()} — notified to the Audit Committee.
          </p>
        )}
      </div>
    </div>
  )
}
