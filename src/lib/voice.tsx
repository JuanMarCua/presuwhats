import { useCallback, useEffect, useRef, useState } from 'react'

export interface VoiceState {
  supported: boolean
  listening: boolean
  transcript: string
  error: string | null
}

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? ((window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ??
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition)
    : undefined

export function voiceSupported(): boolean {
  return !!SpeechRecognitionCtor
}

export function useVoice(
  onResult: (transcript: string) => void,
): VoiceState & { start: () => void; stop: () => void } {
  const [supported, setSupported] = useState<boolean>(false)
  const [listening, setListening] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<any>(null)

  useEffect(() => {
    setSupported(!!SpeechRecognitionCtor)
    return () => {
      if (recRef.current) {
        try {
          recRef.current.stop()
        } catch {
          /* noop */
        }
      }
    }
  }, [])

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor || listening) return
    setError(null)
    setTranscript('')
    const rec = new SpeechRecognitionCtor()
    rec.lang = 'es-ES'
    rec.continuous = true
    rec.interimResults = true
    let finalText = ''
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '
        else interim += t
      }
      const full = (finalText + interim).trim()
      setTranscript(full)
      onResult(full)
    }
    rec.onend = () => {
      recRef.current = null
      setListening(false)
    }
    rec.onerror = (e: any) => {
      setError(e.error ?? 'error de reconocimiento')
      recRef.current = null
      setListening(false)
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [listening, onResult])

  const stop = useCallback(() => {
    const rec = recRef.current
    recRef.current = null
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* noop */
      }
    }
    setListening(false)
  }, [])

  return { supported, listening, transcript, error, start, stop }
}

export function MicButton({ onResult, className = '' }: { onResult: (t: string) => void; className?: string }) {
  const v = useVoice(onResult)
  if (!v.supported) return null
  return (
    <button
      type="button"
      onClick={() => (v.listening ? v.stop() : v.start())}
      title={v.listening ? 'Detener dictado de voz' : 'Dictar por voz (es-ES)'}
      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition ${v.listening ? 'bg-red-100 text-red-700 animate-pulse' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'} ${className}`}
      aria-label={v.listening ? 'Detener dictado' : 'Microfono'}
      aria-pressed={v.listening}
    >
      {v.listening ? '⏹' : '🎙'}
    </button>
  )
}