import type { QuoteLine } from './quotes'

export interface TradeTemplate {
  id: string
  icon: string
  label: string
  lines: QuoteLine[]
}

export const TRADE_TEMPLATES: TradeTemplate[] = [
  {
    id: 'fontanero',
    icon: '🔧',
    label: 'Fontanero',
    lines: [
      { desc: 'Desplazamiento y diagnóstico en vivienda (Burgos capital)', qty: 1, price: 35 },
      { desc: 'Mano de obra fontanería (hora)', qty: 2, price: 32 },
      { desc: 'Materiales (a justificar con ticket)', qty: 1, price: 40 },
    ],
  },
  {
    id: 'electricista',
    icon: '💡',
    label: 'Electricista',
    lines: [
      { desc: 'Desplazamiento y revisión cuadro eléctrico', qty: 1, price: 35 },
      { desc: 'Mano de obra electricista (hora)', qty: 2, price: 34 },
      { desc: 'Material eléctrico (a justificar)', qty: 1, price: 45 },
    ],
  },
  {
    id: 'pintor',
    icon: '🎨',
    label: 'Pintor',
    lines: [
      { desc: 'Pintura plástica habitación (mano de obra + material)', qty: 1, price: 220 },
      { desc: 'Preparación, lijado y protección mobiliario', qty: 1, price: 45 },
    ],
  },
  {
    id: 'clima',
    icon: '❄️',
    label: 'Clima',
    lines: [
      { desc: 'Revisión / carga aire acondicionado', qty: 1, price: 65 },
      { desc: 'Mano de obra instalación (hora)', qty: 2, price: 35 },
    ],
  },
  {
    id: 'albanil',
    icon: '🧱',
    label: 'Albañil / Reforma',
    lines: [
      { desc: 'Visita y medición en obra', qty: 1, price: 0 },
      { desc: 'Mano de obra reforma (día)', qty: 1, price: 220 },
      { desc: 'Materiales (a justificar)', qty: 1, price: 120 },
    ],
  },
  {
    id: 'cerrajero',
    icon: '🔑',
    label: 'Cerrajero',
    lines: [
      { desc: 'Apertura puerta + desplazamiento (laborable)', qty: 1, price: 70 },
      { desc: 'Cerradura / bombín (según modelo)', qty: 1, price: 60 },
    ],
  },
]

export const COMMON_EXTRAS: QuoteLine[] = [
  { desc: 'Desplazamiento fuera Burgos capital (Gamonal, Villatoro…)', qty: 1, price: 15 },
  { desc: 'Urgencia fin de semana / festivo', qty: 1, price: 40 },
  { desc: 'Limpieza y retirada escombro', qty: 1, price: 30 },
]
