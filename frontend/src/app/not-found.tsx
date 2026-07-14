import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <p style={{ fontSize: 64, fontWeight: 800, color: 'var(--border)', letterSpacing: '-4px', marginBottom: 8 }}>404</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Página não encontrada</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>A página que você procura não existe.</p>
        <Link href="/dashboard" style={{ color: '#FF8078', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
