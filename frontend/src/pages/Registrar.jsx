import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Check, Dumbbell, Brain, TrendingUp, Shield } from 'lucide-react'

const BENEFITS = [
  { icon: Dumbbell,   text: 'Gestão completa de alunos e treinos',   color: '#6366f1' },
  { icon: Brain,      text: 'IA para progressão de carga automática', color: '#a78bfa' },
  { icon: TrendingUp, text: 'Gamificação para engajar seus alunos',   color: '#34d399' },
  { icon: Shield,     text: 'Cobranças e controle financeiro',        color: '#f97316' },
]

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_academia: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registrar(form)
      toast.success('Conta criada! Bem-vindo ao FitSaaS. 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background:'#070B14' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden" style={{ background:'linear-gradient(160deg, #0D1525 0%, #070B14 100%)', borderRight:'1px solid rgba(255,255,255,0.05)' }}>
        {/* Background orbs */}
        <div className="absolute pointer-events-none" style={{ top:-60, left:-60, width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none" style={{ bottom:80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none" style={{ top:'40%', right:40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 24px rgba(99,102,241,0.5)' }}>
              <Zap style={{ width:20, height:20, color:'white' }} />
            </div>
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:18, color:'#EFF6FF', letterSpacing:'-0.02em' }}>FitSaaS</span>
          </div>

          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:36, fontWeight:900, lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:16, color:'#EFF6FF' }}>
            Comece grátis<br />
            <span style={{ background:'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>hoje mesmo</span>
          </h1>
          <p style={{ fontSize:14, color:'#4B5768', lineHeight:1.7 }}>
            Plataforma completa para personal trainers gerirem alunos, prescreverem treinos e acompanharem resultados com inteligência artificial.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative z-10 space-y-3">
          {BENEFITS.map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3" style={{ padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}18` }}>
                <Icon style={{ width:15, height:15, color }} />
              </div>
              <span style={{ fontSize:13, color:'#64748B' }}>{text}</span>
              <Check style={{ width:14, height:14, color:'#34d399', marginLeft:'auto', flexShrink:0 }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:20 }}>
            <p style={{ fontSize:12, color:'#1F2D4A' }}>Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background:'#070B14' }}>
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 16px rgba(99,102,241,0.4)' }}>
              <Zap style={{ width:16, height:16, color:'white' }} />
            </div>
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, color:'#EFF6FF' }}>FitSaaS</span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:26, fontWeight:800, color:'#EFF6FF', letterSpacing:'-0.02em', marginBottom:8 }}>Criar conta de personal</h2>
            <p style={{ fontSize:14, color:'#4B5768' }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color:'#818cf8', fontWeight:600 }}>Entrar</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label:'Seu nome completo *', key:'nome',           Icon:User,      type:'text',     placeholder:'João Silva',          autocomplete:'name' },
              { label:'E-mail *',            key:'email',          Icon:Mail,      type:'email',    placeholder:'joao@email.com',      autocomplete:'email' },
              { label:'Nome da academia',    key:'nome_academia',  Icon:Building2, type:'text',     placeholder:'Ex: Academia Silva',  autocomplete:'organization' },
            ].map(({ label, key, Icon, type, placeholder, autocomplete }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
                  <input className="input pl-10" type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} required={key !== 'nome_academia'} autoComplete={autocomplete} />
                </div>
              </div>
            ))}

            <div>
              <label className="label">Senha *</label>
              <div className="relative">
                <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
                <input className="input pl-10 pr-12" type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.senha} onChange={set('senha')} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#3D4F6A', padding:2 }}>
                  {showPass ? <EyeOff style={{ width:15, height:15 }} /> : <Eye style={{ width:15, height:15 }} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gradient w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Criar conta grátis
                  <ArrowRight style={{ width:16, height:16 }} />
                </span>
              )}
            </button>
          </form>

          <p style={{ fontSize:12, color:'#1F2D4A', textAlign:'center', marginTop:24, lineHeight:1.6 }}>
            Ao criar sua conta, você concorda com os{' '}
            <span style={{ color:'#3D4F6A', cursor:'pointer', textDecoration:'underline' }}>Termos de Uso</span>
            {' '}e{' '}
            <span style={{ color:'#3D4F6A', cursor:'pointer', textDecoration:'underline' }}>Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
