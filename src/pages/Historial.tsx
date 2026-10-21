import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Empty, Input, StatCard } from '../components/ui'
import { calcTotals, eur, waLink, waReminderText, type QuoteStatus } from '../lib/quotes'
import { nextQuoteNumber, useStore } from '../store'

type Filter = 'todos' | QuoteStatus

export default function Historial() {
  const nav = useNavigate()
  const { profile, quotes, addQuote, updateQuote, deleteQuote } = useStore()
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const loadDemo = () => {
    const id = `demo-${Date.now()}`
    addQuote({
      id,
      number: nextQuoteNumber(profile.nextNumber || quotes.length + 1),
      clientName: 'María García',
      clientPhone: '647123456',
      lines: [
        { desc: 'Cambiar grifo cocina (material incluido)', qty: 1, price: 85 },
        { desc: 'Mano de obra fontanería', qty: 2, price: 32 },
      ],
      ivaRate: 0.21,
      notes: 'Plazo 3-5 días. Presupuesto válido 15 días.',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      sentAt: null,
      remindedAt: null,
    })
    nav(`/p/${id}`)
  }

  const stats = useMemo(() => {
    let pending = 0, accepted = 0, acceptedEur = 0, monthEur = 0
    const m = new Date().toISOString().slice(0, 7)
    for (const q of quotes) {
      const t = calcTotals(q.lines, q.ivaRate).total
      if (q.status === 'pendiente') pending++
      if (q.status === 'aceptado') { accepted++; acceptedEur += t }
      if (q.createdAt.slice(0, 7) === m) monthEur += t
    }
    return { pending, accepted, acceptedEur, monthEur, total: quotes.length }
  }, [quotes])

  const list = quotes.filter((q) => {
    if (filter !== 'todos' && q.status !== filter) return false
    if (query && !(q.clientName + q.number).toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const exportCSV = () => {
    const rows = ['numero;cliente;telefono;total;iva;estado;fecha']
    for (const q of quotes) {
      const t = calcTotals(q.lines, q.ivaRate)
      rows.push([q.number, q.clientName, q.clientPhone, t.total.toFixed(2), (q.ivaRate * 100).toFixed(0) + '%', q.status, q.createdAt.slice(0, 10)].join(';'))
    }
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'presupuestos.csv'
    a.click()
  }

  if (quotes.length === 0) {
    return (
      <div className="space-y-4 rise">
        <Card className="p-6 text-center overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-4 text-2xl">🧾</div>
          <h2 className="text-2xl font-extrabold leading-tight mb-2">Sin presupuestos aún</h2>
          <p className="text-sm opacity-90 leading-relaxed">Crea tu primer presupuesto en menos de un minuto y envíalo por WhatsApp.</p>
          <Btn variant="outline" className="mt-4 w-auto text-white border-white/30 hover:bg-white/20" onClick={() => nav('/nuevo')}>Crear presupuesto</Btn>
          <button onClick={loadDemo} className="mt-2 w-auto text-xs font-bold text-emerald-100 hover:text-white">Ver ejemplo: grifo 180,29 € →</button>
        </Card>
        <Btn className="w-full" onClick={() => nav('/nuevo')}>+ Nuevo presupuesto</Btn>
        <button onClick={() => nav('/ajustes')} className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600">Primero configurar mi negocio</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rise grid grid-cols-2 gap-3">
        <StatCard label="Pendientes" value={String(stats.pending)} icon="⏳" trend={stats.pending > 0 ? `${stats.pending} por cerrar` : 'Todos cerrados'} />
        <StatCard label="Aceptados" value={String(stats.accepted)} icon="✅" trend={eur(stats.acceptedEur)} />
        <StatCard label="Este mes" value={eur(stats.monthEur)} icon="📅" trend={`${stats.total} totales`} />
      </div>

      <div className="rise rise-1">
        <Input
          placeholder="Buscar cliente o número..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-slate-400 pointer-events-none">🔍</div>
      </div>

      <div className="rise rise-2 flex gap-1">
        {(['todos', 'pendiente', 'aceptado', 'rechazado'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}>
            {f === 'todos' ? `Todos (${quotes.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {list.length === 0 && <Empty icon="🔍" title="Sin resultados" body="Prueba con otro filtro o busca otro término." />}

      <div className="rise rise-3 space-y-2">
        {list.map((q) => {
          const t = calcTotals(q.lines, q.ivaRate)
          const days = Math.floor((Date.now() - new Date(q.createdAt).getTime()) / 86400000)
          const needsNudge = q.status === 'pendiente' && days >= 2 && !q.remindedAt
          return (
            <Card key={q.id} className="!p-3.5 hover:shadow-md transition-all group border-slate-100">
              <button onClick={() => nav(`/p/${q.id}`)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold text-slate-800">{q.clientName}</p>
                    <p className="text-xs text-slate-400">{q.number} · hace {days === 0 ? 'hoy' : `${days}d`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-extrabold text-emerald-700">{eur(t.total)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${q.status === 'aceptado' ? 'bg-emerald-100 text-emerald-700' : q.status === 'rechazado' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{q.status}</span>
                  </div>
                </div>
              </button>
              <div className="mt-2.5 flex gap-1.5">
                <a href={waLink(q.clientPhone, waReminderText(q, t.total))} target="_blank" rel="noreferrer"
                  onClick={() => updateQuote(q.id, { remindedAt: new Date().toISOString() })}
                  className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-all ${needsNudge ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {needsNudge ? 'Recordar ahora' : 'Recordatorio'}
                </a>
                <button onClick={() => updateQuote(q.id, { status: q.status === 'aceptado' ? 'pendiente' : 'aceptado' })}
                  className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-all ${q.status === 'aceptado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {q.status === 'aceptado' ? 'Aceptado ✓' : 'Marcar ✓'}
                </button>
                {confirmDel === q.id ? (
                  <button onClick={() => deleteQuote(q.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">¿Borrar?</button>
                ) : (
                  <button onClick={() => { setConfirmDel(q.id); setTimeout(() => setConfirmDel(null), 3000) }} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-200">X</button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Btn className="w-full" onClick={() => nav('/nuevo')}>+ Nuevo presupuesto</Btn>
      <Btn variant="ghost" onClick={exportCSV} className="!px-3 w-auto">CSV</Btn>
      <span className="text-xs font-bold text-slate-600 flex-shrink-0">🔒 Local-first: tus datos permanecen en el móvil</span>
    </div>
  )
}
