import { useQuery } from '@tanstack/react-query'
import { meuPerfilAluno } from '../../api'
import ChatBox from '../../components/ChatBox'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ChatAluno() {
  const { user } = useAuth()

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: () => meuPerfilAluno().then(r => r.data),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#71717A' }}>
        Perfil não encontrado.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(249,168,212,0.2), rgba(249,168,212,0.1))',
          border: '1px solid rgba(249,168,212,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(249,168,212,0.2)',
        }}>
          <MessageCircle style={{ width: 20, height: 20, color: '#f9a8d4' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: '#F4F4F5', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Chat com seu Personal
          </h1>
          <p style={{ fontSize: 12, color: '#71717A', marginTop: 3 }}>
            Mensagens privadas com seu treinador
          </p>
        </div>
      </div>

      {/* Chat */}
      <div style={{
        background: '#111113', borderRadius: 20,
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
