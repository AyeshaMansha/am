import { NavLink, Outlet } from 'react-router-dom'
import { useData } from '../state/store'
import { roleLabels } from '../lib/rbac'
import type { RoleName } from '../types'

const nav = [
  { to: '/', label: 'Dashboard', end: true, icon: '⌂' },
  { to: '/universe', label: 'Audit Universe', icon: '◈' },
  { to: '/planning', label: 'Audit Planning', icon: '☷' },
  { to: '/engagements', label: 'Engagements', icon: '⚙' },
  { to: '/findings', label: 'Findings', icon: '⚠' },
  { to: '/corrective-actions', label: 'Follow-up', icon: '→' },
  { to: '/reports', label: 'Reports', icon: '☷' },
]

const allRoles: RoleName[] = ['auditor', 'audit_manager', 'control_owner', 'risk_owner', 'audit_committee', 'admin']

export function Layout() {
  const { currentUser, setCurrentRole, resetDemoData, state } = useData()
  const role = state.roles.find((r) => r.role_id === currentUser.role_id)?.name ?? 'auditor'

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">S</div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-900">Sahl</p>
            <p className="text-[11px] leading-tight text-slate-400">ERM &amp; Audit Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="w-4 text-center text-xs opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Phase 1 — Core Loop</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-400">Manual workflow, no AI/automation. Proves the ERM ↔ Audit loop end-to-end.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-400">AI-Backed ERM &amp; Audit Management &mdash; MVP demo</div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetDemoData}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Reset demo data to the original seed"
            >
              Reset demo data
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Viewing as</span>
              <select
                className="rounded-lg border border-slate-300 bg-white py-1.5 pl-2.5 pr-7 text-sm font-medium text-slate-800 focus:border-slate-500 focus:outline-none"
                value={role}
                onChange={(e) => setCurrentRole(e.target.value as RoleName)}
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
