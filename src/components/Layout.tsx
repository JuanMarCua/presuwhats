import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { isIOS, useInstallPrompt } from '../lib/install'
import { Btn } from './ui'

function InstallBanner() {
  const { canInstall, installed, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  if (installed || dismissed) return null
  if (canInstall) {
    return (
      <div className="no-print mx-3.5 mt-3 flex items-center gap-3 rounded-2xl bg-emerald-600 p-3.5 text-white shadow-[0_8px_24px_-4px_rgba(5,150,105,0.4)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-emerald-900 text-lg font-bold">P</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold tracking-tight">Instala PresuWhats</p>
          <p className="text-xs opacity-80">Icono en el móvil · funciona sin internet</p>
        </div>
        <Btn variant="outline" onClick={install} className="shrink-0 text-xs font-bold">Instalar app</Btn>
        <button onClick={() => setDismissed(true)} aria-label="Cerrar" className="shrink-0 px-1 text-lg opacity-60 hover:opacity-100">×</button>
      </div>
    )
  }
  if (isIOS()) {
    return (
      <div className="no-print mx-3.5 mt-3 flex items-center gap-3 rounded-2xl bg-emerald-600 p-3.5 text-white shadow-[0_8px_24px_-4px_rgba(5,150,105,0.4)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-emerald-900 text-lg font-bold">P</div>
        <p className="flex-1 text-xs leading-relaxed opacity-90"><b>En iPhone:</b> pulsa Compartir <span className="text-emerald-300 text-base">⎙</span> → "Añadir a pantalla de inicio"</p>
        <button onClick={() => setDismissed(true)} aria-label="Cerrar" className="shrink-0 px-1 text-lg opacity-60 hover:opacity-100">×</button>
      </div>
    )
  }
  return null
}

export default function Layout() {
  const loc = useLocation()
  const nav = useNavigate()
  const hideNav = loc.pathname.startsWith('/p/')

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-bold transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
    }`

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-slate-50">
      <header className="no-print sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 pb-2 pt-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white text-xl font-bold shadow-lg shadow-emerald-600/30">
            🧾
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-extrabold leading-tight tracking-tight text-slate-900">PresuWhats</h1>
            <p className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">Presupuestos en 60 seg · Burgos</p>
          </div>
          {!hideNav && (
            <Btn variant="primary" onClick={() => nav('/nuevo')} className="text-xs font-bold px-3.5 py-2">
              + Nuevo presupuesto
            </Btn>
          )}
        </div>
      </header>

      <InstallBanner />

      <main className="flex-1 px-4 py-4 pb-28">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="no-print fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/90 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex gap-1">
            <NavLink to="/" className={link} end>
              <span className="text-xl leading-none">📋</span>
              Historial
            </NavLink>
            <NavLink to="/nuevo" className={link}>
              <span className="text-xl leading-none">➕</span>
              Nuevo
            </NavLink>
            <NavLink to="/ajustes" className={link}>
              <span className="text-xl leading-none">⚙️</span>
              Ajustes
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}
