import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEY } from './lib/quotes'
import type { BusinessProfile, Quote } from './lib/quotes'

interface State {
  profile: BusinessProfile
  quotes: Quote[]
  paid: boolean
  setProfile: (p: BusinessProfile) => void
  addQuote: (q: Quote) => void
  updateQuote: (id: string, patch: Partial<Quote>) => void
  deleteQuote: (id: string) => void
  markPaid: (v: boolean) => void
}

export const defaultProfile: BusinessProfile = {
  name: '',
  cif: '',
  phone: '',
  email: '',
  logoB64: '',
  defaultIVA: 0.21,
  conditions: 'Presupuesto valido 15 dias. No incluye trabajos no descritos.',
  nextNumber: 1,
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      quotes: [],
      paid: false,
      setProfile: (p) => set({ profile: p }),
      addQuote: (q) =>
        set((s) => ({
          quotes: [q, ...s.quotes],
          profile: { ...s.profile, nextNumber: (s.profile.nextNumber || 1) + 1 },
        })),
      updateQuote: (id, patch) =>
        set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      deleteQuote: (id) => set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),
      markPaid: (v) => set({ paid: v }),
    }),
    { name: STORAGE_KEY, version: 2 },
  ),
)

export const nextQuoteNumber = (n: number) => `2026-${String(n).padStart(3, '0')}`
