import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Badge, Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { EngagementStatus, ExceptionSeverity, RoleName, TestResultValue } from '../types'

const statusFlow: EngagementStatus[] = ['scoping', 'fieldwork', 'review', 'reporting', 'closed']

export function EngagementDetail() {
  const { engagementId } = useParams()
  const navigate = useNavigate()
  const data = useData()
  const { state, currentUser, getEntity, getRisk, getControl, getUser, updateEngagementStatus } = data
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName

  const engagement = data.getEngagement(engagementId)
  const [tab, setTab] = useState<'overview' | 'rcm' | 'exceptions'>('overview')

  if (!engagement) return <EmptyState title="Engagement not found" />

  const entity = getEntity(engagement.entity_id)
  const linkedRiskIds = state.entityRiskMap.filter((m) => m.entity_id === engagement.entity_id).map((m) => m.risk_id)
  const rcmEntries = state.rcmEntries.filter((r) => r.engagement_id === engagement.engagement_id)
  const rcmIds = rcmEntries.map((r) => r.rcm_id)
  const allResults = state.testResults.filter((tr) => rcmIds.includes(tr.rcm_id))
  const exceptionsForEngagement = state.exceptions.filter((x) => allResults.some((r) => r.result_id === x.test_result_id))

  const currentIdx = statusFlow.indexOf(engagement.status)
  const nextStatus = statusFlow[currentIdx + 1]

  return (
    <div>
      <button onClick={() => navigate('/engagements')} className="mb-3 text-xs text-slate-400 hover:text-slate-600">
        ← Back to Engagements
      </button>
      <PageHeader
        title={entity?.name ?? 'Engagement'}
        description={engagement.scope_text || 'No scope defined yet.'}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={engagement.status} />
            {nextStatus &&
              (can(role, 'engagement.statusEdit') ? (
                <Button size="sm" variant="secondary" onClick={() => updateEngagementStatus(engagement.engagement_id, nextStatus)}>
                  Move to {nextStatus.replace(/_/g, ' ')}
                </Button>
              ) : (
                <Locked reason={`Requires ${roleLabels['auditor']}`} />
              ))}
          </div>
        }
      />

      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {(['overview', 'rcm', 'exceptions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'rcm' ? `RCM & testing (${rcmEntries.length})` : `Exceptions (${exceptionsForEngagement.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
          <Info label="Lead auditor" value={getUser(engagement.lead_auditor_id)?.name} />
          <Info label="Status" value={<StatusBadge status={engagement.status} />} />
          <Info label="Start date" value={engagement.start_date ?? '—'} />
          <Info label="Linked risks" value={linkedRiskIds.length} />
          <Info label="RCM rows" value={rcmEntries.length} />
          <Info label="Findings" value={state.findings.filter((f) => f.engagement_id === engagement.engagement_id).length} />
        </Card>
      )}

      {tab === 'rcm' && <RcmTab engagementId={engagement.engagement_id} linkedRiskIds={linkedRiskIds} role={role} />}

      {tab === 'exceptions' && (
        <div className="space-y-3">
          {exceptionsForEngagement.length === 0 ? (
            <EmptyState title="No exceptions" description="Exceptions appear automatically when a test result is marked fail or exception." />
          ) : (
            exceptionsForEngagement.map((exc) => {
              const result = allResults.find((r) => r.result_id === exc.test_result_id)
              const rcm = rcmEntries.find((r) => r.rcm_id === result?.rcm_id)
              return (
                <ExceptionCard
                  key={exc.exception_id}
                  exceptionId={exc.exception_id}
                  status={exc.status}
                  description={exc.description}
                  severity={exc.severity}
                  rootCause={exc.root_cause}
                  sampleRef={result?.sample_ref ?? null}
                  riskLabel={rcm ? getRisk(rcm.risk_id)?.description : undefined}
                  controlLabel={rcm ? getControl(rcm.control_id)?.description : undefined}
                  canValidate={can(role, 'exception.validate')}
                />
              )
            })
          )}
        </div>
      )}

      {engagement.status === 'reporting' || engagement.status === 'closed' ? (
        <p className="mt-6 text-xs text-slate-400">
          <Link to="/findings/new" state={{ engagementId: engagement.engagement_id }} className="hover:underline">
            Draft a finding for this engagement →
          </Link>
        </p>
      ) : null}
    </div>
  )
}

