import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function EntityDetail() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const { state, currentUser, getEntity, getOrgUnit, getRisk, getUser, confirmEntity, addManualRiskLink, confirmRiskLink, setAdjustedScore } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName

  const entity = getEntity(entityId)
  const [tab, setTab] = useState<'overview' | 'risks' | 'score'>('overview')
  const [manualRiskId, setManualRiskId] = useState('')
  const [scoreDraft, setScoreDraft] = useState<number>(3)
  const [rationale, setRationale] = useState('')
  const [rationaleError, setRationaleError] = useState('')

  if (!entity) {
    return <EmptyState title="Entity not found" description="It may have been removed from the demo data." />
  }

  const links = state.entityRiskMap.filter((m) => m.entity_id === entity.entity_id)
  const registerEntry = state.auditRiskRegister.find((r) => r.entity_id === entity.entity_id)
  const linkedRiskIds = new Set(links.map((l) => l.risk_id))
  const availableRisks = state.risks.filter((r) => r.org_unit_id === entity.org_unit_id && !linkedRiskIds.has(r.risk_id))

  function submitScore() {
    if (!rationale.trim()) {
      setRationaleError('Adjustment rationale is required before a score can be recorded.')
      return
    }
    setAdjustedScore(entity!.entity_id, scoreDraft, rationale)
    setRationale('')
    setRationaleError('')
  }

  return (
    <div>
      <button onClick={() => navigate('/universe')} className="mb-3 text-xs text-slate-400 hover:text-slate-600">
        ← Back to Audit Universe
      </button>
      <PageHeader
        title={entity.name}
        description={entity.description}
        actions={
          entity.status === 'draft' ? (
            can(role, 'entity.confirm') ? (
              <Button onClick={() => confirmEntity(entity.entity_id)}>Confirm entity</Button>
            ) : (
              <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
            )
          ) : (
            <StatusBadge status={entity.status} />
          )
        }
      />

      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {(['overview', 'risks', 'score'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'risks' ? `Risk links (${links.length})` : 'Audit risk register'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
          <Info label="Org unit" value={getOrgUnit(entity.org_unit_id)?.name ?? '—'} />
          <Info label="Status" value={<StatusBadge status={entity.status} />} />
          <Info label="Current risk score" value={entity.current_risk_score ?? '—'} />
          <Info label="Last audit" value={entity.last_audit_date ? new Date(entity.last_audit_date).toLocaleDateString() : 'Never'} />
          <Info label="Audit cycle" value={`${entity.audit_cycle_months} months`} />
          <Info label="Confirmed by" value={entity.confirmed_by ? getUser(entity.confirmed_by)?.name : '—'} />
        </Card>
      )}

      {tab === 'risks' && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            {links.length === 0 ? (
              <EmptyState title="No risk links yet" description={entity.status === 'draft' ? 'Confirm the entity to run the direct ID join to ERM risks.' : 'No matching risks were found — add one manually below.'} />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Risk</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Match type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {links.map((l) => {
                    const r = getRisk(l.risk_id)
                    return (
                      <tr key={l.id}>
                        <td className="px-4 py-3 font-medium text-slate-800">{r?.description}</td>
                        <td className="px-4 py-3 capitalize text-slate-500">{r?.category}</td>
                        <td className="px-4 py-3 text-slate-500">{l.match_type === 'direct' ? 'Direct ID join' : 'Manual / fuzzy'}</td>
                        <td className="px-4 py-3">
                          {l.needs_manual_review ? <StatusBadge status="pending_review" /> : <StatusBadge status="confirmed" />}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {l.needs_manual_review &&
                            (can(role, 'riskLink.manage') ? (
                              <Button size="sm" variant="secondary" onClick={() => confirmRiskLink(l.id)}>
                                Confirm link
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-300">Needs auditor review</span>
                            ))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </Card>

          {availableRisks.length > 0 && can(role, 'riskLink.manage') && (
            <Card className="flex flex-wrap items-end gap-3 p-4">
              <Field label="Link an additional risk from this org unit" hint="Direct join covers same-name matches; use this for edge cases the join missed.">
                <select className={inputClass} value={manualRiskId} onChange={(e) => setManualRiskId(e.target.value)}>
                  <option value="">Select a risk…</option>
                  {availableRisks.map((r) => (
                    <option key={r.risk_id} value={r.risk_id}>
                      {r.description}
                    </option>
                  ))}
                </select>
              </Field>
              <Button
                variant="secondary"
                disabled={!manualRiskId}
                onClick={() => {
                  addManualRiskLink(entity.entity_id, manualRiskId)
                  setManualRiskId('')
                }}
              >
                Add link
              </Button>
            </Card>
          )}
        </div>
      )}

      {tab === 'score' && (
        <Card className="p-5">
          {!registerEntry ? (
            <EmptyState title="Not yet in the audit risk register" description="An entry is created once the entity is linked to ERM risk data." />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Info label="ERM residual score" value={registerEntry.erm_residual_score} />
                <Info label="Control effectiveness avg" value={registerEntry.control_effectiveness_avg ?? '—'} />
                <Info label="Prior findings" value={registerEntry.prior_findings_count} />
                <Info label="Months since last audit" value={registerEntry.months_since_last_audit ?? '—'} />
              </div>

              {registerEntry.adjusted_score != null && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current adjusted score</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{registerEntry.adjusted_score} / 5</p>
                  <p className="mt-2 text-sm text-slate-600">{registerEntry.adjustment_rationale}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Set by {getUser(registerEntry.adjusted_by)?.name} on {registerEntry.adjusted_at && new Date(registerEntry.adjusted_at).toLocaleString()}
                  </p>
                </div>
              )}

              {can(role, 'auditScore.adjust') ? (
                <div className="border-t border-slate-100 pt-5">
                  <p className="mb-3 text-sm font-medium text-slate-800">{registerEntry.adjusted_score != null ? 'Re-score' : 'Record the audit risk score'}</p>
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <Field label="Score (1–5)">
                      <select className={inputClass} value={scoreDraft} onChange={(e) => setScoreDraft(Number(e.target.value))}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Adjustment rationale (required)">
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={rationale}
                        onChange={(e) => {
                          setRationale(e.target.value)
                          if (rationaleError) setRationaleError('')
                        }}
                        placeholder="Cite the specific factors driving this score — fraud sensitivity, board attention, etc."
                      />
                      {rationaleError && <p className="mt-1 text-xs text-rose-600">{rationaleError}</p>}
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button onClick={submitScore}>Save score</Button>
                  </div>
                </div>
              ) : (
                <Locked reason={`Requires ${roleLabels['auditor']} — this is a professional-judgment step`} />
              )}
            </div>
          )}
        </Card>
      )}

      <p className="mt-6 text-xs text-slate-400">
        <Link to="/planning" className="hover:underline">
          Continue to Audit Planning →
        </Link>
      </p>
    </div>
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
