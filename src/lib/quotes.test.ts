import { describe, expect, it } from 'vitest'
import { calcTotals, eur, normalizePhoneES, waLink, QuoteLineSchema, BusinessProfileSchema, waNewQuoteText, waReminderText } from './quotes'
import { COMMON_EXTRAS, TRADE_TEMPLATES } from './templates'
import { nextQuoteNumber, defaultProfile } from '../store'

describe('calcTotals', () => {
  it('suma lineas con IVA 21', () => {
    const r = calcTotals([{ desc: 'Grifo', qty: 1, price: 100 }], 0.21)
    expect(r).toEqual({ subtotal: 100, iva: 21, total: 121 })
  })
  it('IVA 10 para reformas vivienda', () => {
    const r = calcTotals([{ desc: 'Pintar salon', qty: 2, price: 150 }], 0.1)
    expect(r).toEqual({ subtotal: 300, iva: 30, total: 330 })
  })
  it('redondea a 2 decimales', () => {
    const r = calcTotals([{ desc: 'Hora', qty: 1.5, price: 33.333 }], 0.21)
    expect(r.total).toBeCloseTo(60.5, 1)
  })
  it('vacio es cero', () => {
    expect(calcTotals([], 0.21)).toEqual({ subtotal: 0, iva: 0, total: 0 })
  })
})

describe('formato euro', () => {
  it('formatea es-ES', () => {
    expect(eur(121)).toMatch(/121/)
    expect(eur(121)).toMatch(/€/)
  })
})

describe('WhatsApp ES', () => {
  it('anade 34 a movil 9 digitos', () => {
    expect(normalizePhoneES('647123456')).toBe('34647123456')
  })
  it('respeta 34 existente', () => {
    expect(normalizePhoneES('34647123456')).toBe('34647123456')
  })
  it('genera wa.me con texto', () => {
    const link = waLink('647123456', 'Hola Manolo')
    expect(link.startsWith('https://wa.me/34647123456?text=')).toBe(true)
  })
})

describe('validacion de lineas (Zod)', () => {
  it('acepta una linea valida', () => {
    const r = QuoteLineSchema.safeParse({ desc: 'Cambiar grifo', qty: 2, price: 85.5 })
    expect(r.success).toBe(true)
  })
  it('rechaza descripcion vacia', () => {
    expect(QuoteLineSchema.safeParse({ desc: '', qty: 1, price: 10 }).success).toBe(false)
  })
  it('rechaza cantidad cero o negativa', () => {
    expect(QuoteLineSchema.safeParse({ desc: 'x', qty: 0, price: 10 }).success).toBe(false)
    expect(QuoteLineSchema.safeParse({ desc: 'x', qty: -1, price: 10 }).success).toBe(false)
  })
  it('rechaza precio negativo', () => {
    expect(QuoteLineSchema.safeParse({ desc: 'x', qty: 1, price: -5 }).success).toBe(false)
  })
  it('exige descripcion de maximo 200 caracteres', () => {
    expect(QuoteLineSchema.safeParse({ desc: 'a'.repeat(201), qty: 1, price: 1 }).success).toBe(false)
    expect(QuoteLineSchema.safeParse({ desc: 'a'.repeat(200), qty: 1, price: 1 }).success).toBe(true)
  })
})

describe('perfil de negocio (Zod)', () => {
  it('el perfil por defecto es valido', () => {
    const r = BusinessProfileSchema.safeParse({ ...defaultProfile, name: 'Manolo', phone: '647123456' })
    expect(r.success).toBe(true)
  })
  it('exige nombre de negocio', () => {
    expect(BusinessProfileSchema.safeParse({ ...defaultProfile, name: '', phone: '647123456' }).success).toBe(false)
  })
  it('exige telefono de 9 digitos', () => {
    expect(BusinessProfileSchema.safeParse({ ...defaultProfile, name: 'Manolo', phone: '123' }).success).toBe(false)
  })
  it('rechaza email invalido', () => {
    expect(BusinessProfileSchema.safeParse({ ...defaultProfile, name: 'M', phone: '647123456', email: 'no-es-email' }).success).toBe(false)
  })
  it('acepta email valido y cadena vacia', () => {
    expect(BusinessProfileSchema.safeParse({ ...defaultProfile, name: 'M', phone: '647123456', email: 'a@b.es' }).success).toBe(true)
    expect(BusinessProfileSchema.safeParse({ ...defaultProfile, name: 'M', phone: '647123456', email: '' }).success).toBe(true)
  })
})

describe('numeracion de presupuestos', () => {
  it('formatea 2026-001 a partir de 1', () => {
    expect(nextQuoteNumber(1)).toBe('2026-001')
  })
  it('rellena con ceros a 3 digitos', () => {
    expect(nextQuoteNumber(42)).toBe('2026-042')
  })
  it('formatea numeros de 3+ digitos', () => {
    expect(nextQuoteNumber(123)).toBe('2026-123')
  })
})

describe('plantillas y extras', () => {
  it('hay 6 oficios con lineas validas', () => {
    expect(TRADE_TEMPLATES).toHaveLength(6)
    for (const t of TRADE_TEMPLATES) {
      expect(t.lines.length).toBeGreaterThan(0)
      for (const l of t.lines) expect(QuoteLineSchema.safeParse(l).success).toBe(true)
    }
  })
  it('los extras comunes son lineas validas', () => {
    expect(COMMON_EXTRAS.length).toBeGreaterThan(0)
    for (const e of COMMON_EXTRAS) expect(QuoteLineSchema.safeParse(e).success).toBe(true)
  })
  it('las lineas de plantilla tienen precios coherentes', () => {
    const fontanero = TRADE_TEMPLATES.find((t) => t.id === 'fontanero')!
    expect(fontanero.lines[0].price).toBe(35)
    expect(fontanero.lines[0].qty).toBe(1)
  })
})

describe('texto de WhatsApp', () => {
  const q = {
    id: '1', number: '2026-001', clientName: 'Juan', clientPhone: '647123456',
    lines: [{ desc: 'Grifo', qty: 1, price: 100 }], ivaRate: 0.21 as const, notes: '',
    status: 'pendiente' as const, createdAt: new Date().toISOString(), sentAt: null, remindedAt: null,
  }
  it('el mensaje de nuevo presupuesto incluye nombre, numero y total', () => {
    const t = waNewQuoteText(q, 121)
    expect(t).toContain('Juan')
    expect(t).toContain('2026-001')
    expect(t).toContain('121')
  })
  it('el recordatorio incluye el numero', () => {
    expect(waReminderText(q, 121)).toContain('2026-001')
  })
  it('el total del ejemplo de la landing es 180,29', () => {
    const t = calcTotals(
      [{ desc: 'Cambiar grifo cocina', qty: 1, price: 85 }, { desc: 'Mano de obra', qty: 2, price: 32 }],
      0.21,
    )
    expect(t.total).toBe(180.29)
  })
})