function RcmTab({ engagementId, linkedRiskIds, role }: { engagementId: string; linkedRiskIds: string[]; role: RoleName }) {
  const data = useData()
  const { state, getRisk, getControl, addRcmEntry, reviewRcmEntry } = data
  const rcmEntries = state.rcmEntries.filter((r) => r.engagement_id === engagementId)

  const [showForm, setShowForm] = useState(false)
  const [riskId, setRiskId] = useState(linkedRiskIds[0] ?? '')
  const controlsForRisk = state.controls.filter((c) => c.risk_ids.includes(riskId))
  const [controlId, setControlId] = useState('')
  const proceduresForControl = state.testProcedures.filter((p) => p.control_type === getControl(controlId)?.control_type)
  const [procedureId, setProcedureId] = useState('')
  const [draftProcedure, setDraftProcedure] = useState('')
  const [expectedEvidence, setExpectedEvidence] = useState('')

  function submit() {
    if (!riskId || !controlId || !expectedEvidence.trim()) return
    addRcmEntry({
      engagement_id: engagementId,
      risk_id: riskId,
      control_id: controlId,
      test_procedure_id: procedureId || null,
      test_procedure_draft: procedureId ? null : draftProcedure || null,
      expected_evidence: expectedEvidence,
    })
    setShowForm(false)
    setControlId('')
    setProcedureId('')
    setDraftProcedure('')
    setExpectedEvidence('')
  }

  return (
    <div className="space-y-4">
      {can(role, 'rcm.edit') && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New RCM row'}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Risk">
              <select
                className={inputClass}
                value={riskId}
                onChange={(e) => {
                  setRiskId(e.target.value)
                  setControlId('')
                }}
              >
                {linkedRiskIds.map((id) => (
                  <option key={id} value={id}>
                    {getRisk(id)?.description}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Control">
              <select className={inputClass} value={controlId} onChange={(e) => setControlId(e.target.value)}>
                <option value="">Select control…</option>
                {controlsForRisk.map((c) => (
                  <option key={c.control_id} value={c.control_id}>
                    {c.description}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Test procedure" hint="Pick from the library, or draft a new one below if none fits.">
            <select className={inputClass} value={procedureId} onChange={(e) => setProcedureId(e.target.value)} disabled={!controlId}>
              <option value="">Draft new procedure instead…</option>
              {proceduresForControl.map((p) => (
                <option key={p.procedure_id} value={p.procedure_id}>
                  {p.description}
                </option>
              ))}
            </select>
          </Field>
          {!procedureId && (
            <Field label="Draft procedure steps">
              <textarea className={inputClass} rows={2} value={draftProcedure} onChange={(e) => setDraftProcedure(e.target.value)} />
            </Field>
          )}
          <Field label="Expected evidence">
            <input className={inputClass} value={expectedEvidence} onChange={(e) => setExpectedEvidence(e.target.value)} />
          </Field>
          <div className="flex justify-end">
            <Button onClick={submit}>Save RCM row</Button>
          </div>
        </Card>
      )}

      {rcmEntries.length === 0 ? (
        <EmptyState title="No RCM rows yet" description="Draft the risk-control matrix for this engagement." />
      ) : (
        rcmEntries.map((rcm) => <RcmRow key={rcm.rcm_id} rcmId={rcm.rcm_id} role={role} onReview={() => reviewRcmEntry(rcm.rcm_id)} />)
      )}
    </div>
  )
}

function RcmRow({ rcmId, role, onReview }: { rcmId: string; role: RoleName; onReview: () => void }) {
  const { state, getRisk, getControl, getUser, addSample, addTestResult } = useData()
  const rcm = state.rcmEntries.find((r) => r.rcm_id === rcmId)!
  const procedure = state.testProcedures.find((p) => p.procedure_id === rcm.test_procedure_id)
  const sample = state.samples.find((s) => s.rcm_id === rcmId)
  const results = state.testResults.filter((r) => r.rcm_id === rcmId)

  const [sampleForm, setSampleForm] = useState({ population_size: 50, sample_method: 'attribute', refs: '' })
  const [resultForm, setResultForm] = useState<{ sample_ref: string; evidence_ref: string; result: TestResultValue }>({
    sample_ref: '',
    evidence_ref: '',
    result: 'pass',
  })

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-800">{getRisk(rcm.risk_id)?.description}</p>
          <p className="text-xs text-slate-400">Control: {getControl(rcm.control_id)?.description}</p>
          <p className="mt-1 text-xs text-slate-500">
            Procedure: {procedure?.description ?? rcm.test_procedure_draft ?? '—'} · Expected evidence: {rcm.expected_evidence}
          </p>
        </div>
        {rcm.reviewed_by ? (
          <Badge tone="green">Reviewed by {getUser(rcm.reviewed_by)?.name}</Badge>
        ) : can(role, 'rcm.edit') ? (
          <Button size="sm" variant="secondary" onClick={onReview}>
            Mark reviewed
          </Button>
        ) : (
          <Badge tone="amber">Awaiting review</Badge>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Sample</p>
        {sample ? (
          <p className="text-sm text-slate-600">
            {sample.sample_method.replace(/_/g, ' ')} sample of {sample.sample_refs.length} from a population of {sample.population_size}:{' '}
            <span className="font-mono text-xs">{sample.sample_refs.join(', ')}</span>
          </p>
        ) : can(role, 'sample.create') ? (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Population size">
              <input
                type="number"
                className={`${inputClass} w-28`}
                value={sampleForm.population_size}
                onChange={(e) => setSampleForm({ ...sampleForm, population_size: Number(e.target.value) })}
              />
            </Field>
            <Field label="Method">
              <select className={inputClass} value={sampleForm.sample_method} onChange={(e) => setSampleForm({ ...sampleForm, sample_method: e.target.value })}>
                <option value="attribute">Attribute</option>
                <option value="risk_weighted">Risk-weighted</option>
                <option value="random">Random</option>
              </select>
            </Field>
            <Field label="Sample refs (comma-separated)">
              <input className={`${inputClass} w-64`} value={sampleForm.refs} onChange={(e) => setSampleForm({ ...sampleForm, refs: e.target.value })} placeholder="REC-001, REC-002" />
            </Field>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const refs = sampleForm.refs.split(',').map((r) => r.trim()).filter(Boolean)
                if (refs.length === 0) return
                addSample(rcmId, sampleForm.population_size, sampleForm.sample_method, refs)
              }}
            >
              Generate sample
            </Button>
          </div>
        ) : (
          <Locked reason={`Requires ${roleLabels['auditor']}`} />
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Test results</p>
        {results.length > 0 && (
          <table className="mb-3 w-full text-left text-xs">
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.result_id}>
                  <td className="py-1.5 pr-3 font-mono text-slate-500">{r.sample_ref}</td>
                  <td className="py-1.5 pr-3">
                    <StatusBadge status={r.result} />
                  </td>
                  <td className="py-1.5 pr-3 text-slate-400">{r.evidence_ref ?? '—'}</td>
                  <td className="py-1.5 text-slate-400">{getUser(r.tested_by)?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {sample && can(role, 'testResult.create') && (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Sample ref">
              <select className={inputClass} value={resultForm.sample_ref} onChange={(e) => setResultForm({ ...resultForm, sample_ref: e.target.value })}>
                <option value="">Select…</option>
                {sample.sample_refs.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Result">
              <select
                className={inputClass}
                value={resultForm.result}
                onChange={(e) => setResultForm({ ...resultForm, result: e.target.value as TestResultValue })}
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="exception">Exception</option>
              </select>
            </Field>
            <Field label="Evidence ref">
              <input className={`${inputClass} w-48`} value={resultForm.evidence_ref} onChange={(e) => setResultForm({ ...resultForm, evidence_ref: e.target.value })} />
            </Field>
            <Button
              size="sm"
              onClick={() => {
                if (!resultForm.sample_ref) return
                addTestResult({ rcm_id: rcmId, ...resultForm })
                setResultForm({ sample_ref: '', evidence_ref: '', result: 'pass' })
              }}
            >
              Record result
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

function ExceptionCard({
  exceptionId,
  status,
  description,
  severity,
  rootCause,
  sampleRef,
  riskLabel,
  controlLabel,
  canValidate,
}: {
  exceptionId: string
  status: string
  description: string
  severity: ExceptionSeverity | null
  rootCause: string | null
  sampleRef: string | null
  riskLabel?: string
  controlLabel?: string
  canValidate: boolean
}) {
  const { validateException } = useData()
  const [desc, setDesc] = useState(description)
  const [sev, setSev] = useState<ExceptionSeverity>(severity ?? 'medium')
  const [cause, setCause] = useState(rootCause ?? '')

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {riskLabel} <span className="text-slate-300">·</span> <span className="font-normal text-slate-500">{controlLabel}</span>
          </p>
          <p className="text-xs text-slate-400">Sample: {sampleRef ?? '—'}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === 'pending_review' ? (
        canValidate ? (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
            <Field label="Factual description">
              <textarea className={inputClass} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Severity">
                <select className={inputClass} value={sev} onChange={(e) => setSev(e.target.value as ExceptionSeverity)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Field>
              <Field label="Root cause">
                <input className={inputClass} value={cause} onChange={(e) => setCause(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => validateException(exceptionId, { status: 'false_positive', severity: null, root_cause: null })}>
                Mark false positive
              </Button>
              <Button size="sm" disabled={!cause.trim()} onClick={() => validateException(exceptionId, { status: 'validated', severity: sev, root_cause: cause })}>
                Validate as exception
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-600">{description || 'No description recorded yet.'}</p>
            <Locked reason={`Requires ${roleLabels['auditor']} to validate`} />
          </div>
        )
      ) : (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600">{description}</p>
          {rootCause && <p className="mt-1 text-xs text-slate-400">Root cause: {rootCause}</p>}
        </div>
      )}
    </Card>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  )
}
