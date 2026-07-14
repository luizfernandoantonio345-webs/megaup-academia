// Shared gym equipment SVG decorations + hero variants for Login/Registrar

// ── Background decorator — used at low opacity (no gradients needed, shape is what matters)
export function SvgDumbbell({ style }) {
  return (
    <svg viewBox="0 0 360 116" fill="currentColor" style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="0"   y="18" width="46"  height="80"  rx="11"/>
      <rect x="46"  y="6"  width="26"  height="104" rx="7"/>
      <rect x="72"  y="35" width="14"  height="46"  rx="5"/>
      <rect x="86"  y="47" width="188" height="22"  rx="11"/>
      <rect x="274" y="35" width="14"  height="46"  rx="5"/>
      <rect x="288" y="6"  width="26"  height="104" rx="7"/>
      <rect x="314" y="18" width="46"  height="80"  rx="11"/>
    </svg>
  )
}

export function SvgPlate({ style }) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" style={style} xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M60 60 m-56 0 a56 56 0 1 1 112 0 a56 56 0 1 1-112 0
        M60 60 m-42 0 a42 42 0 1 1  84 0 a42 42 0 1 1 -84 0
        M60 60 m-30 0 a30 30 0 1 1  60 0 a30 30 0 1 1 -60 0
        M60 60 m-14 0 a14 14 0 1 1  28 0 a14 14 0 1 1 -28 0
        M60 60 m -8 0 a 8  8 0 1 1  16 0 a 8  8 0 1 1 -16 0
      "/>
    </svg>
  )
}

// ── Hero variant — metallic gradients, for Login / Registrar left panel
// uid must be unique per page instance so SVG gradient IDs don't clash
export function SvgDumbbellHero({ style, uid = 'hero' }) {
  const p = `gh-${uid}`
  return (
    <svg viewBox="0 0 360 120" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Outer plate — dark iron, lighter at edges */}
        <linearGradient id={`${p}-op`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6B7280"/>
          <stop offset="18%"  stopColor="#27272A"/>
          <stop offset="45%"  stopColor="#141416"/>
          <stop offset="78%"  stopColor="#27272A"/>
          <stop offset="100%" stopColor="#6B7280"/>
        </linearGradient>
        {/* Inner plate — slightly lighter zinc */}
        <linearGradient id={`${p}-ip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9CA3AF"/>
          <stop offset="18%"  stopColor="#3F3F46"/>
          <stop offset="45%"  stopColor="#1C1C1E"/>
          <stop offset="78%"  stopColor="#3F3F46"/>
          <stop offset="100%" stopColor="#9CA3AF"/>
        </linearGradient>
        {/* Collar — MegaUp red metallic */}
        <linearGradient id={`${p}-cl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FF8078"/>
          <stop offset="50%"  stopColor="#E8342B"/>
          <stop offset="100%" stopColor="#b91c1c"/>
        </linearGradient>
        {/* Bar — chrome / steel */}
        <linearGradient id={`${p}-br`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D1D5DB"/>
          <stop offset="22%"  stopColor="#9CA3AF"/>
          <stop offset="50%"  stopColor="#52525B"/>
          <stop offset="78%"  stopColor="#9CA3AF"/>
          <stop offset="100%" stopColor="#D1D5DB"/>
        </linearGradient>
        {/* Shadow ellipse */}
        <radialGradient id={`${p}-sh`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="black" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="black" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="180" cy="117" rx="148" ry="4" fill={`url(#${p}-sh)`}/>

      {/* ── Left side ── */}
      {/* Outer plate */}
      <rect x="0"  y="18" width="46" height="80" rx="11" fill={`url(#${p}-op)`}/>
      <rect x="41" y="18" width="5"  height="80" rx="2"  fill="#71717A" fillOpacity="0.45"/>

      {/* Inner plate */}
      <rect x="46" y="6"  width="26" height="104" rx="7" fill={`url(#${p}-ip)`}/>
      <rect x="68" y="6"  width="4"  height="104" rx="2" fill="#A1A1AA" fillOpacity="0.35"/>

      {/* Collar */}
      <rect x="72" y="35" width="14" height="46" rx="5" fill={`url(#${p}-cl)`}/>
      <rect x="72" y="35" width="14" height="6"  rx="2" fill="white"   fillOpacity="0.12"/>

      {/* ── Bar ── */}
      <rect x="86"  y="47" width="188" height="22" rx="11" fill={`url(#${p}-br)`}/>
      {/* Top highlight */}
      <rect x="90"  y="47" width="180" height="4"  rx="2" fill="white" fillOpacity="0.09"/>
      {/* Knurling segments */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={95 + i * 20} y={52} width={10} height={12} rx={2} fill="#1F1F23" fillOpacity={0.5}/>
      ))}

      {/* ── Right side (mirror) ── */}
      {/* Collar */}
      <rect x="274" y="35" width="14" height="46" rx="5" fill={`url(#${p}-cl)`}/>
      <rect x="274" y="35" width="14" height="6"  rx="2" fill="white"   fillOpacity="0.12"/>

      {/* Inner plate */}
      <rect x="288" y="6"  width="26" height="104" rx="7" fill={`url(#${p}-ip)`}/>
      <rect x="288" y="6"  width="4"  height="104" rx="2" fill="#A1A1AA" fillOpacity="0.35"/>

      {/* Outer plate */}
      <rect x="314" y="18" width="46" height="80" rx="11" fill={`url(#${p}-op)`}/>
      <rect x="314" y="18" width="5"  height="80" rx="2"  fill="#71717A" fillOpacity="0.45"/>
    </svg>
  )
}

// ── Full decorative background — absolute-positioned, pointer-events none
export function GymDecorBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <SvgDumbbell style={{
        position: 'absolute', top: -30, right: -80, width: 460,
        color: '#E8342B', opacity: 0.05, transform: 'rotate(-13deg)',
        animation: 'float 9s ease-in-out infinite',
      }} />
      <SvgDumbbell style={{
        position: 'absolute', bottom: -20, left: -110, width: 360,
        color: '#FF8078', opacity: 0.038, transform: 'rotate(17deg)',
        animation: 'float 11s ease-in-out infinite 2s',
      }} />
      <SvgDumbbell style={{
        position: 'absolute', top: '44%', right: -40, width: 220,
        color: '#E8342B', opacity: 0.028, transform: 'rotate(-7deg)',
        animation: 'float 7s ease-in-out infinite 1s',
      }} />
      <SvgPlate style={{
        position: 'absolute', top: '4%', left: '10%', width: 140,
        color: '#E8342B', opacity: 0.04,
        animation: 'float 13s ease-in-out infinite 0.5s',
      }} />
      <SvgPlate style={{
        position: 'absolute', bottom: '6%', right: '3%', width: 190,
        color: '#FF8078', opacity: 0.032,
        animation: 'float 10s ease-in-out infinite 3s',
      }} />
      <SvgPlate style={{
        position: 'absolute', top: '-5%', left: '43%', width: 110,
        color: '#E8342B', opacity: 0.025,
        animation: 'float 8s ease-in-out infinite 1.5s',
      }} />
    </div>
  )
}

