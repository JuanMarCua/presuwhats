import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Field, Input, Segmented, Textarea, Toast } from '../components/ui'
import { calcTotals, eur, QuoteLineSchema, type IvaRate, type Quote, type QuoteLine } from '../lib/quotes'
import { COMMON_EXTRAS, TRADE_TEMPLATES } from '../lib/templates'
import { resizeImageToDataURL } from '../lib/image'
import { MicButton, useVoice } from '../lib/voice'
import { nextQuoteNumber, useStore } from '../store'

const MAX_PHOTOS = 3

interface DraftLine extends QuoteLine { key: string }
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default function Nuevo() {
  const nav = useNavigate()
  const { profile, quotes, addQuote, markPaid, paid } = useStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([{ key: uid(), desc: '', qty: 1, price: 0 }])
  const [ivaRate, setIvaRate] = useState<IvaRate>(profile.defaultIVA ?? 0.21)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTemplates, setShowTemplates] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])
  const [activeLineKey, setActiveLineKey] = useState<string | null>(null)
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const totals = useMemo(() => calcTotals(lines, ivaRate), [lines, ivaRate])
  const validLines = lines.filter((l) => l.desc.trim().length > 0)
  const prevClients = useMemo(() => {
    const seen = new Map<string, string>()
    for (const q of quotes) if (!seen.has(q.clientName)) seen.set(q.clientName, q.clientPhone)
    return [...seen.entries()].slice(0, 5)
  }, [quotes])

  const patchLine = (key: string, patch: Partial<QuoteLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const removeLine = (key: string) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls))
  const addLine = () => setLines((ls) => [...ls, { key: uid(), desc: '', qty: 1, price: 0 }])
  const applyTemplate = (id: string) => {
    const t = TRADE_TEMPLATES.find((x) => x.id === id)
    if (!t) return
    setLines(t.lines.map((l) => ({ ...l, key: uid() })))
    setShowTemplates(false)
  }

  const voiceLine = useVoice((t) => {
    if (!activeLineKey) return
    patchLine(activeLineKey, { desc: t })
  })

  const notify = (msg: string) => { setVoiceMsg(msg); setTimeout(() => setVoiceMsg(null), 3000) }

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (photos.length + files.length > MAX_PHOTOS) {
      notify(`Maximo ${MAX_PHOTOS} fotos por presupuesto`)
      return
    }
    const next: string[] = [...photos]
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue
      try {
        const dataUrl = await resizeImageToDataURL(f, 1200, 0.75)
        next.push(dataUrl)
      } catch {
        notify('No se pudo procesar una foto')
      }
    }
    setPhotos(next)
    e.target.value = ''
  }

  const removePhoto = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i))

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (clientName.trim().length < 2) errs.clientName = 'Pon el nombre del cliente (min. 2 letras).'
    if (clientPhone.replace(/\D/g, '').length < 9) errs.clientPhone = 'Movil de 9 digitos para WhatsApp.'
    if (validLines.length === 0) errs.lines = 'Anade al menos 1 linea con descripcion.'
    for (const l of lines) {
      if (!l.desc.trim()) continue
      const parsed = QuoteLineSchema.safeParse({ desc: l.desc, qty: l.qty, price: l.price })
      if (!parsed.success) { errs.lines = parsed.error.issues[0]?.message ?? 'Revisa cantidades.'; break }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function onCreate() {
    if (!validate()) { setStep(1); return }
    if (!paid && quotes.length >= 3) { setPaywallOpen(true); return }
    const clean: QuoteLine[] = validLines.map((l) => ({ desc: l.desc.trim(), qty: Number(l.qty), price: Number(l.price) }))
    const q: Quote = {
      id: uid(),
      number: nextQuoteNumber(profile.nextNumber || quotes.length + 1),
      clientName: clientName.trim(), clientPhone: clientPhone.trim(),
      lines: clean, ivaRate, notes: notes.trim(),
      status: 'pendiente', createdAt: new Date().toISOString(), sentAt: null, remindedAt: null,
      photosB64: photos,
    }
    addQuote(q)
    nav(`/p/${q.id}`)
  }
  const steps = ['Cliente', 'Trabajo', 'Revisar'] as const

  return (
    <div className="space-y-4">
      {voiceMsg && <Toast msg={voiceMsg} />}
      {paywallOpen && (
        <Card className="rise rise-1 bg-amber-50 border-amber-200">
          <h2 className="text-lg font-extrabold text-amber-900">Presupuestos gratis agotados (3/3)</h2>
          <p className="mt-1 text-sm text-amber-700">Desbloquea presupuestos ilimitados con un pago único.</p>
          <div className="mt-3 text-2xl font-extrabold text-green-700">49 € <span className="text-base font-bold text-slate-500">pago único, sin mensualidad</span></div>
          <div className="mt-4 space-y-2">
            <Btn className="w-full" disabled={false} onClick={() => { markPaid(true); setPaywallOpen(false) }}>Pagar 49 € y seguir creando</Btn>
            <Btn variant="ghost" className="w-full" onClick={() => setPaywallOpen(false)}>Seguir en modo gratis (ver mis presupuestos)</Btn>
          </div>
          <p className="mt-2 text-[11px] text-amber-500">Tu pago se guarda en este móvil. Sin cuenta, sin nube.</p>
        </Card>
      )}
      <div className="rise flex items-center gap-1.5">
        {steps.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const active = step === n
          const done = step > n
          return (
            <button key={label} onClick={() => setStep(n)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-extrabold transition ${active ? 'bg-slate-900 text-white shadow' : done ? 'bg-green-100 text-green-700' : 'bg-white text-slate-400 border border-slate-200'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white text-slate-900' : done ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {done ? 'OK' : n}
              </span>
              {label}
            </button>
          )
        })}
      </div>

      {!profile.name && (
        <div className="rise rise-1 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm">
          <p className="font-bold text-amber-800">Te falta configurar tu negocio</p>
          <p className="mt-0.5 text-amber-700">El presupuesto saldra sin tu nombre y logo.</p>
          <button onClick={() => nav('/ajustes')} className="mt-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white">
            Configurar Mis datos
          </button>
        </div>
      )}

      {step === 1 && (
        <Card className="rise rise-1">
          <h2 className="text-lg font-extrabold tracking-tight">Para quien es?</h2>
          <p className="mb-4 text-sm text-slate-500">El WhatsApp se envia a este movil.</p>
          <div className="space-y-4">
            <Field label="Nombre del cliente *" htmlFor="cname" error={errors.clientName}>
              <Input id="cname" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Juan Garcia" autoComplete="off" />
            </Field>
            <Field label="Movil / WhatsApp *" htmlFor="cphone" error={errors.clientPhone} hint="Solo Espana. Se anade el 34 solo.">
              <Input id="cphone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Ej: 647 123 456" inputMode="tel" autoComplete="off" />
            </Field>
            {prevClients.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Repetir cliente</p>
                <div className="flex flex-wrap gap-2">
                  {prevClients.map(([name, phone]) => (
                    <button key={name} onClick={() => { setClientName(name); setClientPhone(phone) }}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Btn className="w-full" onClick={() => { if (clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length >= 9) { setErrors({}); setStep(2) } else validate() }}>
              Continuar a Trabajo
            </Btn>
          </div>
        </Card>
      )}
      {step === 2 && (
        <div className="space-y-3">
          {showTemplates && (
            <Card className="rise rise-1 border-green-200 bg-gradient-to-b from-green-50/60 to-white">
              <h2 className="text-[15px] font-extrabold">Empieza con una plantilla</h2>
              <p className="mb-3 text-[13px] text-slate-500">Precios orientativos de Burgos. Luego los ajustas.</p>
              <div className="grid grid-cols-3 gap-2">
                {TRADE_TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => applyTemplate(t.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center transition active:scale-95 active:border-green-400">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-700">{t.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(false)} className="mt-3 w-full text-center text-sm font-bold text-slate-400">
                Empezar desde cero
              </button>
            </Card>
          )}
          <Card className="rise rise-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold">Lineas del trabajo</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{validLines.length} lineas</span>
            </div>
            <div className="space-y-3">
              {lines.map((l, i) => (
                <div key={l.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-extrabold text-white">{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-green-700">{eur(Math.round(l.qty * l.price * 100) / 100)}</span>
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(l.key)} aria-label="Eliminar linea" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400">X</button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      data-line-key={l.key}
                      value={l.desc}
                      onChange={(e) => patchLine(l.key, { desc: e.target.value })}
                      onFocus={() => setActiveLineKey(l.key)}
                      onBlur={() => setActiveLineKey(null)}
                      placeholder="Ej: Cambiar grifo cocina + mano de obra" rows={2}
                      className="input-big w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                    />
                    <button
                      type="button"
                      onClick={() => (voiceLine.listening ? voiceLine.stop() : voiceLine.start())}
                      title={voiceLine.listening ? 'Detener dictado' : 'Dictar descripcion'}
                      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition ${voiceLine.listening ? 'bg-red-100 text-red-700 animate-pulse' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                      aria-label={voiceLine.listening ? 'Detener dictado' : 'Microfono'}
                      aria-pressed={voiceLine.listening}
                    >
                      {voiceLine.listening ? '⏹' : '🎙'}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white">
                      <button onClick={() => patchLine(l.key, { qty: Math.max(0.5, Math.round((Number(l.qty) - 1) * 10) / 10) })} className="px-3.5 py-3 text-lg font-bold text-slate-400">-</button>
                      <div className="flex-1 text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Cant.</span>
                        <input value={l.qty} inputMode="decimal" onChange={(e) => patchLine(l.key, { qty: Number(String(e.target.value).replace(',', '.')) || 0 })}
                          className="w-full bg-transparent text-center text-base font-extrabold outline-none" />
                      </div>
                      <button onClick={() => patchLine(l.key, { qty: Math.round((Number(l.qty) + 1) * 10) / 10 })} className="px-3.5 py-3 text-lg font-bold text-slate-400">+</button>
                    </div>
                    <label className="flex items-center rounded-xl border border-slate-300 bg-white px-3">
                      <input value={l.price} inputMode="decimal" onChange={(e) => patchLine(l.key, { price: Number(String(e.target.value).replace(',', '.')) || 0 })}
                        className="w-full bg-transparent py-2 text-base font-extrabold outline-none" placeholder="0" />
                      <span className="font-bold text-slate-400">E</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {errors.lines && <p className="mt-2 text-sm font-medium text-red-600">{errors.lines}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn variant="ghost" onClick={addLine}>+ Anadir linea</Btn>
              <Btn variant="ghost" onClick={() => setShowTemplates((s) => !s)}>Plantillas</Btn>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Extras frecuentes</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_EXTRAS.map((ex) => (
                  <button key={ex.desc} onClick={() => setLines((ls) => [...ls, { ...ex, key: uid() }])}
                    className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                    + {ex.desc.slice(0, 30)}.. {eur(ex.price)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
          <Card className="rise rise-3">
            <Field label="IVA aplicable">
              <Segmented value={ivaRate} onChange={setIvaRate}
                options={[
                  { value: 0.21 as IvaRate, label: '21% General', sub: 'Reparaciones, locales' },
                  { value: 0.1 as IvaRate, label: '10% Vivienda', sub: 'Renovacion >2 anos' },
                ]} />
            </Field>
            {/* FOTOS */}
            <Card className="rise rise-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <Field label="Fotos del trabajo (maximo 3)">
                  <p className="text-xs text-slate-400">Haz fotos al averia o al trabajo terminado; viajan en el presupuesto.</p>
                </Field>
                <button
                  onClick={() => document.getElementById('photo-input')?.click()}
                  className="flex-1 rounded-xl border border-dashed border-green-300 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-100"
                >
                  {photos.length > 0 ? `${photos.length} / ${MAX_PHOTOS}` : 'Anadir fotos'}
                </button>
              </div>
              <input id="photo-input" type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={handlePhotos} />
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                      <button type="button" onClick={() => removePhoto(i)} aria-label="Quitar foto"
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] shadow">×</button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="mt-4">
              <Field label="Notas para el cliente (opcional)" htmlFor="notes">
                <div className="flex items-center justify-between">
                  <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Material incluido. Plazo 3-5 dias." maxLength={300} />
                  <MicButton onResult={(t) => setNotes(t)} className="flex-shrink-0 ml-2" />
                </div>
              </Field>
            </div>
          </Card>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => setStep(1)} className="flex-1">Atras</Btn>
            <Btn onClick={() => { if (validate()) setStep(3) }} className="flex-[2]">Revisar: {eur(totals.total)}</Btn>
          </div>
          {validLines.length > 0 && (
            <div className="totals-bar fixed bottom-[76px] left-1/2 z-10 w-[calc(100%-1.75rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Base {eur(totals.subtotal)} + IVA {eur(totals.iva)}</div>
                <div className="text-xl font-extrabold text-green-700">{eur(totals.total)}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <Card className="rise rise-1 overflow-hidden !p-0">
            <div className="bg-slate-900 px-4 py-3 text-white">
              <p className="text-xs font-medium opacity-70">Vista previa - {nextQuoteNumber(profile.nextNumber || quotes.length + 1)}</p>
              <p className="text-lg font-extrabold">{clientName || 'Cliente'}: {eur(totals.total)}</p>
            </div>
            <div className="space-y-2.5 p-4">
              {validLines.map((l, i) => (
                <div key={l.key} className="flex items-start justify-between gap-3 text-sm">
                  <p className="flex-1"><span className="font-bold text-slate-400">{i + 1}. </span>{l.desc} <span className="text-slate-400">x {l.qty}</span></p>
                  <p className="font-bold">{eur(Math.round(l.qty * l.price * 100) / 100)}</p>
                </div>
              ))}
              <div className="border-t border-dashed border-slate-200 pt-2.5 text-sm">
                <div className="flex justify-between text-slate-500"><span>Base</span><span>{eur(totals.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>IVA {ivaRate === 0.21 ? '21%' : '10%'}</span><span>{eur(totals.iva)}</span></div>
                <div className="mt-1 flex justify-between text-lg font-extrabold text-slate-900"><span>Total</span><span className="text-green-700">{eur(totals.total)}</span></div>
              </div>
              {notes && <p className="rounded-xl bg-slate-50 p-2.5 text-[13px] text-slate-600">{notes}</p>}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt={`Foto ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                  ))}
                </div>
              )}
            </div>
          </Card>
          {Object.keys(errors).length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {Object.values(errors)[0]} - <button className="underline" onClick={() => setStep(1)}>corregir</button>
            </div>
          )}
          <Btn className="rise rise-2 w-full !py-4 !text-lg" onClick={onCreate}>
            Crear presupuesto {eur(totals.total)}
          </Btn>
          <button onClick={() => setStep(2)} className="w-full text-center text-sm font-bold text-slate-400">Editar lineas</button>
          <p className="text-center text-xs text-slate-400">Al crearlo podras descargar el PDF y enviarlo por WhatsApp.</p>
        </div>
      )}
    </div>
  )
}

