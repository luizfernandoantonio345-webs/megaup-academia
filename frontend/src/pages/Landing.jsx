import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Users, Calendar, MessageCircle, BarChart2, Trophy, Shield, ArrowRight, Check, Dumbbell, DollarSign } from 'lucide-react'
import api from '../api/client'

const FEATURES = [
  { icon: BarChart2,     color: '#818cf8', bg: 'rgba(129,140,248,0.10)', title: 'Analytics Completo',   desc: 'Retenção, frequência, receita e evolução de carga — tudo em um único painel.' },
  { icon: Trophy,        color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  title: 'Gamificação',           desc: 'Streak, conquistas e recordes mantêm seus alunos motivados e engajados.' },
  { icon: Calendar,      color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', title: 'Periodização',          desc: 'Programe ciclos de hipertrofia, força e deload com presets prontos.' },
  { icon: MessageCircle, color: '#f9a8d4', bg: 'rgba(249,168,212,0.10)', title: 'Chat Integrado',        desc: 'Comunique-se com cada aluno dentro do app, sem precisar do WhatsApp.' },
  { icon: DollarSign,    color: '#34d399', bg: 'rgba(52,211,153,0.10)',  title: 'Gestão Financeira',     desc: 'Planos de pagamento, cobranças e receita mensal organizados automaticamente.' },
  { icon: Shield,        color: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  title: 'App Mobile (PWA)',       desc: 'Instala no celular como app nativo, funciona offline e vibra no descanso.' },
]

const STEPS = [
  { n: '01', title: 'Crie sua conta',       desc: 'Registre-se em 30 segundos. Sem cartão de crédito. 14 dias grátis com acesso completo.', color: '#818cf8' },
  { n: '02', title: 'Monte os treinos',     desc: 'Adicione alunos, crie planos de treino e prescreva exercícios com vídeos da biblioteca.', color: '#34d399' },
  { n: '03', title: 'Acompanhe resultados', desc: 'Visualize progresso com relatórios individuais, gráficos de frequência e evolução de carga.', color: '#fbbf24' },
]

const PLANOS_PREVIEW = [
  {
    tier: 'Free', preco: 0, alunos: 3, color: '#71717A',
    items: ['3 alunos', 'Treinos ilimitados', 'App mobile'],
  },
  {
    tier: 'Starter', preco: 49, alunos: 15, color: '#38bdf8',
    items: ['15 alunos', 'Analytics básico', 'Chat integrado'],
  },
  {
    tier: 'Pro', preco: 129, alunos: 50, color: '#a78bfa', destaque: true,
    items: ['50 alunos', 'Analytics completo', 'Gamificação', 'Periodização', 'Financeiro'],
  },
  {
    tier: 'Elite', preco: 249, alunos: '∞', color: '#fbbf24',
    items: ['Ilimitados', 'Tudo do Pro', 'Suporte prioritário'],
  },
]

export default function Landing() {
  useEffect(() => {
    api.get('/ping').catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0D', color: '#F4F4F5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        .animate-hero { animation: slide-up 0.55s ease both; }
        .animate-hero-2 { animation: slide-up 0.55s 0.1s ease both; }
        .animate-hero-3 { animation: slide-up 0.55s 0.2s ease both; }
        .gradient-text { background: linear-gradient(135deg,#a5b4fc 0%,#c084fc 60%,#f9a8d4 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .btn-cta { background:#6366f1; border:none; border-radius:12px; color:white; cursor:pointer; font-weight:600; font-size:15px; padding:12px 28px; display:inline-flex; align-items:center; gap:8px; transition:background 0.15s, transform 0.15s; font-family:Inter,sans-serif; }
        .btn-cta:hover { background:#5154d3; transform:translateY(-1px); }
        .btn-ghost { background:transparent; border:1px solid #27272A; border-radius:12px; color:#A1A1AA; cursor:pointer; font-weight:600; font-size:15px; padding:12px 24px; transition:border-color 0.15s, color 0.15s; font-family:Inter,sans-serif; }
        .btn-ghost:hover { border-color:#3F3F46; color:#F4F4F5; }
        .feature-card { background:#111113; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:22px; transition:border-color 0.2s, transform 0.2s; }
        .feature-card:hover { border-color:rgba(99,102,241,0.2); transform:translateY(-3px); }
        .plan-card { background:#111113; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:0; }
        .nav-link { color:#71717A; font-size:14px; font-weight:500; text-decoration:none; transition:color 0.15s; }
        .nav-link:hover { color:#A1A1AA; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,13,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em' }}>GymPro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#recursos" className="nav-link">Recursos</a>
            <a href="#preco" className="nav-link">Preços</a>
            <Link to="/login" className="nav-link">Entrar</Link>
            <Link to="/registrar">
              <button className="btn-cta" style={{ fontSize: 13, padding: '8px 18px', borderRadius: 10 }}>
                Começar grátis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '96px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div className="animate-hero" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 28, padding: '5px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Dumbbell style={{ width: 12, height: 12, color: '#818cf8' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', letterSpacing: '0.03em' }}>PLATAFORMA PARA PERSONAL TRAINERS</span>
          </div>

          <h1 className="animate-hero-2" style={{ fontSize: 'clamp(38px,6vw,68px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 22 }}>
            Gerencie seus alunos<br />com <span className="gradient-text">profissionalismo</span>
          </h1>

          <p className="animate-hero-3" style={{ fontSize: 'clamp(16px,2vw,19px)', color: '#71717A', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 40px' }}>
            Prescreva treinos, acompanhe evolução de carga, gerencie pagamentos e comunique-se com seus alunos — tudo em um único app.
          </p>

          <div className="animate-hero-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registrar">
              <button className="btn-cta">
                Começar 14 dias grátis <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost">Já tenho conta</button>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: '#3F3F46', marginTop: 18 }}>Sem cartão de crédito · Cancele quando quiser</p>
        </div>

        {/* Product preview */}
        <div style={{ maxWidth: 820, margin: '64px auto 0', background: '#0E0E10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          {/* Window chrome */}
          <div style={{ padding: '12px 16px', background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {['#ef4444', '#fbbf24', '#34d399'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6 }} />
            ))}
            <div style={{ flex: 1, margin: '0 12px', height: 20, background: '#1C1C1E', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: '#52525B' }}>gymp.ro/dashboard</span>
            </div>
          </div>
          {/* Dashboard mockup */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Alunos ativos', value: '23', color: '#818cf8' },
              { label: 'Treinos esta semana', value: '47', color: '#34d399' },
              { label: 'Receita do mês', value: 'R$2.8k', color: '#fbbf24' },
              { label: 'Taxa de retenção', value: '94%', color: '#f9a8d4' },
            ].map(m => (
              <div key={m.label} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, height: 80, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              {[40, 65, 55, 80, 72, 90, 85].map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: i === 6 ? '#6366f1' : '#1C1C1E', height: `${h}%`, transition: 'height 0.3s' }} />
              ))}
            </div>
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { nome: 'João S.', streak: '🔥 12d', color: '#f97316' },
                { nome: 'Ana C.', streak: '🔥 8d', color: '#f97316' },
                { nome: 'Pedro M.', streak: '✅ 5d', color: '#34d399' },
              ].map(a => (
                <div key={a.nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#71717A' }}>{a.nome}</span>
                  <span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.streak}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Tudo que você precisa,<br />num só lugar
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', maxWidth: 480, margin: '0 auto' }}>
              Do primeiro treino ao relatório mensal — o GymPro cobre cada etapa da sua operação.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width: 42, height: 42, borderRadius: 12, background: f.bg, border: `1px solid ${f.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon style={{ width: 19, height: 19, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5', marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 10 }}>Como funciona</h2>
            <p style={{ fontSize: 15, color: '#71717A' }}>Comece a usar em minutos, não em dias</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 40 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${s.color}14`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: s.color }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F4F4F5', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="preco" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Preço justo para cada fase
            </h2>
            <p style={{ fontSize: 15, color: '#71717A' }}>Comece grátis e escale conforme sua carteira de alunos cresce</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, alignItems: 'start' }}>
            {PLANOS_PREVIEW.map(p => (
              <div key={p.tier} className="plan-card" style={{
                border: p.destaque ? `1px solid ${p.color}45` : '1px solid rgba(255,255,255,0.06)',
                background: p.destaque ? `linear-gradient(135deg, #111113 0%, ${p.color}08 100%)` : '#111113',
                transform: p.destaque ? 'scale(1.03)' : undefined,
              }}>
                {p.destaque && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: p.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                    Recomendado
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 600, color: p.color, marginBottom: 14 }}>{p.tier}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: p.preco === 0 ? 26 : 34, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                    {p.preco === 0 ? 'Grátis' : `R$${p.preco}`}
                  </span>
                  {p.preco > 0 && <span style={{ fontSize: 13, color: '#71717A', marginLeft: 4 }}>/mês</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
                  {p.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A1A1AA' }}>
                      <Check style={{ width: 13, height: 13, color: '#34d399', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/registrar" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                  <button style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    background: p.destaque ? '#6366f1' : 'transparent',
                    border: p.destaque ? 'none' : '1px solid #27272A',
                    color: p.destaque ? 'white' : '#A1A1AA',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}>
                    {p.preco === 0 ? 'Começar grátis' : 'Assinar agora'}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 18 }}>
            Pronto para crescer<br />sua carteira de alunos?
          </h2>
          <p style={{ fontSize: 16, color: '#71717A', marginBottom: 36, lineHeight: 1.6 }}>
            14 dias grátis, sem cartão de crédito. Configure em menos de 5 minutos e comece a usar hoje.
          </p>
          <Link to="/registrar">
            <button className="btn-cta" style={{ fontSize: 16, padding: '14px 36px' }}>
              Criar conta grátis <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </Link>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            {['14 dias de trial', 'Sem cartão de crédito', 'Cancele quando quiser'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#52525B' }}>
                <Check style={{ width: 12, height: 12, color: '#34d399' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 12, height: 12, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.02em' }}>GymPro</span>
          </div>
          <p style={{ fontSize: 12, color: '#3F3F46', margin: 0 }}>
            © {new Date().getFullYear()} GymPro · Desenvolvido por{' '}
            <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#52525B', textDecoration: 'none' }}>@luuiz.dev</a>
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#recursos" className="nav-link" style={{ fontSize: 13 }}>Recursos</a>
            <a href="#preco" className="nav-link" style={{ fontSize: 13 }}>Preços</a>
            <Link to="/login" className="nav-link" style={{ fontSize: 13, textDecoration: 'none', color: '#71717A' }}>Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
