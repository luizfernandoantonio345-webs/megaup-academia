/**
 * MEGAUP — Sistema de Marca
 *
 * Símbolo: duas setas ascendentes que formam a letra M.
 * Leitura dupla: "M" de MEGA + "↑↑" de UP.
 * Traço aberto, geométrico, direto.
 */

/* ── Ícone: M de duas setas ────────────────────────────────── */
export function IconMark({ size = 32, color = '#E8342B' }) {
  const sw = Math.max(3, size * 0.115)
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 40 44"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Barra esquerda */}
      <line x1="4"  y1="22" x2="4"  y2="44" />
      {/* Barra direita */}
      <line x1="36" y1="22" x2="36" y2="44" />
      {/* Seta esquerda ↑ */}
      <polyline points="0,22 4,11 8,22" />
      {/* Seta direita ↑ */}
      <polyline points="32,22 36,11 40,22" />
      {/* V central — forma o M */}
      <polyline points="4,22 20,37 36,22" />
    </svg>
  )
}

/* ── Badge: fundo vermelho + símbolo branco ─────────────────── */
export function IconBadge({ size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        background: '#E8342B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <IconMark size={size * 0.64} color="white" />
    </div>
  )
}

/* ── Wordmark: MEGA (claro) + UP (vermelho) ─────────────────── */
export function LogoWordmark({ size = 18, light = false }) {
  const primary = light ? '#141416' : '#F4F4F5'
  const st = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 900,
    fontSize: size,
    letterSpacing: '-0.05em',
    lineHeight: 1,
    userSelect: 'none',
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={{ ...st, color: primary }}>MEGA</span>
      <span style={{ ...st, color: '#E8342B' }}>UP</span>
    </span>
  )
}

/* ── Logo completa: badge + wordmark + tagline opcional ─────── */
export function LogoFull({
  size       = 18,
  showTagline = false,
  useBadge   = false,
  light      = false,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.55) }}>
      {useBadge
        ? <IconBadge size={Math.round(size * 1.9)} />
        : <IconMark  size={Math.round(size * 1.6)} color="#E8342B" />
      }
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LogoWordmark size={size} light={light} />
        {showTagline && (
          <span style={{
            fontFamily:    'Inter, system-ui, sans-serif',
            fontSize:      Math.round(size * 0.48),
            fontWeight:    500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         light ? '#71717A' : 'var(--text-muted, #71717A)',
            lineHeight:    1,
            userSelect:    'none',
          }}>
            Jardim das Rosas
          </span>
        )}
      </div>
    </div>
  )
}

export default LogoFull
