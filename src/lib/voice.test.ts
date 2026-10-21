import { describe, it, expect } from 'vitest'
import { voiceSupported } from './voice'

describe('voice', () => {
  it('reports support status (false in jsdom without SpeechRecognition)', () => {
    expect(typeof voiceSupported()).toBe('boolean')
  })
})