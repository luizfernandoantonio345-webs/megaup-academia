import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

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
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 24,
        }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <RefreshCw style={{ width: 20, height: 20, color: '#f87171' }} />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color:'var(--text-primary)', marginBottom: 8 }}>
              Algo deu errado
            </h2>
            <p style={{ color:'var(--text-muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              {this.state.error?.message || 'Erro inesperado nesta página.'}
            </p>
            <button
              onClick={() => this.setState({ error: null, errorInfo: null })}
              style={{
                background: '#ef4444', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

