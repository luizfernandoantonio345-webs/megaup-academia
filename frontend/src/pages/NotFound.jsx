import { Link } from 'react-router-dom'
import { Home, Dumbbell } from 'lucide-react'
import { GymDecorBg } from '../components/GymDecorBg'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background:'var(--bg-page)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      <GymDecorBg />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 380 }} className="animate-fade-in">
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Dumbbell style={{ width: 28, height: 28, color: '#ef4444' }} />
        </div>

        <p style={{ fontSize: 80, fontWeight: 600, color: 'var(--bg-elevated)', lineHeight: 1, margin: '0 0 4px' }}>404</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color:'var(--text-primary)', marginBottom: 8 }}>
          Página não encontrada
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Essa rota não existe ou foi movida. Voltamos para o dashboard?
        </p>

        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#ef4444', color: 'white', borderRadius: 12,
            padding: '11px 22px', fontWeight: 600, fontSize: 13, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <Home style={{ width: 14, height: 14 }} />
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  )
}

