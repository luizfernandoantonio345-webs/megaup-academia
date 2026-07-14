import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

function isChunkError(error) {
  const msg = error?.message ?? ''
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('ChunkLoadError') ||
    error?.name === 'ChunkLoadError'
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)

    if (isChunkError(error)) {
      const key = 'chunk_reload_count'
      const count = parseInt(sessionStorage.getItem(key) || '0')
      if (count < 3) {
        sessionStorage.setItem(key, String(count + 1))
        window.location.reload()
      }
    }
  }

  render() {
    if (this.state.error) {
      const chunkErr = isChunkError(this.state.error)
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 24,
        }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(248,113,113,0.08)',
            }}>
              <RefreshCw style={{ width: 20, height: 20, color: '#FF8078' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.03em' }}>
              Algo deu errado
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22, lineHeight: 1.65 }}>
              {chunkErr
                ? 'Nova versão disponível. Recarregando…'
                : (this.state.error?.message || 'Erro inesperado nesta página.')}
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('chunk_reload_count')
                window.location.reload()
              }}
              style={{
                background: 'linear-gradient(135deg,#E8342B,#C8291F)', color: 'white',
                border: 'none', borderRadius: 12, padding: '11px 26px',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 16px rgba(232,52,43,0.35)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Recarregar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
