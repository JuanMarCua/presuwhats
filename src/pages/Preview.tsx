import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Card } from '../components/ui'
import { calcTotals, eur, waLink, waNewQuoteText, waReminderText } from '../lib/quotes'
import { nextQuoteNumber, useStore } from '../store'

export default function Preview() {
  const { id } = useParams()
  const nav = useNavigate()
  const { profile, quotes, addQuote, updateQuote } = useStore()
  const [copied, setCopied] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [shared, setShared] = useState(false)
  const [signature, setSignature] = useState<string | null>(() => q?.signatureB64 ?? null)
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const sigRef = useRef<HTMLCanvasElement>(null)
  const q = quotes.find((x) => x.id === id)

  if (!q) {
    return (
      <Card>
        <h2 className="font-extrabold">Presupuesto no encontrado</h2>
        <Btn className="mt-4 w-full" onClick={() => nav('/')}>Ir al historial</Btn>
      </Card>
    )
  }

  const totals = calcTotals(q.lines, q.ivaRate)
  const fecha = new Date(q.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const waText = waNewQuoteText(q, totals.total)
  const waUrl = waLink(q.clientPhone, waText)
  const markSent = () => updateQuote(q.id, { sentAt: new Date().toISOString() })
  const markReminded = () => updateQuote(q.id, { remindedAt: new Date().toISOString() })

  // Firma cliente (canvas)
  useEffect(() => {
    const canvas = sigRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    sigPoints.forEach((stroke) => {
      if (stroke.length === 0) return
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y)
      ctx.stroke()
    })
  }, [sigPoints])

  const saveSignature = () => {
    if (!sigRef.current) return
    const data = sigRef.current.toDataURL('image/png')
    setSignature(data)
    updateQuote(q.id, { signatureB64: data })
  }
  const clearSignature = () => {
    setSigPoints([])
    setSignature(null)
    const canvas = sigRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    updateQuote(q.id, { signatureB64: undefined })
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const rect = sigRef.current!.getBoundingClientRect()
    setSigPoints([[{ x: e.clientX - rect.left, y: e.clientY - rect.top }]])
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !sigRef.current) return
    const rect = sigRef.current.getBoundingClientRect()
    setSigPoints((pts) => {
      const last = pts[pts.length - 1]
      last.push({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      return [...pts]
    })
  }
  const onPointerUp = () => setIsDrawing(false)
  const copyText = async () => {
    try { await navigator.clipboard.writeText(waText); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* noop */ }
  }
  const shareNative = async () => {
    const text = waText
    const nav2 = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> }
    if (typeof nav2.share === 'function') {
      try {
        await nav2.share({ title: `Presupuesto ${q!.number}`, text })
        setShared(true); markSent(); setTimeout(() => setShared(false), 2000)
      } catch { /* user cancelled */ }
    } else {
      copyText()
    }
  }
  const canShare = typeof (navigator as unknown as { share?: unknown }).share === 'function'
  const duplicate = () => {
    const copy: Parameters<typeof addQuote>[0] = {
      id: `${Date.now()}`,
      number: nextQuoteNumber(profile.nextNumber || quotes.length + 1),
      clientName: q!.clientName,
      clientPhone: q!.clientPhone,
      lines: q!.lines.map((l) => ({ ...l })),
      ivaRate: q!.ivaRate,
      notes: q!.notes,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      sentAt: null,
      remindedAt: null,
    }
    addQuote(copy)
    nav(`/p/${copy.id}`)
  }
  const downloadPDF = async () => {
    if (pdfBusy) return
    setPdfBusy(true)
    try {
      const { generateQuotePDF } = await import('../lib/pdf')
      generateQuotePDF(profile, q)
    } finally {
      setPdfBusy(false)
    }
  }
  return (
    <div className="space-y-3">
      <div className="print-sheet rise overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 bg-green-600 px-4 py-3.5 text-white">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold">{profile.name || 'Mi negocio'}</p>
            <p className="text-[11px] opacity-90">{[profile.phone, profile.email].filter(Boolean).join(' - ')}</p>
          </div>
          {profile.logoB64 && <img src={profile.logoB64} alt="Logo" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />}
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Presupuesto {q.number}</h2>
              <p className="text-xs text-slate-400">{fecha}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${q.status === 'aceptado' ? 'bg-green-100 text-green-700' : q.status === 'rechazado' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
              {q.status.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 rounded-xl bg-green-50/70 px-3 py-2.5 text-sm">
            <p className="text-xs font-bold uppercase text-green-700">Cliente</p>
            <p className="font-bold">{q.clientName} <span className="font-normal text-slate-500">{q.clientPhone}</span></p>
          </div>
          <div className="mt-3 divide-y divide-slate-100 text-sm">
            {q.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-3 py-2">
                <p className="flex-1"><span className="font-bold text-slate-300">{i + 1}. </span>{l.desc}<span className="text-slate-400"> x {l.qty}</span></p>
                <p className="font-bold">{eur(Math.round(l.qty * l.price * 100) / 100)}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-xl bg-slate-900 p-3.5 text-white">
            <div className="flex justify-between text-xs opacity-80"><span>Base imponible</span><span>{eur(totals.subtotal)}</span></div>
            <div className="flex justify-between text-xs opacity-80"><span>IVA {q.ivaRate === 0.21 ? '21%' : '10%'}</span><span>{eur(totals.iva)}</span></div>
            <div className="mt-1 flex justify-between text-xl font-extrabold"><span>TOTAL</span><span>{eur(totals.total)}</span></div>
          </div>
          {q.notes && <p className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[13px] text-slate-600">{q.notes}</p>}
          {q.photosB64?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {q.photosB64.map((p, i) => (
                <img key={i} src={p} alt={`Foto ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3 items-start">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-400">Firma del cliente</label>
              <div className="border border-slate-300 rounded-lg bg-white">
                <canvas
                  ref={sigRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  className="w-full h-24 block cursor-crosshair"
                  width={340}
                  height={110}
                />
              </div>
              {signature && <p className="mt-1 text-[10px] text-green-700 font-medium">Firma guardada en este presupuesto</p>}
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Btn variant="ghost" onClick={saveSignature} disabled={!signature && sigPoints.length === 0}>Guardar firma</Btn>
              <Btn variant="danger-ghost" onClick={clearSignature}>Limpiar</Btn>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{profile.conditions || 'Presupuesto valido 15 dias.'} Este documento es un presupuesto, no una factura.</p>
        </div>
      </div>
      <div className="rise rise-1 space-y-2">
        <a href={waUrl} target="_blank" rel="noreferrer" onClick={markSent}
          className="btn-big flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-white shadow-sm">
          <span className="text-lg">W</span> Enviar por WhatsApp
        </a>
        {canShare && (
          <Btn variant="dark" className="w-full" onClick={shareNative}>{shared ? 'Compartido ✓' : 'Compartir (WhatsApp, Telegram, Email...)'}</Btn>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="dark" onClick={downloadPDF}>{pdfBusy ? 'Generando...' : 'PDF'}</Btn>
          <Btn variant="ghost" onClick={() => window.print()}>Imprimir</Btn>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="ghost" onClick={copyText}>{copied ? 'Copiado' : 'Copiar texto'}</Btn>
          <a href={waLink(q.clientPhone, waReminderText(q, totals.total))} target="_blank" rel="noreferrer" onClick={markReminded}
            className="btn-big inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700">
            Recordatorio
          </a>
        </div>
        {q.sentAt && <p className="text-center text-xs text-slate-400">Enviado el {new Date(q.sentAt).toLocaleDateString('es-ES')}</p>}
      </div>
      <Card className="rise rise-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Estado del trabajo</p>
        <div className="grid grid-cols-3 gap-2">
          {(['pendiente', 'aceptado', 'rechazado'] as const).map((s) => (
            <button key={s} onClick={() => updateQuote(q.id, { status: s })}
              className={`rounded-xl border px-2 py-2.5 text-sm font-extrabold capitalize ${q.status === s ? (s === 'aceptado' ? 'border-green-600 bg-green-50 text-green-700' : s === 'rechazado' ? 'border-red-400 bg-red-50 text-red-600' : 'border-amber-400 bg-amber-50 text-amber-700') : 'border-slate-200 bg-white text-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>
        <Btn variant="ghost" className="mt-3 w-full" onClick={() => nav('/')}>Volver al historial</Btn>
        <Btn variant="ghost" className="mt-2 w-full" onClick={duplicate}>Duplicar para otro cliente</Btn>
      </Card>
    </div>
  )
}
