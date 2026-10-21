import { useNavigate } from 'react-router-dom'
import { Btn } from '../components/ui'

const WA_DEMO = 'https://wa.me/34647000000?text=' + encodeURIComponent('Hola, quiero ver la demo de PresuWhats para mi negocio en Burgos.')

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="mx-auto min-h-svh w-full max-w-md bg-white">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-lg text-white">P</div>
          <p className="text-[17px] font-extrabold tracking-tight">PresuWhats</p>
        </div>
        <button onClick={() => nav('/')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">Abrir app</button>
      </header>
      <section className="bg-slate-900 px-5 pb-8 pt-6 text-white">
        <p className="inline-block rounded-full bg-green-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">Burgos · Fontaneros · Electricistas · Pintores</p>
        <h1 className="mt-3 text-[32px] font-extrabold leading-[1.08] tracking-tight">El presupuesto en el bar en 1 minuto, no en 3 dias.</h1>
        <p className="mt-3 text-[15px] leading-relaxed opacity-80">Con tu logo, IVA automatico y envio por WhatsApp. Desde el movil, en la obra o en el bar. Sin Excel.</p>
        <div className="mt-5 space-y-2">
          <Btn className="w-full !py-4 !text-base" onClick={() => nav('/nuevo')}>Probar gratis ahora</Btn>
          <a href={WA_DEMO} target="_blank" rel="noreferrer" className="btn-big flex w-full items-center justify-center rounded-xl border border-white/25 px-4 py-3 font-bold">Pedir demo por WhatsApp</a>
        </div>
        <p className="mt-3 text-center text-xs opacity-60">Gratis para empezar · Sin registro · Tus datos no salen del movil</p>
      </section>
      <section className="px-5 py-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
          <div className="bg-green-600 px-4 py-3 text-white">
            <p className="text-sm font-extrabold">Fontaneria Manolo · Burgos</p>
            <p className="text-[11px] opacity-80">Presupuesto 2026-014</p>
          </div>
          <div className="space-y-2 p-4 text-sm">
            <div className="flex justify-between"><span>Cambiar grifo cocina × 1</span><b>85,00 €</b></div>
            <div className="flex justify-between"><span>Mano de obra × 2h</span><b>64,00 €</b></div>
            <div className="flex justify-between rounded-xl bg-slate-900 p-3 text-white"><span className="font-extrabold">TOTAL IVA incl.</span><span className="font-extrabold">180,29 €</span></div>
          </div>
        </div>
        {/* como funciona, comparativa */}
        <div className="grid gap-2.5">
          {[
            ['1️⃣', 'Configura tu negocio', 'Nombre, telefono, logo e IVA. Una vez, 1 minuto.'],
            ['2️⃣', 'Elige plantilla de tu oficio', 'Fontanería, luz, pintura, clima, albañilería, cerrajería. Precios orientativos de Burgos.'],
            ['3️⃣', 'Envia por WhatsApp', 'PDF con tu logo + texto listo + recordatorio a los 2 dias si no contesta.'],
          ].map(([i, t, b]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
              <span className="text-2xl">{i}</span>
              <div><p className="text-[15px] font-extrabold">{t}</p><p className="mt-0.5 text-sm text-slate-500">{b}</p></div>
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-2 bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white"><span>Antes</span><span className="text-green-300">Con PresuWhats</span></div>
          {[
            ['Excel en el portatil, 45 min', 'Movil en la obra, 60 seg'],
            ['3 dias esperando al cliente', 'Enviado antes de bajar del andamio'],
            ['Sin logo, sin IVA claro', 'PDF con logo + IVA automatico 10/21%'],
            ['Se olvidan de ti', 'Recordatorio WhatsApp a los 2 dias'],
          ].map(([a, b]) => (
            <div key={a} className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3 text-[13px]"><span className="text-slate-400 line-through">{a}</span><span className="font-bold text-green-700">{b}</span></div>
          ))}
        </div>
      </section>
      <section className="bg-green-50 px-5 py-8 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-green-700">Lanzamiento Burgos</p>
        <p className="mt-1 text-3xl font-extrabold">49 € <span className="text-base font-bold text-slate-500">pago unico</span></p>
        <p className="mx-auto mt-2 max-w-70 text-sm text-slate-600">Sin mensualidad. Lo que cobras por medio grifo. Incluye configuracion en el bar si hace falta.</p>
        <div className="mt-4 space-y-2">
          <Btn className="w-full" onClick={() => nav('/nuevo')}>Empezar gratis</Btn>
          <a href={WA_DEMO} target="_blank" rel="noreferrer" className="btn-big flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">Hablar por WhatsApp</a>
        </div>
        <p className="mx-auto mt-5 max-w-70 text-[11px] leading-relaxed text-slate-400">PresuWhats genera presupuestos, no facturas. Tus datos se guardan solo en tu movil. Sin cuenta, sin nube.</p>
      </section>
      {/*__HERO__*/}
    </div>
  )
}
