'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // On global-level error, always try a full reload once
    const key = 'global_error_reload'
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      window.location.reload()
    } else {
      sessionStorage.removeItem(key)
    }
  }, [])

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#0D0D0F', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center',
        }}>
          <div style={{ maxWidth: 340 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(232,52,43,0.1)', border: '1px solid rgba(232,52,43,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <RefreshCw style={{ width: 22, height: 22, color: '#FF8078' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F4F4F5', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Algo deu errado
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24, lineHeight: 1.65 }}>
              Ocorreu um erro crítico. A página será recarregada automaticamente.
            </p>
            <button
              onClick={() => { sessionStorage.clear(); window.location.reload() }}
              style={{
                background: 'linear-gradient(135deg,#E8342B,#C8291F)', color: 'white',
                border: 'none', borderRadius: 12, padding: '11px 28px',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 18px rgba(232,52,43,0.38)',
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Recarregar página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
