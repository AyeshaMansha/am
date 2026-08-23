import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeTones[tone]}`}>
      {children}
    </span>
  )
}

const statusTone: Record<string, keyof typeof badgeTones> = {
  draft: 'slate',
  pending_review: 'amber',
  pending_approval: 'amber',
  in_progress: 'blue',
  scoping: 'slate',
  fieldwork: 'blue',
  review: 'amber',
  reporting: 'purple',
  confirmed: 'green',
  approved: 'green',
  validated: 'green',
  complete: 'green',
  closed: 'green',
  issued: 'green',
  pass: 'green',
  effective: 'green',
  open: 'slate',
  overdue: 'red',
  fail: 'red',
  exception: 'red',
  false_positive: 'slate',
  rejected: 'red',
  archived: 'slate',
  ineffective: 'red',
  partially_effective: 'amber',
  not_tested: 'slate',
  low: 'slate',
  medium: 'amber',
  high: 'red',
  critical: 'red',
}

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone[status] ?? 'slate'
  return <Badge tone={tone}>{status.replace(/_/g, ' ')}</Badge>
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
  const sizes = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  const variants: Record<string, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500'

export function Locked({ children, reason }: { children?: ReactNode; reason: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400 ring-1 ring-inset ring-slate-200" title={reason}>
      {children ?? '🔒'} {reason}
    </span>
  )
}
