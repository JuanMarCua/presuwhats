import { z } from 'zod'

// PresuWhats domain — Burgos trades, euros, IVA 10/21%
export const IVA_RATES = [0.1, 0.21] as const
export type IvaRate = (typeof IVA_RATES)[number

]
export const QuoteLineSchema = z.object({
  desc: z.string().min(1, 'Describe el trabajo').max(200),
  qty: z.number().min(0.01).max(10000),
  price: z.number().min(0).max(1000000),
})
export type QuoteLine = z.infer<typeof QuoteLineSchema>

export const BusinessProfileSchema = z.object({
  name: z.string().min(1, 'Tu nombre o empresa').max(100),
  cif: z.string().max(20).optional().default(''),
  phone: z.string().min(9, 'Telefono 9 digitos').max(15),
  email: z.string().email('Email no valido').optional().or(z.literal('')),
  logoB64: z.string().optional().default(''),
  defaultIVA: z.union([z.literal(0.1), z.literal(0.21)]).default(0.21),
  conditions: z.string().max(500).default('Presupuesto valido 15 dias. No incluye trabajos no descritos.'),
  nextNumber: z.number().int().min(1).default(1),
})
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>

export type QuoteStatus = 'pendiente' | 'aceptado' | 'rechazado'

export interface Quote {
  id: string
  number: string
  clientName: string
  clientPhone: string
  lines: QuoteLine[]
  ivaRate: IvaRate
  notes: string
  status: QuoteStatus
  createdAt: string
  sentAt: string | null
  remindedAt: string | null
  photosB64?: string[]
  signatureB64?: string
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function calcTotals(lines: QuoteLine[], ivaRate: IvaRate) {
  const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.price, 0))
  const iva = round2(subtotal * ivaRate)
  const total = round2(subtotal + iva)
  return { subtotal, iva, total }
}

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export function normalizePhoneES(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('34') && digits.length === 11) return digits
  if (digits.length === 9) return `34${digits}`
  return digits
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhoneES(phone)}?text=${encodeURIComponent(text)}`
}

export function waNewQuoteText(q: Quote, total: number): string {
  return (
    `Hola ${q.clientName}, te paso el presupuesto ${q.number} por ${eur(total)} IVA incluido. ` +
    `Te adjunto el PDF. Validez 15 dias. Confirmame por aqui si te encaja. Gracias!`
  )
}

export function waReminderText(q: Quote, total: number): string {
  return (
    `Hola ${q.clientName}, te escribo por el presupuesto ${q.number} de ${eur(total)}. ` +
    `Sigue disponible esta semana. Te lo reservo? Gracias!`
  )
}

export const STORAGE_KEY = 'presuwhats_v1'
