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
      const key = 'chunk_reload_count'
      const count = parseInt(sessionStorage.getItem(key) || '0')
      if (count < 3) {
        sessionStorage.setItem(key, String(count + 1))
        window.location.reload()
        return
      }
    }
    // Reset counter on non-chunk errors so future deploys still work
    sessionStorage.removeItem('chunk_reload_count')
  }, [error])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0C0C0D', padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 340 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 24px rgba(239,68,68,0.1)',
        }}>
          <RefreshCw style={{ width: 22, height: 22, color: '#f87171' }} />
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
            sessionStorage.removeItem('chunk_reload_count')
            window.location.reload()
          }}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
            border: 'none', borderRadius: 12, padding: '11px 28px',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 18px rgba(239,68,68,0.38)',
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
