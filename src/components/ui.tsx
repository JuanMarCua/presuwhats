import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'whatsapp' | 'ghost' | 'dark' | 'danger-ghost' }
export function Btn({ variant = 'primary', className = '', ...props }: BtnProps) {
  const base = 'btn-big inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition active:scale-[0.98] disabled:opacity-50'
  const styles: Record<string, string> = {
    primary: 'bg-green-600 text-white shadow-sm active:bg-green-700',
    whatsapp: 'bg-[#25D366] text-white shadow-sm active:bg-[#1eb856]',
    dark: 'bg-slate-900 text-white active:bg-slate-800',
    ghost: 'border border-slate-300 bg-white text-slate-700 active:bg-slate-50',
    'danger-ghost': 'border border-red-200 bg-white text-red-600 active:bg-red-50',
  }
  return <button {...props} className={`${base} ${styles[variant]} ${className}`} />
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? <p className="mt-1 text-sm font-medium text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`input-big w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`input-big w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 ${props.className ?? ''}`}
    />
  )
}

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string; sub?: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-3 py-3 text-left transition ${value === o.value ? 'border-green-600 bg-green-50 ring-2 ring-green-100' : 'border-slate-300 bg-white'}`}>
          <span className={`block text-sm font-bold ${value === o.value ? 'text-green-700' : 'text-slate-700'}`}>{o.label}</span>
          {o.sub && <span className="block text-xs text-slate-400">{o.sub}</span>}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">{icon}</div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-60 text-sm text-slate-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
      {msg}
    </div>
  )
}
