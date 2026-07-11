import { IconMark, IconBadge, LogoFull, LogoWordmark } from '../components/LogoMegaUp'

/* ── helpers ────────────────────────────────────────────────── */
function Label({ children }) {
  return (
    <p style={{
      marginTop: 16,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      textAlign: 'center',
    }}>{children}</p>
  )
}

function Sub({ children }) {
  return (
    <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-disabled)', textAlign: 'center' }}>
      {children}
    </p>
  )
}

function Section({ title, desc, children }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#ef4444', marginBottom: 6,
        }}>
          {title}
        </p>
        {desc && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 540, lineHeight: 1.6 }}>
            {desc}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Tile({ label, sub, bg = 'var(--bg-card)', border, minH = 160, children }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border ?? 'var(--border)'}`,
      borderRadius: 14,
      padding: '36px 28px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: minH,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {children}
      </div>
      {label && <Label>{label}</Label>}
      {sub   && <Sub>{sub}</Sub>}
    </div>
  )
}

/* ── Mockup: sidebar desktop ───────────────────────────────── */
function SidebarMockup() {
  const items = ['Dashboard', 'Alunos', 'Analytics', 'Agenda', 'Exercícios']
  return (
    <div style={{
      width: 200,
      background: '#0A0A0B',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 10px',
    }}>
      <div style={{ padding: '2px 4px 14px' }}>
        <LogoFull size={14} useBadge showTagline />
      </div>
      {items.map((item, i) => (
        <div key={item} style={{
          padding: '7px 10px',
          borderRadius: 6,
          fontSize: 12,
          color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
          background: i === 0 ? 'var(--bg-elevated)' : 'transparent',
          marginBottom: 1,
        }}>
          {item}
        </div>
      ))}
    </div>
  )
}

/* ── Mockup: barra de navegação landing ───────────────────────*/
function NavMockup() {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(12,12,13,0.97)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 8,
      padding: '11px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <LogoFull size={15} />
      <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>Modalidades</span>
        <span>Planos</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>Matricule-se</span>
      </div>
    </div>
  )
}

/* ── Mockup: tela de login ────────────────────────────────── */
function AuthMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <IconBadge size={56} />
      <LogoWordmark size={30} />
      <span style={{
        fontSize: 11, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
      }}>
        Jardim das Rosas
      </span>
    </div>
  )
}

/* ── Paleta ───────────────────────────────────────────────── */
const CORES = [
  { swatch: '#ef4444', name: 'MegaUp Red',  hex: '#ef4444', role: 'Primária — ícone, CTA, destaque' },
  { swatch: '#f87171', name: 'Red Light',   hex: '#f87171', role: 'Hover, estados ativos, gradiente' },
  { swatch: '#F4F4F5', name: 'Zinc 100',    hex: '#F4F4F5', role: 'Texto principal sobre fundo escuro' },
  { swatch: '#0C0C0D', name: 'Near Black',  hex: '#0C0C0D', role: 'Fundo do app', dark: true },
  { swatch: '#111113', name: 'Card',        hex: '#111113', role: 'Fundo de cards', dark: true },
  { swatch: '#27272A', name: 'Border',      hex: '#27272A', role: 'Bordas, separadores', dark: true },
]

/* ── Tipografia ──────────────────────────────────────────── */
const TYPE_SCALE = [
  { label: 'Display / Logo',    weight: 900, size: 38, text: 'MEGAUP',                         ls: '-0.05em' },
  { label: 'Hero / H1',         weight: 800, size: 30, text: 'Treinos. Resultados. Superação.', ls: '-0.04em' },
  { label: 'Título de seção',   weight: 700, size: 22, text: 'Alunos Ativos',                  ls: '-0.03em' },
  { label: 'Subtítulo / H3',    weight: 600, size: 16, text: 'Frequência desta semana',        ls: '-0.02em' },
  { label: 'Corpo de texto',    weight: 400, size: 14, text: 'Seu treino foi registrado. Continue evoluindo!', ls: '0' },
  { label: 'Label / Caption',   weight: 500, size: 11, text: 'FREQUÊNCIA SEMANAL',             ls: '0.12em', upper: true },
]

/* ── Tamanhos do símbolo ─────────────────────────────────── */
const ICON_SIZES = [16, 24, 32, 48, 64, 80]

/* ═══════════════════════════════════════════════════════════ */
export default function LogoDesigner() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 120px' }}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header style={{ marginBottom: 88 }}>
          <div style={{ marginBottom: 28 }}>
            <LogoFull size={22} useBadge />
          </div>
          <h1 style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-0.045em',
            lineHeight: 1.08,
            marginBottom: 18,
            background: 'linear-gradient(135deg, #F4F4F5 40%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Identidade Visual
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.65, marginBottom: 24 }}>
            Sistema de marca MegaUp Academia — símbolo, logotipo, paleta cromática
            e tipografia. Use estes elementos com consistência em todas as superfícies.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Inter 900', '#ef4444', '−0.05em tracking', 'v1.0 · 2026'].map(tag => (
              <span key={tag} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>{tag}</span>
            ))}
          </div>
        </header>

        {/* ── 1. SÍMBOLO ─────────────────────────────────────── */}
        <Section
          title="01 — Símbolo"
          desc="Duas setas ascendentes formam a letra M. A leitura é dupla: M de MEGA e ↑↑ de UP. Geométrico, limpo, sem ornamentos."
        >
          {/* 3 variantes principais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
            <Tile label="Primário" sub="Fundo escuro — uso padrão" bg="var(--bg-card)">
              <IconMark size={80} color="#ef4444" />
            </Tile>
            <Tile label="Badge" sub="App icon, favicon, avatar" bg="var(--bg-card)">
              <IconBadge size={80} />
            </Tile>
            <Tile label="Invertido" sub="Fundo claro" bg="#F0F0F2" border="#DDDDE3">
              <IconMark size={80} color="#ef4444" />
            </Tile>
          </div>

          {/* Escala */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '28px 36px',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 28,
            }}>
              Escala — Badge
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap' }}>
              {ICON_SIZES.map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <IconBadge size={s} />
                  <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>{s}px</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. LOGOTIPO ────────────────────────────────────── */}
        <Section
          title="02 — Logotipo"
          desc="MEGA em branco — UP em vermelho. Dois pesos, uma identidade. Sempre Inter 900, espaçamento −0.05em, caixa alta."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Tile label="Padrão — escuro" sub="Sidebar, nav, cabeçalho">
              <LogoFull size={22} useBadge />
            </Tile>
            <Tile label="Com tagline" sub="Landing page, perfil público">
              <LogoFull size={22} useBadge showTagline />
            </Tile>
            <Tile label="Grande — hero" sub="Tela de login, onboarding">
              <LogoFull size={34} useBadge showTagline />
            </Tile>
            <Tile label="Fundo claro" sub="PDF, materiais impressos" bg="#F0F0F2" border="#DDDDE3">
              <LogoFull size={22} useBadge light />
            </Tile>
          </div>

          {/* Só wordmark */}
          <div style={{
            marginTop: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 56,
            flexWrap: 'wrap',
          }}>
            {[14, 20, 28, 40].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <LogoWordmark size={s} />
                <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>{s}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 3. USO EM CONTEXTO ─────────────────────────────── */}
        <Section
          title="03 — Uso em contexto"
          desc="Como o logotipo aparece nas superfícies reais do produto."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Tile label="Sidebar — sistema" sub="Barra lateral do painel">
              <SidebarMockup />
            </Tile>
            <Tile label="Login / cadastro" sub="Painel esquerdo das telas de auth">
              <AuthMockup />
            </Tile>
          </div>
          <div style={{ marginTop: 14 }}>
            <Tile label="Nav — Landing Page" sub="Barra superior fixa do site público" minH={100}>
              <div style={{ width: '100%' }}>
                <NavMockup />
              </div>
            </Tile>
          </div>

          {/* Ícone app nas três densidades PWA */}
          <div style={{
            marginTop: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '32px 36px',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 28,
            }}>
              App Icon — PWA / homescreen
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36, flexWrap: 'wrap' }}>
              {[{ disp: 96,  spec: '192px' }, { disp: 56,  spec: '96px' }, { disp: 36,  spec: '48px' }, { disp: 24, spec: '32px' }].map(({ disp, spec }) => (
                <div key={spec} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: disp, height: disp,
                    borderRadius: Math.round(disp * 0.22),
                    background: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconMark size={disp * 0.62} color="white" />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 4. PALETA ──────────────────────────────────────── */}
        <Section
          title="04 — Paleta cromática"
          desc="Vermelho, quase-branco e quase-preto. Três cores são suficientes para uma marca forte."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {CORES.map(c => (
              <div key={c.hex} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: 72,
                  background: c.swatch,
                  border: c.dark ? '1px solid var(--border)' : 'none',
                }} />
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{c.name}</p>
                  <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#f87171', marginBottom: 6 }}>{c.hex}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5. TIPOGRAFIA ──────────────────────────────────── */}
        <Section
          title="05 — Tipografia"
          desc="Inter exclusivamente — moderna, técnica, legível em qualquer tamanho. Uma fonte, clareza total."
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {TYPE_SCALE.map((t, i) => (
              <div key={t.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '22px 28px',
                borderBottom: i < TYPE_SCALE.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ width: 148, flexShrink: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>
                    {t.label}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-disabled)' }}>
                    {t.size}px · {t.weight}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: t.weight,
                  fontSize: Math.min(t.size, 28),
                  letterSpacing: t.ls,
                  textTransform: t.upper ? 'uppercase' : 'none',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 6. REGRAS ──────────────────────────────────────── */}
        <Section title="06 — Regras de uso">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{
              background: 'rgba(74,222,128,0.04)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 12,
              padding: '24px 28px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 18 }}>
                ✓ Correto
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  'Ícone sempre em #ef4444 ou branco sobre fundo vermelho',
                  'MEGA em branco / cinza-claro, UP em #ef4444',
                  'Inter peso 900, letras maiúsculas, tracking −0.05em',
                  'Badge vermelho para app icon e avatar',
                  'Mínimo 16px para o badge, 14px para wordmark',
                  'Tagline "Jardim das Rosas" em uppercase 500 quando necessário',
                ].map(r => (
                  <li key={r} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 10, lineHeight: 1.4 }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, fontWeight: 700 }}>–</span>{r}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{
              background: 'rgba(248,113,113,0.04)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 12,
              padding: '24px 28px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f87171', marginBottom: 18 }}>
                ✗ Evite
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  'Roxo, azul ou verde no símbolo — apenas vermelho ou branco',
                  '"Mega Up" separado — sempre MEGAUP junto',
                  'Girar, distorcer ou alterar proporções do símbolo',
                  'Usar o símbolo abaixo de 14px — legibilidade comprometida',
                  'Combinar com outros pesos da Inter no wordmark',
                  'Fundo colorido que não seja vermelho ou neutro escuro/claro',
                ].map(r => (
                  <li key={r} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 10, lineHeight: 1.4 }}>
                    <span style={{ color: '#f87171', flexShrink: 0, fontWeight: 700 }}>–</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer style={{
          marginTop: 40,
          paddingTop: 28,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <LogoFull size={13} />
          <p style={{ fontSize: 12, color: 'var(--text-disabled)' }}>
            MegaUp Academia · Identidade Visual v1.0 · 2026
          </p>
        </footer>

      </div>
    </div>
  )
}
