// Shared gym equipment SVG decorations — used in Login and Registrar pages.

export function SvgDumbbell({ style }) {
  return (
    <svg viewBox="0 0 320 100" fill="currentColor" style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="0"   y="18" width="36"  height="64" rx="8"/>
      <rect x="36"  y="6"  width="22"  height="88" rx="6"/>
      <rect x="58"  y="40" width="204" height="20" rx="10"/>
      <rect x="262" y="6"  width="22"  height="88" rx="6"/>
      <rect x="284" y="18" width="36"  height="64" rx="8"/>
    </svg>
  )
}

export function SvgPlate({ style }) {
  // evenodd: outer filled → ring hole → inner ring → center hole → hub
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

// Full decorative background — absolute positioned, pointer-events none
export function GymDecorBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <SvgDumbbell style={{ position: 'absolute', top: -24, right: -70,  width: 420, color: '#6366f1', opacity: 0.055, transform: 'rotate(-14deg)' }} />
      <SvgDumbbell style={{ position: 'absolute', bottom: -16, left: -100, width: 320, color: '#818cf8', opacity: 0.04,  transform: 'rotate(18deg)' }} />
      <SvgDumbbell style={{ position: 'absolute', top: '48%', right: -30, width: 200, color: '#6366f1', opacity: 0.03,  transform: 'rotate(-6deg)' }} />
      <SvgPlate   style={{ position: 'absolute', top: '6%',  left: '12%', width: 130, color: '#6366f1', opacity: 0.045 }} />
      <SvgPlate   style={{ position: 'absolute', bottom: '8%', right: '4%', width: 180, color: '#818cf8', opacity: 0.035 }} />
      <SvgPlate   style={{ position: 'absolute', top: '-4%', left: '45%', width: 100, color: '#6366f1', opacity: 0.03 }} />
    </div>
  )
}
