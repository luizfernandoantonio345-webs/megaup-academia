export default function EmptyState({ icon: Icon, title, message, action, actionLabel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', gap: 12 }}>
      {Icon && (
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <Icon style={{ width: 28, height: 28, color: '#71717A' }} />
        </div>
      )}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: '#71717A' }}>{title}</p>
      {message && <p style={{ fontSize: 13, color: '#52525B', maxWidth: 300 }}>{message}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          style={{ marginTop: 8, background: '#6366f1', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '10px 24px', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
