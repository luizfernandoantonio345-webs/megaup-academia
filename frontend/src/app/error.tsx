'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError') ||
      error?.name === 'ChunkLoadError'

    if (isChunkError) {
      // Hard-reload via URL com timestamp = ignora cache do browser completamente
      const url = new URL(window.location.href)
      const alreadyReloaded = url.searchParams.get('_cr')
      if (!alreadyReloaded) {
        url.searchParams.set('_cr', Date.now().toString())
        window.location.replace(url.toString())
        return
      }
    }
    // Não é chunk error — remove o param se existir
    const url = new URL(window.location.href)
    if (url.searchParams.has('_cr')) {
      url.searchParams.delete('_cr')
      window.history.replaceState({}, '', url.toString())
    }
  }, [error])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0D0D0F', padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 340 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'rgba(232,52,43,0.1)', border: '1px solid rgba(232,52,43,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 24px rgba(232,52,43,0.1)',
        }}>
          <RefreshCw style={{ width: 22, height: 22, color: '#FF8078' }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F4F4F5', letterSpacing: '-0.03em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
          Algo deu errado
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24, lineHeight: 1.65 }}>
          {error?.message?.includes('fetch') || error?.message?.includes('chunk')
            ? 'Nova versão disponível. Recarregando automaticamente…'
            : 'Ocorreu um erro inesperado nesta página.'}
        </p>
        <button
          onClick={() => {
            // Hard-reload sem cache
            const url = new URL(window.location.href)
            url.searchParams.set('_cr', Date.now().toString())
            window.location.replace(url.toString())
          }}
          style={{
            background: 'linear-gradient(135deg, #E8342B, #C8291F)', color: 'white',
            border: 'none', borderRadius: 12, padding: '11px 28px',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 18px rgba(232,52,43,0.38)',
            fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em',
          }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} />
          Recarregar página
        </button>
      </div>
    </div>
  )
}
