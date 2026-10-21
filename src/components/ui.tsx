import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function Card({ children, className = '', padding = 'p-5' }: { children: ReactNode; className?: string; padding?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${padding} ${className}`}>
      {children}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'whatsapp' | 'ghost' | 'dark' | 'danger-ghost' | 'outline' }
export function Btn({ variant = 'primary', className = '', ...props }: BtnProps) {
  const base = 'btn-big inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold transition-all active:scale-[0.96] disabled:opacity-60 disabled:pointer-events-none'
  const styles: Record<string, string> = {
    primary: 'bg-emerald-600 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.35)] active:bg-emerald-700 hover:shadow-[0_6px_16px_-2px_rgba(16,185,129,0.45)]',
    whatsapp: 'bg-[#25D366] text-white shadow-[0_4px_12px_-2px_rgba(37,211,102,0.35)] active:bg-[#1eb856] hover:shadow-[0_6px_16px_-2px_rgba(37,211,102,0.45)]',
    dark: 'bg-slate-900 text-white active:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.25)]',
    ghost: 'border border-slate-200 bg-white text-slate-700 active:bg-slate-50 hover:bg-slate-50',
    'danger-ghost': 'border border-red-200 bg-white text-red-600 active:bg-red-50 hover:bg-red-50',
    outline: 'border border-emerald-600 bg-transparent text-emerald-600 active:bg-emerald-50 hover:bg-emerald-50',
  }
  return <button {...props} className={`${base} ${styles[variant]} ${className}`} />
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700 tracking-tight">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`input-big w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all ${props.className ?? ''}`}
/>
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`input-big w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all ${props.className ?? ''}`}
/>
  )
}
export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string; sub?: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-3 py-3 text-left transition-all ${value === o.value
            ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
            : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
          <span className={`block text-sm font-bold ${value === o.value ? 'text-emerald-700' : 'text-slate-700'}`}>{o.label}</span>
          {o.sub && <span className={`block text-xs text-slate-400 mt-0.5`}>{o.sub}</span>}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-sm text-slate-500 leading-relaxed">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      {msg}
    </div>
  )
}

export function Badge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; className?: string }) {
  const styles: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatCard({ label, value, icon, trend, className = '' }: { label: string; value: string; icon: string; trend?: string; className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{value}</p>
          {trend && <p className="text-xs font-bold text-emerald-600">{trend}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">{icon}</div>
      </div>
    </Card>
  )
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-xl font-extrabold tracking-tight text-slate-900 mb-1 ${className}`}>{children}</h2>
  )
}

export function SectionSubtitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-slate-500 mb-5 ${className}`}>{children}</p>
  )
}

export function LineItem({ desc, qty, price, onEdit, onDelete }: { desc: string; qty: number; price: number; onEdit?: () => void; onDelete?: () => void }) {
  const total = qty * price
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{desc}</p>
        <p className="text-[11px] text-slate-400">× {qty}</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" aria-label="Editar">✏️</button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" aria-label="Eliminar">🗑️</button>
        )}
      </div>
    </div>
  )
}
