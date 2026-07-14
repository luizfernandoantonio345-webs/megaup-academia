import { useQuery } from '@tanstack/react-query'
import { meuPerfilAluno } from '../../api'
import ChatBox from '../../components/ChatBox'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ChatAluno() {
  const { user } = useAuth()

  const { data: perfil, isLoading, isError } = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: () => meuPerfilAluno().then(r => r.data),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Loader2 style={{ width: 24, height: 24, color: '#E8342B', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isError || !perfil) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 12, textAlign: 'center' }}>
        <MessageCircle style={{ width: 36, height: 36, color: 'var(--text-disabled)' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color:'var(--text-secondary)' }}>Chat indisponível</p>
        <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Não foi possível carregar seu perfil. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(249,168,212,0.12)',
          border: '1px solid rgba(249,168,212,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageCircle style={{ width: 20, height: 20, color: '#f9a8d4' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Chat com seu Personal
          </h1>
          <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 3 }}>
            Mensagens privadas com seu treinador
          </p>
        </div>
      </div>

      {/* Chat */}
      <div style={{
        background:'var(--bg-card)', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '16px',
        height: 'calc(100vh - 260px)',
        minHeight: 380,
        display: 'flex', flexDirection: 'column',
      }}>
        <ChatBox
          alunoId={perfil.id}
          outroNome="Personal"
        />
      </div>
    </div>
  )
}

