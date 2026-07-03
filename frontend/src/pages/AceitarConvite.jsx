import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { infoConvite, aceitarConvite } from '../api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Dumbbell, Loader2, Lock, User, Zap } from 'lucide-react'

export default function AceitarConvite() {
  const [params] = useSearchParams()
  const token = params.get('convite')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', senha: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    infoConvite(token)
      .then(({ data }) => setInfo(data))
      .catch(() => toast.error('Convite inválido ou expirado'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await aceitarConvite({ token, nome: form.nome, senha: form.senha })
      // Update AuthContext state so ProtectedRoute allows access
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      // Re-login to sync React state
      await login(info.email_aluno, form.senha)
      toast.success('Conta criada! Bora treinar 💪')
      navigate('/aluno')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao aceitar convite')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Loader2 style={{ width:32, height:32, color:'#6366f1', animation:'spin 1s linear infinite' }} />
      </div>
    )

  if (!info)
    return (
      <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
        <div>
          <div style={{ fontSize:48, marginBottom:16 }}>⏰</div>
          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:22, fontWeight:800, color:'#EFF6FF', marginBottom:8 }}>
            Convite não encontrado
          </h1>
          <p style={{ color:'#4B5768', marginBottom:24, fontSize:14 }}>Este convite é inválido ou já expirou.</p>
          <a href="/login" style={{ color:'#818cf8', fontWeight:600, fontSize:14 }}>Ir para login</a>
        </div>
      </div>
    )

  return (
    <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <div style={{ width:40, height:40, borderRadius:14, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.45)' }}>
            <Zap style={{ width:18, height:18, color:'white' }} />
          </div>
          <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:17, color:'#EFF6FF' }}>GymPro</span>
        </div>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 0 24px rgba(99,102,241,0.4)' }}>
            <Dumbbell style={{ width:28, height:28, color:'white' }} />
          </div>
          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:24, fontWeight:900, color:'#EFF6FF', letterSpacing:'-0.02em', marginBottom:8 }}>
            Você foi convidado!
          </h1>
          <p style={{ fontSize:14, color:'#4B5768' }}>
            <span style={{ color:'#a5b4fc', fontWeight:600 }}>{info.nome_personal}</span>
            {info.nome_academia ? ` · ${info.nome_academia}` : ''}
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ padding:'8px 12px 16px', borderRadius:10, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)', marginBottom:20 }}>
            <p style={{ fontSize:11, color:'#3D4F6A', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Seu e-mail de acesso</p>
            <p style={{ fontSize:14, color:'#a5b4fc', fontWeight:600 }}>{info.email_aluno}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Seu nome *</label>
              <div style={{ position:'relative' }}>
                <User style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
                <input type="text" className="input pl-10" placeholder="Como quer ser chamado" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Crie uma senha *</label>
              <div style={{ position:'relative' }}>
                <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
                <input type="password" className="input pl-10" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required minLength={6} />
              </div>
            </div>
            <button type="submit" className="btn-gradient w-full py-3" disabled={submitting}>
              {submitting ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />
                  Criando conta...
                </span>
              ) : 'Criar conta e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
