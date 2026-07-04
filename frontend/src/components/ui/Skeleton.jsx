export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 rounded-lg ${className}`} />
}

export function SkeletonCircle({ size = 10 }) {
  return <div className={`skeleton rounded-full flex-shrink-0`} style={{ width: size * 4, height: size * 4 }} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={10} />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-1/3 h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine className="w-2/3 h-3" />
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-12 h-7" />
        <SkeletonLine className="w-24 h-3" />
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <SkeletonCircle size={8} />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-1/3 h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className={j === 0 ? 'w-full' : 'w-16'} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 200 }) {
  return (
    <div className="relative overflow-hidden rounded-xl" style={{ height, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '16px 12px 0' }}>
        {[65, 40, 80, 55, 70, 35, 90].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t-lg" style={{ height: `${h}%`, opacity: 0.6 + i * 0.04 }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <SkeletonLine className="w-48 h-8" />
        <SkeletonLine className="w-72 h-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
