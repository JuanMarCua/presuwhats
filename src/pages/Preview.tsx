import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Card, Badge, LineItem } from '../components/ui'
import { calcTotals, eur, waLink, waNewQuoteText, waReminderText } from '../lib/quotes'
import { nextQuoteNumber, useStore } from '../store'

export default function Preview() {
  const { id } = useParams()
  const nav = useNavigate()
  const { profile, quotes, addQuote, updateQuote } = useStore()
  const [copied, setCopied] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [shared, setShared] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const sigRef = useRef<HTMLCanvasElement>(null)
  const q = quotes.find((x) => x.id === id)

  // Todos los hooks deben ejecutarse siempre, antes de cualquier return temprano.
  useEffect(() => {
    setSignature(q?.signatureB64 ?? null)
  }, [q?.id, q?.signatureB64])

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

  if (!q) {
    return (
      <Card className="rise">
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">😕</div>
          <h2 className="text-xl font-extrabold text-slate-900">Presupuesto no encontrado</h2>
          <Btn className="mt-4 w-full" onClick={() => nav('/')}>Ir al historial</Btn>
        </div>
      </Card>
    )
  }

  const totals = calcTotals(q.lines, q.ivaRate)
  const fecha = new Date(q.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const waText = waNewQuoteText(q, totals.total)
  const waUrl = waLink(q.clientPhone, waText)
  const canShareNative = typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined'

  const markSent = () => updateQuote(q.id, { sentAt: new Date().toISOString() })
  const markReminded = () => updateQuote(q.id, { remindedAt: new Date().toISOString() })

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
    if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height) }
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
    try { await navigator.clipboard.writeText(waText); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { }
  }

  const shareNative = async () => {
    try {
      await navigator.share({ title: `Presupuesto ${q.number}`, text: waText, url: waUrl })
      setShared(true)
    } catch { }
  }

  const downloadPDF = () => {
    setPdfBusy(true)
    import('../lib/pdf')
      .then(({ generateQuotePDF }) => generateQuotePDF(profile, q))
      .finally(() => setPdfBusy(false))
  }

  const duplicate = () => {
    const newId = `${Date.now()}`
    addQuote({
      id: newId,
      number: nextQuoteNumber(profile.nextNumber || quotes.length + 1),
      clientName: q.clientName + ' (copia)',
      clientPhone: q.clientPhone,
      lines: q.lines,
      ivaRate: q.ivaRate,
      notes: q.notes,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      sentAt: null,
      remindedAt: null,
    })
    nav(`/p/${newId}`)
  }

  return (
    <div className="space-y-4">
      <div className="rise flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Presupuesto {q.number}</p>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{q.clientName}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{fecha} · {eur(totals.total)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={q.status === 'aceptado' ? 'success' : q.status === 'rechazado' ? 'danger' : 'warning'}>
            {q.status === 'pendiente' ? 'Pendiente' : q.status === 'aceptado' ? 'Aceptado' : 'Rechazado'}
          </Badge>
        </div>
      </div>

      <Card className="rise rise-1 overflow-hidden !p-0 border-slate-200">
        <div className="bg-white px-4 py-3 border-b border-slate-100">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">De</p>
              <p className="text-sm font-bold text-slate-800">{profile.name || 'Mi negocio'}</p>
              {profile.phone && <p className="text-xs text-slate-500">{profile.phone}</p>}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Para</p>
              <p className="text-sm font-bold text-slate-800">{q.clientName}</p>
              <p className="text-xs text-slate-500">{q.clientPhone}</p>
            </div>
            {profile.logoB64 && <img src={profile.logoB64} alt="Logo" className="h-12 w-auto rounded-lg object-contain border border-slate-200 bg-white p-1" />}
          </div>
        </div>
        <div className="space-y-2 p-4">
          {q.lines.map((l, i) => (
            <LineItem key={i} desc={l.desc} qty={l.qty} price={l.price} />
          ))}
          <div className="border-t border-slate-200 pt-3 mt-2 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Base imponible</span><span className="font-bold text-slate-800">{eur(totals.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">IVA {q.ivaRate === 0.21 ? '21%' : '10%'}</span><span className="font-bold text-slate-800">{eur(totals.iva)}</span></div>
            <div className="flex justify-between text-lg font-extrabold mt-1 pt-1 border-t border-slate-100"><span className="text-slate-900">Total</span><span className="text-emerald-700">{eur(totals.total)}</span></div>
          </div>
          {q.notes && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3">
              <p className="text-[12px] text-emerald-800">{q.notes}</p>
            </div>
          )}
          {q.photosB64 && q.photosB64.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {q.photosB64.slice(0, 3).map((p, i) => (
                <img key={i} src={p} alt={`Foto ${i + 1}`} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              ))}
            </div>
          )}
        </div>
      </Card>

      {signature && (
        <Card className="rise rise-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Firma del cliente</p>
            <span className="text-[10px] text-emerald-600 font-bold">Guardada ✓</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <img src={signature} alt="Firma" className="h-10 rounded-lg border border-slate-200 bg-white" />
            <Btn variant="danger-ghost" className="!py-2 !text-xs" onClick={clearSignature}>Quitar</Btn>
          </div>
        </Card>
      )}

      {!signature && (
        <Card className="rise rise-2">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Firma del cliente (opcional)</p>
            <p className="mt-0.5 text-xs text-slate-500">El cliente puede firmar directamente en la pantalla.</p>
          </div>
          <div className="border border-slate-200 rounded-xl bg-white">
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
          <div className="flex flex-col gap-2 mt-3">
            <Btn variant="ghost" onClick={saveSignature} disabled={!signature && sigPoints.length === 0} className="w-full">Guardar firma</Btn>
            <Btn variant="danger-ghost" onClick={clearSignature} className="w-full">Limpiar</Btn>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{profile.conditions || 'Presupuesto valido 15 dias.'} Este documento es un presupuesto, no una factura.</p>
        </Card>
      )}
      <div className="rise rise-3 space-y-2">
        <a href={waUrl} target="_blank" rel="noreferrer" onClick={markSent}
          className="btn-big flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-white shadow-[0_4px_12px_-2px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(37,211,102,0.5)] transition-all">
          <span className="text-lg">W</span> Enviar por WhatsApp
        </a>
        {canShareNative && (
          <Btn variant="dark" className="w-full" onClick={shareNative}>{shared ? 'Compartido ✓' : 'Compartir'}</Btn>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="primary" onClick={downloadPDF} disabled={pdfBusy} className="w-full">{pdfBusy ? 'Generando...' : 'PDF'}</Btn>
          <Btn variant="ghost" onClick={() => window.print()} className="w-full">Imprimir</Btn>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Btn variant="ghost" onClick={copyText}>{copied ? 'Copiado ✓' : 'Copiar texto'}</Btn>
          <a href={waLink(q.clientPhone, waReminderText(q, totals.total))} target="_blank" rel="noreferrer" onClick={markReminded}
            className="btn-big inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            Recordatorio
          </a>
        </div>
        {q.sentAt && <p className="mt-2 text-center text-xs text-slate-400">Enviado el {new Date(q.sentAt).toLocaleDateString('es-ES')}</p>}
      </div>

      <Card className="rise rise-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Estado del trabajo</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['pendiente', 'aceptado', 'rechazado'] as const).map((s) => (
            <button key={s} onClick={() => updateQuote(q.id, { status: s })}
              className={`rounded-xl border px-2 py-2.5 text-xs font-bold capitalize transition-all ${q.status === s ? (s === 'aceptado' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : s === 'rechazado' ? 'border-red-400 bg-red-50 text-red-600' : 'border-amber-400 bg-amber-50 text-amber-700') : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Btn variant="ghost" className="flex-1" onClick={() => nav('/')}>Volver al historial</Btn>
          <Btn variant="outline" className="flex-1" onClick={duplicate}>Duplicar</Btn>
        </div>
      </Card>
    </div>
  )
}