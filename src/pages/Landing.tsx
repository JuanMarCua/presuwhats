import { useNavigate } from 'react-router-dom'
import { Btn, Card, Badge, SectionTitle, SectionSubtitle } from '../components/ui'

const WA_DEMO = 'https://wa.me/34647000000?text=' + encodeURIComponent('Hola, quiero ver la demo de PresuWhats para mi negocio en Burgos. 👋')

export default function Landing() {
  const nav = useNavigate()

  const stats = [
    { label: 'Presupuestos creados', value: '60 seg', sub: 'Desde el móvil, en la obra o en el bar' },
    { label: 'Sin Excel ni esperas', value: '3 días → 1 min', sub: 'Lo que tardabas, ahora lo haces en 60 segundos' },
    { label: 'Pago único', value: '49 €', sub: 'Sin mensualidad, sin registro, sin nube' },
  ]

  const beforeAfter = [
    ['Antes: Excel en el portátil, 45 min', 'Después: Móvil en la obra, 60 seg'],
    ['Antes: 3 días esperando respuesta', 'Después: Enviado antes de bajar del andamio'],
    ['Antes: Sin logo, IVA a ojo', 'Después: PDF con logo + IVA automático'],
    ['Antes: Se olvidan de ti', 'Después: Recordatorio automático a los 2 días'],
  ]

  const trades = [
    { icon: '🔧', label: 'Fontanero', sub: 'Grifos, cisternas, calefacción' },
    { icon: '💡', label: 'Electricista', sub: 'Cuadros, enchufes, iluminación' },
    { icon: '🎨', label: 'Pintor', sub: 'Pisos, fachadas, oficinas' },
    { icon: '❄️', label: 'Clima', sub: 'Aire acondicionado, calderas' },
    { icon: '🧱', label: 'Albañil', sub: 'Reformas, obra nueva' },
    { icon: '🔑', label: 'Cerrajero', sub: 'Aperturas, cerraduras' },
  ]

  return (
    <div className="mx-auto min-h-svh w-full max-w-[430px] bg-white">
      <header className="no-print px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white text-xl font-bold shadow-lg shadow-emerald-600/30">🧾</div>
          <div>
            <p className="text-[16px] font-extrabold leading-tight tracking-tight text-slate-900">PresuWhats</p>
            <p className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">Burgos · Presupuestos</p>
          </div>
        </div>
        <Btn variant="primary" onClick={() => nav('/nuevo')} className="text-xs font-bold px-3.5 py-2">Probar gratis</Btn>
      </header>

      <section className="relative px-5 pb-10 pt-4">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none"></div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Badge variant="info">Burgos</Badge>
          <Badge variant="default">Sin registro</Badge>
          <Badge variant="success">Pago único</Badge>
        </div>

        <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-4 text-center rise rise-1">
          Haz presupuestos<br className="hidden md:block" />en el bar en 1 minuto.
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-600 mb-6 text-center rise rise-2">
          Con tu logo, IVA automático y envío por WhatsApp. Desde el móvil, en la obra o en el bar.<br />
          Sin Excel, sin esperas, sin nube.
        </p>

        <div className="space-y-3 rise rise-3">
          <Btn variant="whatsapp" className="w-full !py-4 !text-lg" onClick={() => nav('/nuevo')}>
            📱 Crear mi primer presupuesto
          </Btn>
          <Btn variant="outline" className="w-full !py-4" onClick={() => nav('/ajustes')}>
            Configurar mi negocio primero
          </Btn>
          <a href={WA_DEMO} target="_blank" rel="noreferrer" className="btn-big flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            <span className="text-lg">💬</span> Pedir demo por WhatsApp
          </a>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400 rise rise-4">
          Gratis para empezar · Tus datos se guardan solo en tu móvil
        </p>

        <div className="mt-10 relative rise rise-5">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-3xl blur opacity-40"></div>
          <Card className="relative z-10 border-emerald-100 shadow-xl">
            <div className="bg-slate-900 px-4 py-3 text-white">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold opacity-80">Fontanería Manolo · Burgos</span>
                <span className="text-[10px] opacity-60">Presupuesto 2026-014</span>
              </div>
            </div>
            <div className="space-y-2 p-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Cambiar grifo cocina</span><span>85,00 €</span></div>
              <div className="flex justify-between text-slate-600"><span>Mano de obra × 2h</span><span>64,00 €</span></div>
              <div className="flex justify-between rounded-2xl bg-emerald-600 p-3 text-white mt-1"><span className="font-extrabold">TOTAL IVA incl.</span><span className="font-extrabold">180,29 €</span></div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-emerald-600 px-5 py-8">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-center">
              <span className="block text-xs font-bold text-emerald-200 uppercase tracking-wider">{s.label}</span>
              <span className="block mt-0.5 text-2xl font-extrabold text-white">{s.value}</span>
              <span className="block mt-1 text-[10px] text-emerald-100/80">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-10">
        <SectionTitle>Cómo funciona</SectionTitle>
        <div className="space-y-4">
          {[
            ['1️⃣', 'Configura tu negocio', 'Nombre, teléfono, logo e IVA. Lo haces una sola vez.'],
            ['2️⃣', 'Elige una plantilla', 'Precios orientativos de Burgos para tu oficio.'],
            ['3️⃣', 'Envía por WhatsApp', 'PDF con tu logo + texto listo + recordatorio si no responde.'],
          ].map(([num, title, desc]) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all rise">
              <div className="flex-shrink-0 mt-0.5 text-2xl">{num}</div>
              <div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 px-5 py-10 text-white">
        <SectionTitle className="text-white">Antes vs Después</SectionTitle>
        <div className="space-y-3">
          {beforeAfter.map(([before, after]) => (
            <div key={before} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-sm text-slate-400 line-through">{before}</span>
              <span className="text-xs text-slate-400 opacity-50">→</span>
              <span className="text-sm font-bold text-emerald-400">{after}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-10">
        <SectionTitle>Para tu oficio en Burgos</SectionTitle>
        <SectionSubtitle>Plantillas con precios orientativos del sector</SectionSubtitle>
        <div className="grid grid-cols-3 gap-3">
          {trades.map((t) => (
            <div key={t.label} className="p-3 rounded-2xl border border-slate-200 bg-white text-center hover:shadow-sm transition-all rise">
              <span className="text-2xl mb-2 block">{t.icon}</span>
              <p className="text-sm font-bold text-slate-800">{t.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 px-5 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Oferta lanzamiento Burgos</p>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">49 € <span className="text-lg font-bold text-slate-500">pago único</span></h2>
        <p className="text-sm text-slate-600 mb-6 max-w-[260px] mx-auto leading-relaxed">
          Sin mensualidad. Lo que cobras por medio grifo. Incluye configuración si hace falta.
        </p>
        <div className="space-y-3">
          <Btn variant="primary" className="w-full !py-4 !text-lg" onClick={() => nav('/nuevo')}>
            Empezar gratis ahora
          </Btn>
          <a href={WA_DEMO} target="_blank" rel="noreferrer" className="btn-big flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white shadow-lg shadow-slate-900/30">
            <span className="text-lg">💬</span> Hablar por WhatsApp
          </a>
        </div>
        <p className="mt-6 text-[10px] leading-relaxed text-slate-400 max-w-[260px] mx-auto">
          PresuWhats genera presupuestos, no facturas. Tus datos se guardan solo en tu móvil. Sin cuenta, sin nube.
        </p>
      </section>

      <footer className="px-5 py-8 border-t border-slate-100 bg-slate-50 text-center">
        <p className="text-[10px] font-bold tracking-wider text-slate-400">PresuWhats V1.1b · Burgos, España</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Hecho para autónomos de reformas en Burgos.</p>
      </footer>
    </div>
  )
}