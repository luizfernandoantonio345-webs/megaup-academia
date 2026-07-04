import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Zap, Users, Dumbbell, Star, ArrowRight, MapPin, CheckCircle } from 'lucide-react'
import api from '../api/client'

export default function PerfilPublico() {
  const { code } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['perfil-publico', code],
    queryFn: async () => (await api.get(`/public/p/${code}`)).data,
    staleTime: 300_000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 900, color: '#EFF6FF', marginBottom: 8 }}>Perfil não encontrado</h1>
          <p style={{ color: '#4B5768', fontSize: 14 }}>Este link de perfil não existe ou foi removido.</p>
        </div>
      </div>
    )
  }

  const initials = data.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const especialidades = data.especialidades ? data.especialidades.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#EFF6FF', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-slow { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}>
          <Zap style={{ width: 14, height: 14, color: 'white' }} />
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>GymPro</span>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)', animation: 'pulse-slow 4s infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px', background: data.foto_url ? `url(${data.foto_url}) center/cover` : 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: 'white', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 0 4px rgba(99,102,241,0.15)', animation: 'float 6s ease-in-out infinite' }}>
            {!data.foto_url && initials}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <CheckCircle style={{ width: 12, height: 12, color: '#34d399' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>PERSONAL TRAINER VERIFICADO</span>
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>{data.nome}</h1>

          {data.cref && (
            <p style={{ fontSize: 13, color: '#4B5768', marginBottom: 8 }}>CREF: {data.cref}</p>
          )}

          <p style={{ fontSize: 14, color: '#4B5768', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <MapPin style={{ width: 13, height: 13 }} /> {data.academia}
          </p>

          {data.bio && (
            <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 500, margin: '20px auto 0', lineHeight: 1.7 }}>{data.bio}</p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '20px 22px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Users style={{ width: 18, height: 18, color: '#818cf8' }} />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.02em', lineHeight: 1 }}>{data.stats.total_alunos}</p>
            <p style={{ fontSize: 12, color: '#4B5768', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 6 }}>Alunos ativos</p>
          </div>
          <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '20px 22px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Dumbbell style={{ width: 18, height: 18, color: '#34d399' }} />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.02em', lineHeight: 1 }}>{data.stats.total_treinos}</p>
            <p style={{ fontSize: 12, color: '#4B5768', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 6 }}>Treinos entregues</p>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      {especialidades.length > 0 && (
        <section style={{ padding: '0 24px 40px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 800, color: '#EFF6FF', marginBottom: 16, textAlign: 'center' }}>Especialidades</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {especialidades.map(e => (
                <div key={e} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 700, color: '#a5b4fc' }}>{e}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(124,58,237,0.08))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: '36px 28px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 900, color: '#EFF6FF', marginBottom: 10 }}>
            Quero treinar com {data.nome.split(' ')[0]}!
          </h2>
          <p style={{ fontSize: 14, color: '#4B5768', marginBottom: 28, lineHeight: 1.6 }}>
            Crie sua conta gratuitamente e comece a acompanhar seus treinos, metas e progresso.
          </p>
          <Link to={data.registro_link}>
            <button style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 16, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 16, padding: '16px 36px', boxShadow: '0 0 30px rgba(99,102,241,0.5)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Criar minha conta grátis <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </Link>
          <p style={{ fontSize: 12, color: '#1F2D4A', marginTop: 14 }}>Sem cartão de crédito</p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#1F2D4A' }}>Powered by <strong style={{ color: '#6366f1' }}>GymPro</strong> — plataforma para personal trainers</p>
      </footer>
    </div>
  )
}
