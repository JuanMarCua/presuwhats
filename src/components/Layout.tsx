import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { isIOS, useInstallPrompt } from '../lib/install'

function InstallBanner() {
  const { canInstall, installed, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  if (installed || dismissed) return null
  if (canInstall) {
    return (
      <div className="no-print mx-3.5 mt-3 flex items-center gap-3 rounded-2xl bg-slate-900 p-3.5 text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-lg">P</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">Instala PresuWhats</p>
          <p className="text-xs opacity-70">Icono en el movil, funciona sin internet</p>
        </div>
        <button onClick={install} className="shrink-0 rounded-xl bg-green-600 px-3.5 py-2.5 text-sm font-extrabold">Instalar</button>
        <button onClick={() => setDismissed(true)} aria-label="Cerrar" className="shrink-0 px-1 text-lg opacity-60">×</button>
      </div>
    )
  }
  if (isIOS()) {
    return (
      <div className="no-print mx-3.5 mt-3 flex items-center gap-3 rounded-2xl bg-slate-900 p-3.5 text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-lg">P</div>
        <p className="flex-1 text-xs leading-relaxed"><b>En iPhone:</b> pulsa Compartir <span className="text-base">⎙</span> → “Añadir a pantalla de inicio” para tener el icono.</p>
        <button onClick={() => setDismissed(true)} aria-label="Cerrar" className="shrink-0 px-1 text-lg opacity-60">×</button>
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
    `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-[11px] font-bold transition ${
      isActive ? 'bg-green-600 text-white shadow-md shadow-green-600/25' : 'text-slate-500 active:bg-slate-100'
    }`

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-[#eef2f5]">
      <header className="no-print sticky top-0 z-20 bg-green-600 px-4 pb-3 pt-4 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl backdrop-blur">
            🧾
          </div>
          <div className="flex-1">
            <h1 className="text-[17px] font-extrabold leading-tight tracking-tight">PresuWhats</h1>
            <p className="text-[11px] font-medium opacity-90">Presupuestos en 60 seg · Burgos</p>
          </div>
          {!hideNav && (
            <button
              onClick={() => nav('/nuevo')}
              className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-green-700 shadow active:scale-95"
            >
              + Nuevo
            </button>
          )}
        </div>
      </header>

      <InstallBanner />

      <main className="flex-1 px-3.5 py-4 pb-28">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="no-print fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <div className="flex gap-1.5">
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
              Mis datos
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}

