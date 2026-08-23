import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/store'
import { can, roleLabels } from '../lib/rbac'
import { Button, Card, EmptyState, Field, inputClass, Locked, PageHeader, StatusBadge } from '../components/ui'
import type { RoleName } from '../types'

export function PlanningList() {
  const { state, currentUser, createPlan } = useData()
  const role = (state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor') as RoleName
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState('')

  const plans = [...state.auditPlans].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div>
      <PageHeader
        title="Audit Planning"
        description="Manual plan creation, per-entity resourcing, and the Audit Manager approval → Committee ratification workflow."
        actions={
          can(role, 'plan.create') ? (
            <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New plan'}</Button>
          ) : (
            <Locked reason={`Requires ${roleLabels['audit_manager']}`} />
          )
        }
      />

      {showForm && (
        <Card className="mb-6 flex flex-wrap items-end gap-3 p-5">
          <Field label="Period" hint="e.g. 2027-Q1, FY2027-H1">
            <input className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2027-Q1" />
          </Field>
          <Button
            onClick={() => {
              if (!period.trim()) return
              createPlan(period)
              setPeriod('')
              setShowForm(false)
            }}
          >
            Create draft plan
          </Button>
        </Card>
      )}

      {plans.length === 0 ? (
        <EmptyState title="No audit plans yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Entities</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Committee ratified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => {
                const count = state.auditPlanEntities.filter((pe) => pe.plan_id === p.plan_id).length
                return (
                  <tr key={p.plan_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/planning/${p.plan_id}`} className="font-medium text-slate-800 hover:underline">
                        {p.period}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{count}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.committee_ratified_at ? new Date(p.committee_ratified_at).toLocaleDateString() : '—'}</td>
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
