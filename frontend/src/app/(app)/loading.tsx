export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 140, height: 16, borderRadius: 8 }} />
        </div>
        <div className="skeleton" style={{ width: 120, height: 42, borderRadius: 13 }} />
      </div>

      {/* Bento row 1: hero + 2 cards */}
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 22 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ flex: 1, borderRadius: 20, minHeight: 140 }} />
          <div className="skeleton" style={{ flex: 1, borderRadius: 20, minHeight: 140 }} />
        </div>
      </div>

      {/* Small stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 84, borderRadius: 18 }} />
        ))}
      </div>

      {/* Chart + feed */}
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0,1fr) 308px' }}>
        <div className="skeleton" style={{ height: 260, borderRadius: 22 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 22 }} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 22 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 22 }} />
      </div>
    </div>
  )
}
