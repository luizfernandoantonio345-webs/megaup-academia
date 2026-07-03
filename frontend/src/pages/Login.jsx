import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Dumbbell, TrendingUp, Users } from 'lucide-react'

const FEATURES = [
  { icon: Dumbbell,   title: 'Treinos personalizados',    desc: 'Monte e prescreva treinos para cada aluno com facilidade.' },
  { icon: TrendingUp, title: 'IA de progressão de carga', desc: 'Inteligência artificial analisa o histórico e sugere evolução.' },
  { icon: Users,      title: 'Gestão completa de alunos', desc: 'Acompanhe streak, conquistas e pagamentos em tempo real.' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.senha)
      if (user?.role === 'aluno') {
        navigate('/aluno')
      } else {
        navigate('/dashboard')
      }
    } catch {
      toast.error('E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070B14' }}>
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] flex-shrink-0 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'10%', left:'-10%', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'15%', right:'-5%', width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', top:'55%', left:'30%', width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent, rgba(99,102,241,0.3), transparent)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow:'0 0 24px rgba(99,102,241,0.6)' }}>
              <Zap style={{ width:20, height:20, color:'white' }} />
            </div>
            <div>
              <div className="font-bold text-white text-lg" style={{ fontFamily:'Space Grotesk, sans-serif', letterSpacing:'-0.03em' }}>GymPro</div>
              <div className="text-xs font-bold" style={{ color:'#6366f1' }}>ACADEMIA PRO</div>
            </div>
          </div>
          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:36, fontWeight:800, color:'#EFF6FF', lineHeight:1.15, letterSpacing:'-0.03em', marginBottom:12 }}>
            Sua academia<br />
            <span style={{ background:'linear-gradient(135deg, #a5b4fc, #8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              no próximo nível
            </span>
          </h1>
          <p style={{ color:'#4B5768', fontSize:14, lineHeight:1.7 }}>
            Plataforma completa para personal trainers gerenciarem alunos, prescreverem treinos e acompanharem evolução com inteligência artificial.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.2)' }}>
                <Icon style={{ width:16, height:16, color:'#a5b4fc' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color:'#CBD5E1', fontFamily:'Space Grotesk, sans-serif' }}>{title}</div>
                <div className="text-xs mt-0.5" style={{ color:'#3D4F6A' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow:'0 0 16px rgba(99,102,241,0.5)' }}>
              <Zap style={{ width:16, height:16, color:'white' }} />
            </div>
            <span className="font-bold text-white" style={{ fontFamily:'Space Grotesk, sans-serif' }}>GymPro</span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:28, fontWeight:800, color:'#EFF6FF', letterSpacing:'-0.03em', marginBottom:6 }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize:14, color:'#4B5768' }}>
              Não tem conta?{' '}
              <Link to="/registrar" style={{ color:'#818cf8', fontWeight:600 }}>Criar conta grátis</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#3D4F6A' }} />
                <input className="input pl-11" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#3D4F6A' }} />
                <input className="input pl-11 pr-11" type={showPass ? 'text' : 'password'} placeholder="Sua senha" value={form.senha} onChange={set('senha')} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#3D4F6A', background:'none', border:'none', cursor:'pointer' }}>
                  {showPass ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gradient w-full py-3.5 text-base mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Entrar na plataforma
                  <ArrowRight style={{ width:16, height:16 }} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl" style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontSize:11, color:'#4B5768', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>
              Acesso de demonstração
            </p>
            <p style={{ fontSize:12, color:'#3D4F6A' }}>Personal: <span style={{ color:'#818cf8', fontWeight:600 }}>trainer@demo.com</span></p>
            <p style={{ fontSize:12, color:'#3D4F6A', marginTop:2 }}>Aluno: <span style={{ color:'#818cf8', fontWeight:600 }}>aluno@demo.com</span></p>
            <p style={{ fontSize:12, color:'#3D4F6A', marginTop:2 }}>Senha: <span style={{ color:'#818cf8', fontWeight:600 }}>demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
