import { Link } from 'react-router-dom'
import { Zap, Users, Brain, MessageCircle, BarChart2, Trophy, Shield, ArrowRight, Check, Star, ChevronRight } from 'lucide-react'

const FEATURES = [
  { icon: Brain,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', title: 'IA de Progressão',     desc: 'Sugestões automáticas de carga baseadas no histórico real de cada aluno.' },
  { icon: Trophy,        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  title: 'Gamificação',           desc: 'Streak, conquistas e recordes para manter seus alunos motivados diariamente.' },
  { icon: BarChart2,     color: '#818cf8', bg: 'rgba(129,140,248,0.12)', title: 'Periodização',          desc: 'Programe ciclos de hipertrofia, força e deload com presets prontos em segundos.' },
  { icon: MessageCircle, color: '#f9a8d4', bg: 'rgba(249,168,212,0.12)', title: 'Chat Integrado',       desc: 'Comunique-se diretamente com cada aluno dentro do app, sem WhatsApp.' },
  { icon: Users,         color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  title: 'Multi-aluno',           desc: 'Gerencie dezenas de alunos com treinos, avaliações e histórico individuais.' },
  { icon: Shield,        color: '#34d399', bg: 'rgba(52,211,153,0.12)',  title: 'App Mobile (PWA)',      desc: 'Instala no celular como app nativo, funciona offline e vibra no descanso.' },
]

const STEPS = [
  { n: '01', title: 'Crie sua conta',       desc: 'Registre-se em 30 segundos. Sem cartão de crédito. 14 dias grátis com acesso completo.', color: '#818cf8' },
  { n: '02', title: 'Monte os treinos',     desc: 'Adicione alunos, crie planos de treino e prescreva exercícios da biblioteca com vídeos.', color: '#34d399' },
  { n: '03', title: 'Acompanhe resultados', desc: 'IA analisa o progresso, sugere aumentos de carga e gera relatórios automáticos.', color: '#fbbf24' },
]

const PLANOS_PREVIEW = [
  { tier: 'Free',    preco: 0,   alunos: 3,   color: '#71717A' },
  { tier: 'Starter', preco: 49,  alunos: 15,  color: '#38bdf8' },
  { tier: 'Pro',     preco: 129, alunos: 50,  color: '#a78bfa', destaque: true },
  { tier: 'Elite',   preco: 249, alunos: '∞', color: '#fbbf24' },
]

const DEPOIMENTOS = [
  { nome: 'Camila R.',    cargo: 'Personal Trainer — SP', texto: 'Meus alunos amaram o sistema de conquistas. Nunca tive taxas de adesão tão altas.',          estrelas: 5 },
  { nome: 'Rafael S.',    cargo: 'Coach — RJ',            texto: 'A IA de progressão de carga me economiza pelo menos 2h por semana de análise manual.',        estrelas: 5 },
  { nome: 'Juliana M.',   cargo: 'Personal Trainer — BH', texto: 'O chat integrado é o diferencial. Consigo acompanhar meus alunos sem sair do GymPro.',        estrelas: 5 },
]

const STATS = [
  { value: '10K+',  label: 'Treinos registrados' },
  { value: '500+',  label: 'Alunos ativos' },
  { value: '98%',   label: 'Satisfação' },
  { value: '14d',   label: 'Trial grátis' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0D', color: '#F4F4F5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-18px) } }
        @keyframes pulse-slow { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        @keyframes slide-up { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        .hero-card { animation: float 6s ease-in-out infinite; }
        .hero-card:nth-child(2) { animation-delay: -2s; }
        .hero-card:nth-child(3) { animation-delay: -4s; }
        .gradient-text { background: linear-gradient(135deg,#a5b4fc,#c084fc,#f9a8d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .link-hover { transition: color 0.15s; } .link-hover:hover { color:#818cf8; }
        .btn-cta { background:linear-gradient(135deg,#4f46e5,#7c3aed); border:none; border-radius:16px; color:white; cursor:pointer; font-weight:800; font-size:16px; padding:16px 36px; display:inline-flex; align-items:center; gap:10px; transition:all 0.2s; box-shadow:0 0 40px rgba(99,102,241,0.4); }
        .btn-cta:hover { transform:translateY(-2px); box-shadow:0 8px 40px rgba(99,102,241,0.6); }
        .btn-ghost { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:16px; color:#CBD5E1; cursor:pointer; font-weight:700; font-size:15px; padding:15px 28px; transition:all 0.15s; }
        .btn-ghost:hover { background:rgba(255,255,255,0.12); }
        .feature-card { background:#111113; border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px; transition:all 0.25s; }
        .feature-card:hover { transform:translateY(-4px); border-color:rgba(99,102,241,0.25); box-shadow:0 20px 48px rgba(0,0,0,0.4); }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,11,20,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: '#6366f1', boxShadow: '0 0 16px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>GymPro</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', letterSpacing: '0.05em' }}>PRO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#features" className="link-hover" style={{ color: '#71717A', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Recursos</a>
            <a href="#preco" className="link-hover" style={{ color: '#71717A', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Preços</a>
            <Link to="/login" style={{ color: '#A1A1AA', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
            <Link to="/registrar">
              <button className="btn-cta" style={{ fontSize: 13, padding: '9px 20px', borderRadius: 12 }}>
                Começar grátis <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 80px', textAlign: 'center' }}>
        {/* Aurora blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', animation: 'pulse-slow 4s infinite' }} />
          <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', animation: 'pulse-slow 5s infinite 1s' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,168,212,0.06) 0%,transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Zap style={{ width: 13, height: 13, color: '#818cf8' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '0.04em' }}>PLATAFORMA #1 PARA PERSONAL TRAINERS</span>
          </div>

          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(36px,6vw,72px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Gerencie seus alunos<br />
            com <span className="gradient-text">inteligência artificial</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: '#71717A', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
            Prescreva treinos, acompanhe progresso, receba sugestões de IA e mantenha seus alunos engajados — tudo em um único app.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registrar">
              <button className="btn-cta">
                Começar 14 dias grátis <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost">Já tenho conta</button>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: '#52525B', marginTop: 16 }}>Sem cartão de crédito · Cancele quando quiser</p>
        </div>

        {/* Floating mock cards */}
        <div style={{ position: 'relative', maxWidth: 900, margin: '64px auto 0', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Streak atual', value: '🔥 14 dias', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
            { label: 'IA sugere', value: '↑ 2.5kg no supino', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
            { label: 'Alunos ativos', value: '📊 23 / 50', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
          ].map(c => (
            <div key={c.label} className="hero-card" style={{ padding: '16px 22px', borderRadius: 18, background: c.bg, border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 200 }}>
              <p style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{c.label}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '20px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: '28px 24px', textAlign: 'center', background: '#111113' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#71717A', fontWeight: 600, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 14 }}>
              Tudo que você precisa,<br /><span className="gradient-text">num só lugar</span>
            </h2>
            <p style={{ fontSize: 16, color: '#71717A', maxWidth: 500, margin: '0 auto' }}>De treinos a pagamentos, do chat à IA — o GymPro é a plataforma completa para o personal moderno.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width: 48, height: 48, borderRadius: 15, background: f.bg, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 20px ${f.color}20` }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 600, color: '#F4F4F5', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '60px 24px 80px', background: 'rgba(14,21,37,0.5)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 12 }}>Como funciona</h2>
            <p style={{ fontSize: 15, color: '#71717A' }}>Comece em minutos, não em dias</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ textAlign: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 24, left: 'calc(50% + 48px)', width: 'calc(100% - 96px)', height: 1, background: `linear-gradient(90deg, ${s.color}60, transparent)`, display: 'none' }} className="step-line" />
                )}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${s.color}18`, border: `2px solid ${s.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 24px ${s.color}30` }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: s.color }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: '#F4F4F5', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section style={{ padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 48 }}>
            O que nossos personals dizem
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {DEPOIMENTOS.map(d => (
              <div key={d.nome} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Star key={i} style={{ width: 14, height: 14, color: '#fbbf24', fill: '#fbbf24' }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: '#A1A1AA', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>"{d.texto}"</p>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{d.nome}</p>
                  <p style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>{d.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ── */}
      <section id="preco" style={{ padding: '60px 24px 80px', background: 'rgba(14,21,37,0.5)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Preço justo para cada fase
            </h2>
            <p style={{ fontSize: 15, color: '#71717A' }}>Comece grátis e escale conforme sua base cresce</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {PLANOS_PREVIEW.map(p => (
              <div key={p.tier} style={{ background: p.destaque ? `${p.color}12` : '#111113', border: `1px solid ${p.destaque ? p.color + '50' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '22px 20px', textAlign: 'center', transform: p.destaque ? 'scale(1.04)' : 'scale(1)', boxShadow: p.destaque ? `0 0 40px ${p.color}25` : 'none' }}>
                {p.destaque && <div style={{ fontSize: 10, fontWeight: 600, color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⭐ Recomendado</div>}
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: p.color, marginBottom: 10 }}>{p.tier}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
                  {p.preco === 0 ? 'Grátis' : `R$${p.preco}`}
                </div>
                {p.preco > 0 && <div style={{ fontSize: 11, color: '#71717A', marginBottom: 16 }}>/mês</div>}
                <div style={{ fontSize: 13, color: '#71717A', marginTop: 14 }}>{p.alunos === '∞' ? 'Ilimitados' : `Até ${p.alunos}`} alunos</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/registrar">
              <button className="btn-cta">
                Começar com 14 dias grátis <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
            Pronto para transformar<br />sua carreira como personal?
          </h2>
          <p style={{ fontSize: 16, color: '#71717A', marginBottom: 36 }}>
            Junte-se a centenas de personal trainers que já usam o GymPro para crescer.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link to="/registrar">
              <button className="btn-cta" style={{ fontSize: 17, padding: '18px 42px' }}>
                Criar conta grátis <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['14 dias de trial', 'Sem cartão de crédito', 'Cancele quando quiser'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#71717A' }}>
                <Check style={{ width: 13, height: 13, color: '#34d399' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em' }}>GymPro</span>
        </div>
        <p style={{ fontSize: 12, color: '#52525B' }}>
          Desenvolvido por{' '}
          <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
            @luuiz.dev
          </a>
          {' '}· © {new Date().getFullYear()} GymPro
        </p>
      </footer>
    </div>
  )
}
