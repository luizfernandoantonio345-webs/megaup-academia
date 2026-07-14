import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { fazerCheckin } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function Checkin() {
  const [params] = useSearchParams()
  const token = params.get('t')
  const navigate = useNavigate()
  const { user, authReady } = useAuth()
  const [result, setResult] = useState(null) // { ok, msg, novo }

  const { mutate, isPending } = useMutation({
    mutationFn: () => fazerCheckin(token),
    onSuccess: (res) => setResult(res.data),
    onError: (err) => setResult({ ok: false, msg: err.response?.data?.detail || 'Erro ao fazer check-in' }),
  })

  useEffect(() => {
    if (!authReady) return
    if (!user) {
      // Not logged in — redirect to login with return URL
      navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true })
      return
    }
    if (token && !result) {
      mutate()
    }
  }, [authReady, user, token])

  if (!authReady || isPending) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#E8342B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap style={{ width: 24, height: 24, color: 'white' }} />
        </div>
        <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: '#E8342B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Verificando check-in...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <AlertCircle style={{ width: 48, height: 48, color: '#E8342B' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>QR inválido</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Escaneie o QR code da academia novamente.</p>
        <button onClick={() => navigate('/aluno')} className="btn-primary" style={{ fontSize: 14 }}>Ir para o início</button>
      </div>
    )
  }

  if (result) {
    const isOk = result.ok !== false
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#E8342B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <Zap style={{ width: 26, height: 26, color: 'white' }} />
        </div>

        {isOk ? (
          <>
            <div style={{ animation: result.novo ? 'bounceIn 0.5s ease-out' : 'none' }}>
              <CheckCircle style={{ width: 64, height: 64, color: '#10b981', margin: '0 auto' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                {result.novo ? 'Check-in feito!' : 'Já fez check-in!'}
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{result.msg}</p>
            </div>
            {result.novo && (
              <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  Presença registrada em {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <AlertCircle style={{ width: 56, height: 56, color: '#E8342B', margin: '0 auto' }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', margin: '0 0 8px' }}>Ops!</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{result.msg}</p>
            </div>
          </>
        )}

        <button
          onClick={() => navigate('/aluno')}
          className="btn-primary"
          style={{ fontSize: 14, padding: '12px 28px', marginTop: 8 }}>
          Ir para treino →
        </button>

        <style>{`@keyframes bounceIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
      </div>
    )
  }

  return null
}
