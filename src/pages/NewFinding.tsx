import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../state/store'
import { Button, Card, Field, inputClass, PageHeader } from '../components/ui'
import type { FindingSeverity } from '../types'

export function NewFinding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, currentUser, getEntity, getRisk, getControl, createFinding } = useData()

  const presetEngagementId = (location.state as { engagementId?: string } | null)?.engagementId ?? state.engagements[0]?.engagement_id ?? ''
  const [engagementId, setEngagementId] = useState(presetEngagementId)
  const engagement = state.engagements.find((e) => e.engagement_id === engagementId)
  const rcmOptions = state.rcmEntries.filter((r) => r.engagement_id === engagementId)
  const [rcmId, setRcmId] = useState(rcmOptions[0]?.rcm_id ?? '')
  const rcm = rcmOptions.find((r) => r.rcm_id === rcmId)

  const [form, setForm] = useState({
    condition_text: '',
    criteria_text: '',
    cause_text: '',
    effect_text: '',
    recommendation_text: '',
    severity: 'medium' as FindingSeverity,
  })

  const canSubmit = engagement && rcm && Object.entries(form).every(([k, v]) => (k === 'severity' ? true : String(v).trim().length > 0))

  function submit() {
    if (!engagement || !rcm) return
    createFinding({
      engagement_id: engagement.engagement_id,
      risk_id: rcm.risk_id,
      control_id: rcm.control_id,
      exception_id: null,
      owner_auditor_id: currentUser.user_id,
      ...form,
    })
    navigate('/findings')
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-3 text-xs text-slate-400 hover:text-slate-600">
        ← Back
      </button>
      <PageHeader title="New finding" description="Structured entry: Condition / Criteria / Cause / Effect / Recommendation." />

      <Card className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Engagement">
            <select
              className={inputClass}
              value={engagementId}
              onChange={(e) => {
                setEngagementId(e.target.value)
                const opts = state.rcmEntries.filter((r) => r.engagement_id === e.target.value)
                setRcmId(opts[0]?.rcm_id ?? '')
              }}
            >
              {state.engagements.map((e) => (
                <option key={e.engagement_id} value={e.engagement_id}>
                  {getEntity(e.entity_id)?.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Risk / control (from RCM)">
            <select className={inputClass} value={rcmId} onChange={(e) => setRcmId(e.target.value)}>
              {rcmOptions.length === 0 && <option value="">No RCM rows for this engagement</option>}
              {rcmOptions.map((r) => (
                <option key={r.rcm_id} value={r.rcm_id}>
                  {getRisk(r.risk_id)?.description} → {getControl(r.control_id)?.description}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Condition — what did you find?">
          <textarea className={inputClass} rows={2} value={form.condition_text} onChange={(e) => setForm({ ...form, condition_text: e.target.value })} />
        </Field>
        <Field label="Criteria — what should have happened?">
          <textarea className={inputClass} rows={2} value={form.criteria_text} onChange={(e) => setForm({ ...form, criteria_text: e.target.value })} />
        </Field>
        <Field label="Cause — why did it happen?">
          <textarea className={inputClass} rows={2} value={form.cause_text} onChange={(e) => setForm({ ...form, cause_text: e.target.value })} />
        </Field>
        <Field label="Effect — what's the impact?">
          <textarea className={inputClass} rows={2} value={form.effect_text} onChange={(e) => setForm({ ...form, effect_text: e.target.value })} />
        </Field>
        <Field label="Recommendation">
          <textarea className={inputClass} rows={2} value={form.recommendation_text} onChange={(e) => setForm({ ...form, recommendation_text: e.target.value })} />
        </Field>
        <Field label="Severity">
          <select className={`${inputClass} w-40`} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as FindingSeverity })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Field>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button disabled={!canSubmit} onClick={submit}>
            Save as draft finding
          </Button>
        </div>
      </Card>
    </div>
  )
}
