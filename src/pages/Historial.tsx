import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Empty, Input } from '../components/ui'
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
      <div className="space-y-4">
        <div className="rise overflow-hidden rounded-3xl bg-slate-900 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">Burgos - Fontaneros, electricistas, pintores</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">Presupuestos pro en 60 segundos</h2>
          <p className="mt-2 text-sm opacity-80">Con tu logo, IVA automatico y envio por WhatsApp. Sin Excel, sin esperar 3 dias.</p>
          <Btn className="mt-4 w-full" onClick={() => nav('/nuevo')}>Crear mi primer presupuesto</Btn>
          <button onClick={loadDemo} className="mt-2 w-full rounded-xl border border-white/25 py-3 text-center text-sm font-bold text-green-300">Ver ejemplo: grifo 180,29 € →</button>
          <button onClick={() => nav('/ajustes')} className="mt-2 w-full text-center text-sm font-bold text-green-300">Primero configurar mi negocio (1 min)</button>
        </div>
        <div className="rise rise-1 grid grid-cols-3 gap-2 text-center">
          {[['60s', 'por presupuesto'], ['PDF', 'con tu logo'], ['WA', 'envio + recordatorio']].map(([a, b]) => (
            <Card key={a} className="!p-3"><p className="text-lg font-extrabold text-green-700">{a}</p><p className="text-[11px] text-slate-500">{b}</p></Card>
          ))}
        </div>
        <Empty icon="P" title="Aun no hay presupuestos" body="Cuando crees el primero aparecera aqui con su estado y total." />
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="rise grid grid-cols-2 gap-2">
        <Card className="!p-3.5"><p className="text-[11px] font-bold uppercase text-slate-400">Este mes</p><p className="text-xl font-extrabold">{eur(stats.monthEur)}</p><p className="text-xs text-slate-400">{stats.total} presupuestos</p></Card>
        <Card className="!p-3.5"><p className="text-[11px] font-bold uppercase text-slate-400">Aceptados</p><p className="text-xl font-extrabold text-green-700">{eur(stats.acceptedEur)}</p><p className="text-xs text-slate-400">{stats.accepted} trabajos - {stats.pending} pendientes</p></Card>
      </div>
      <div className="rise rise-1 flex gap-2">
        <div className="flex-1"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente o numero..." /></div>
        <Btn variant="ghost" onClick={exportCSV} className="!px-3">CSV</Btn>
        <span className="text-xs font-bold text-slate-600 flex-shrink-0">🔒 Local-first: tus datos permanecen en el móvil</span>
      </div>
      <div className="rise rise-1 flex gap-1.5">
        {(['todos', 'pendiente', 'aceptado', 'rechazado'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-extrabold capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            {f === 'todos' ? `Todos (${quotes.length})` : f}
          </button>
        ))}
      </div>
      {list.length === 0 && <Empty icon="S" title="Sin resultados" body="Prueba con otro filtro o busqueda." />}
      <div className="space-y-2.5">
        {list.map((q) => {
          const t = calcTotals(q.lines, q.ivaRate)
          const days = Math.floor((Date.now() - new Date(q.createdAt).getTime()) / 86400000)
          const needsNudge = q.status === 'pendiente' && days >= 2 && !q.remindedAt
          return (
            <Card key={q.id} className="rise !p-3.5">
              <button onClick={() => nav(`/p/${q.id}`)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold">{q.clientName}</p>
                    <p className="text-xs text-slate-400">{q.number} - hace {days === 0 ? 'hoy' : `${days}d`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-extrabold text-green-700">{eur(t.total)}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${q.status === 'aceptado' ? 'bg-green-100 text-green-700' : q.status === 'rechazado' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{q.status}</span>
                  </div>
                </div>
              </button>
              <div className="mt-2.5 flex gap-1.5">
                <a href={waLink(q.clientPhone, waReminderText(q, t.total))} target="_blank" rel="noreferrer"
                  onClick={() => updateQuote(q.id, { remindedAt: new Date().toISOString() })}
                  className={`flex-1 rounded-xl px-2 py-2.5 text-center text-xs font-extrabold ${needsNudge ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {needsNudge ? 'Recordar ahora' : 'Recordatorio'}
                </a>
                <button onClick={() => updateQuote(q.id, { status: q.status === 'aceptado' ? 'pendiente' : 'aceptado' })}
                  className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-extrabold ${q.status === 'aceptado' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {q.status === 'aceptado' ? 'Aceptado ✓' : 'Marcar ✓'}
                </button>
                {confirmDel === q.id ? (
                  <button onClick={() => deleteQuote(q.id)} className="rounded-xl bg-red-600 px-3 py-2.5 text-xs font-extrabold text-white">Borrar?</button>
                ) : (
                  <button onClick={() => { setConfirmDel(q.id); setTimeout(() => setConfirmDel(null), 3000) }} className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-400">X</button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
      <Btn onClick={() => nav('/nuevo')} className="w-full">+ Nuevo presupuesto</Btn>
    </div>
  )
}

