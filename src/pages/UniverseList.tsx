import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function UniverseList() {
  const { state, currentUser, getOrgUnit, createDraftEntity, confirmEntity } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', org_unit_id: state.orgUnits[0]?.org_unit_id ?? '', description: '' })

  const entities = [...state.auditUniverseEntities].sort((a, b) => b.created_at.localeCompare(a.created_at))

  function submit() {
    if (!form.name.trim() || !form.org_unit_id) return
    createDraftEntity(form)
    setForm({ name: '', org_unit_id: state.orgUnits[0]?.org_unit_id ?? '', description: '' })
    setShowForm(false)
  }

  return (
    <div>
      <PageHeader
        title="Audit Universe"
        description="Manual entity creation and confirmation — Phase 1 in scope. Confirmed entities perform the rule-based direct-ID join to ERM risks."
        actions={
          can(role, 'entity.create') ? (
            <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New entity'}</Button>
          ) : (
            <Locked reason={`Requires ${roleLabels['auditor']} or ${roleLabels['audit_manager']}`} />
          )
        }
      />

      {showForm && (
        <Card className="mb-6 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Entity name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Treasury Operations" />
            </Field>
            <Field label="Org unit">
              <select className={inputClass} value={form.org_unit_id} onChange={(e) => setForm({ ...form, org_unit_id: e.target.value })}>
                {state.orgUnits.map((o) => (
                  <option key={o.org_unit_id} value={o.org_unit_id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={submit}>Save as draft</Button>
          </div>
        </Card>
      )}

      {entities.length === 0 ? (
        <EmptyState title="No entities yet" description="Create the first candidate entity for the audit universe." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Org unit</th>
                <th className="px-4 py-3 font-medium">Risk score</th>
                <th className="px-4 py-3 font-medium">Last audit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entities.map((e) => (
                <tr key={e.entity_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/universe/${e.entity_id}`} className="font-medium text-slate-800 hover:underline">
                      {e.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{e.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{getOrgUnit(e.org_unit_id)?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{e.current_risk_score ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{e.last_audit_date ? new Date(e.last_audit_date).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.status === 'draft' &&
                      (can(role, 'entity.confirm') ? (
                        <Button size="sm" variant="secondary" onClick={() => confirmEntity(e.entity_id)}>
                          Confirm
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-300">Awaiting confirmation</span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
