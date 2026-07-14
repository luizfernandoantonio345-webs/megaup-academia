export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Acesso negado</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Você não tem permissão para acessar esta página.</p>
        <a href="/login" style={{ color: '#FF8078', fontWeight: 600, fontSize: 14 }}>Voltar ao login</a>
      </div>
    </div>
  )
}
