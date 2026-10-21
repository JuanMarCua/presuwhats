import { describe, expect, it } from 'vitest'
import { calcTotals, eur, normalizePhoneES, waLink } from './quotes'

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
