import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Historial from '../pages/Historial'
import Nuevo from '../pages/Nuevo'
import Ajustes from '../pages/Ajustes'
import Preview from '../pages/Preview'
import Landing from '../pages/Landing'
import { useStore } from '../store'

// React necesita saber que estamos en un entorno de test para act().
;(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

// --- Entorno de navegador simulado -----------------------------------------
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class MatchMediaStub {
  matches = false
  addListener() {}
  removeListener() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return false }
}
class ScrollToStub {
  scrollTo() {}
  scrollBy() {}
}

;(globalThis as unknown as Record<string, unknown>).ResizeObserver = ResizeObserverStub
;(globalThis as unknown as Record<string, unknown>).matchMedia = MatchMediaStub
;(globalThis as unknown as Record<string, unknown>).scrollTo = ScrollToStub
Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { configurable: true, value: 375 })
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { configurable: true, value: 700 })

// jsdom no implementa canvas: stub 2d minimo para la firma.
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement, kind: string) {
  if (kind === '2d') {
    return {
      clearRect: () => {}, strokeStyle: '', lineWidth: 0, lineCap: '', lineJoin: '',
      beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
    } as unknown as CanvasRenderingContext2D
  }
  return originalGetContext.call(this, kind as '2d') as ReturnType<HTMLCanvasElement['getContext']>
} as HTMLCanvasElement['getContext']
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,stub'

const SEED_QUOTE = {
  id: 'test-quote-1',
  number: '2026-001',
  clientName: 'Cliente Test',
  clientPhone: '647123456',
  lines: [
    { desc: 'Cambiar grifo cocina', qty: 1, price: 85 },
    { desc: 'Mano de obra', qty: 2, price: 32 },
  ],
  ivaRate: 0.21 as const,
  notes: 'Plazo 3-5 dias',
  status: 'pendiente' as const,
  createdAt: new Date().toISOString(),
  sentAt: null,
  remindedAt: null,
}

function renderPage(element: React.ReactElement, route = '/') {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={element} />
          <Route path="/p/:id" element={element} />
        </Routes>
      </MemoryRouter>,
    )
  })
  return {
    container,
    html: () => container.innerHTML,
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

afterEach(() => {
  useStore.setState({ quotes: [], profile: useStore.getState().profile, paid: false })
})

describe('Smoke de renderizado de paginas', () => {
  it('Historial renderiza el estado vacio sin errores', () => {
    const view = renderPage(<Historial />)
    expect(view.html()).toContain('Sin presupuestos')
    view.unmount()
  })

  it('Historial renderiza la lista con presupuestos', () => {
    useStore.setState({ quotes: [SEED_QUOTE] })
    const view = renderPage(<Historial />)
    expect(view.html()).toContain('Cliente Test')
    expect(view.html()).toContain('2026-001')
    view.unmount()
  })

  it('Nuevo renderiza los 3 pasos', () => {
    const view = renderPage(<Nuevo />)
    expect(view.html()).toContain('Para quien es?')
    expect(view.html()).toContain('Continuar a Trabajo')
    view.unmount()
  })

  it('Ajustes renderiza el formulario', () => {
    const view = renderPage(<Ajustes />)
    expect(view.html()).toContain('Mis datos')
    view.unmount()
  })

  it('Preview renderiza un presupuesto existente', () => {
    useStore.setState({ quotes: [SEED_QUOTE] })
    const view = renderPage(<Preview />, '/p/test-quote-1')
    expect(view.html()).toContain('Cliente Test')
    expect(view.html()).toContain('Cambiar grifo cocina')
    view.unmount()
  })

  it('Preview muestra "no encontrado" sin reventar (id invalido)', () => {
    const view = renderPage(<Preview />, '/p/no-existe')
    expect(view.html()).toContain('Presupuesto no encontrado')
    view.unmount()
  })

  it('Landing renderiza el hero y el precio', () => {
    const view = renderPage(<Landing />)
    expect(view.html()).toContain('49')
    view.unmount()
  })
})
