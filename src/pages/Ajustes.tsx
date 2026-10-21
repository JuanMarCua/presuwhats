import { useState } from 'react'
import { BusinessProfileSchema } from '../lib/quotes'
import type { BusinessProfile } from '../lib/quotes'
import { resizeImageToDataURL } from '../lib/image'
import { Btn, Card, Field, Input, Segmented, Textarea, Badge } from '../components/ui'
import { defaultProfile, useStore } from '../store'

export default function Ajustes() {
  const { profile, setProfile, quotes } = useStore()
  const [form, setForm] = useState<BusinessProfile>({ ...defaultProfile, ...profile })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const set = (k: keyof BusinessProfile, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await resizeImageToDataURL(file, 512, 0.8)
      if (b64.length > 280000) {
        const smaller = await resizeImageToDataURL(file, 256, 0.7)
        setForm((f) => ({ ...f, logoB64: smaller }))
      } else setForm((f) => ({ ...f, logoB64: b64 }))
    } catch {
      setErrors((er) => ({ ...er, logoB64: 'No se pudo leer el logo. Prueba con JPG/PNG.' }))
    }
  }

  function onSave() {
    const parsed = BusinessProfileSchema.safeParse(form)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        if (!errs[key]) errs[key] = issue.message
      }
      setErrors(errs); setSaved(false); return
    }
    setErrors({}); setProfile(parsed.data); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ profile, quotes }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `presuwhats-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="space-y-4 rise">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Mis datos 🏢</h2>
          <p className="text-sm text-slate-500">Salen en todos tus presupuestos. Se guardan solo en tu móvil.</p>
        </div>
        {saved && <Badge variant="success">Guardado ✓</Badge>}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          {form.logoB64 ? (
            <img src={form.logoB64} alt="Logo" className="h-16 w-16 rounded-2xl border border-slate-200 object-cover bg-white" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-600">🧰</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">Logo de tu negocio</p>
            <p className="text-xs text-slate-500">Sale en el PDF y en la vista previa.</p>
            <label className="mt-1.5 inline-block cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
              {form.logoB64 ? 'Cambiar logo' : 'Subir logo'}
              <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
            </label>
          </div>
          {form.logoB64 && (
            <button onClick={() => set('logoB64', '')} className="text-xs font-bold text-slate-400 hover:text-slate-600">Quitar</button>
          )}
        </div>
        {errors.logoB64 && <p className="mb-3 text-sm text-red-600">{errors.logoB64}</p>}
        <div className="space-y-4">
          <Field label="Nombre / Empresa *" htmlFor="name" error={errors.name}>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Fontanería Manolo - Burgos" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="NIF/CIF" htmlFor="cif">
              <Input id="cif" value={form.cif ?? ''} onChange={(e) => set('cif', e.target.value)} placeholder="12345678Z" />
            </Field>
            <Field label="Teléfono *" htmlFor="phone" error={errors.phone}>
              <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="647 123 456" />
            </Field>
          </div>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" inputMode="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="hola@ejemplo.es" />
          </Field>
        </div>
      </Card>

      <Card>
        <Field label="IVA que usas normalmente">
          <Segmented value={form.defaultIVA ?? 0.21} onChange={(v) => set('defaultIVA', v)}
            options={[
              { value: 0.21, label: '21% General', sub: 'Mayoría de trabajos' },
              { value: 0.1, label: '10% Vivienda', sub: 'Reformas > 2 años' },
            ]} />
        </Field>
        <div className="mt-4">
          <Field label="Condiciones del presupuesto" htmlFor="conditions" hint="Aparecen al pie del PDF. Máx. 500 caracteres.">
            <Textarea id="conditions" rows={3} value={form.conditions} onChange={(e) => set('conditions', e.target.value)} maxLength={500} />
          </Field>
        </div>
      </Card>

      <Btn className="w-full !py-4" onClick={onSave}>Guardar mis datos</Btn>

      <Card>
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-800">Copia de seguridad</p>
          <p className="mb-3 text-xs text-slate-500">Descarga tus presupuestos + datos. Guárdalo en OneDrive o Google Drive.</p>
        </div>
        <Btn variant="ghost" className="w-full" onClick={exportBackup}>Descargar copia JSON</Btn>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">Este documento es un presupuesto, no una factura. Validez 15 días. Tus datos no salen de tu móvil (sin nube en esta versión).</p>
      </Card>
    </div>
  )
}
