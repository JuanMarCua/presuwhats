import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import './index.css'
import Historial from './pages/Historial.tsx'

const Nuevo = lazy(() => import('./pages/Nuevo.tsx'))
const Preview = lazy(() => import('./pages/Preview.tsx'))
const Ajustes = lazy(() => import('./pages/Ajustes.tsx'))
const Landing = lazy(() => import('./pages/Landing.tsx'))

function Fallback() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-2xl text-white">P</div>
      <p className="mt-3 text-sm font-bold text-slate-500">Cargando PresuWhats...</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/promo" element={<Landing />} />
          <Route element={<Layout />}>
            <Route index element={<Historial />} />
            <Route path="nuevo" element={<Nuevo />} />
            <Route path="p/:id" element={<Preview />} />
            <Route path="ajustes" element={<Ajustes />} />
            <Route path="*" element={<Historial />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

