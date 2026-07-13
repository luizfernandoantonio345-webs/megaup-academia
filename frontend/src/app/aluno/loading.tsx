export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 16px', paddingBottom: 100 }}>
      {/* Hero header */}
      <div className="skeleton" style={{ height: 180, borderRadius: 22 }} />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[0,1,2].map(i => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
        ))}
      </div>

      {/* Main card */}
      <div className="skeleton" style={{ height: 260, borderRadius: 20 }} />

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  )
}
