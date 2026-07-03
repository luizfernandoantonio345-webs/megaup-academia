import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { gerarConvite } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Copy, Check, Mail, Link2, Zap, Users, Shield, ArrowRight } from 'lucide-react'

const STEPS = [
  { n:1, emoji:'✉️', text:'Você digita o e-mail do aluno e clica em Convidar.' },
  { n:2, emoji:'🔗', text:'O sistema gera um link único e envia por e-mail automaticamente.' },
  { n:3, emoji:'🎯', text:'O aluno clica no link, cria uma senha e já aparece na sua lista.' },
  { n:4, emoji:'💪', text:'O aluno acessa o app e visualiza os treinos prescritos.' },
]

export default function Convites() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copied, setCopied] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => gerarConvite({ email_aluno: email }),
    onSuccess: ({ data }) => { setResultado(data); setEmail(''); toast.success('Convite gerado com sucesso! 🎉') },
    onError: err => toast.error(err.response?.data?.detail || 'Erro ao gerar convite'),
  })

  const copiarLink = async () => {
    await navigator.clipboard.writeText(resultado.link_convite)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Convidar alunos</h1>
          <p className="page-subtitle">Gere um link personalizado e vincule alunos automaticamente.</p>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#818cf8)', boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>
          <UserPlus style={{ width:20, height:20, color:'white' }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:Users,  value:'ilimitado', label:'Alunos',   color:'#a5b4fc', bg:'rgba(99,102,241,0.1)' },
          { icon:Zap,    value:'7 dias',    label:'Validade', color:'#fbbf24', bg:'rgba(245,158,11,0.1)' },
          { icon:Shield, value:'100%',      label:'Seguro',   color:'#34d399', bg:'rgba(16,185,129,0.1)' },
        ].map(({ icon:Icon, value, label, color, bg }) => (
          <div key={label} className="card text-center p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background:bg }}>
              <Icon style={{ width:16, height:16, color }} />
            </div>
            <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:14, color }}>{value}</div>
            <div style={{ fontSize:11, color:'#3D4F6A', fontWeight:600, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Main form */}
      <div className="card space-y-5">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <UserPlus style={{ width:18, height:18, color:'#818cf8' }} />
          </div>
          <div>
            <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#EFF6FF', fontSize:15 }}>Novo convite</h2>
            <p style={{ fontSize:12, color:'#3D4F6A' }}>Link expira em 7 dias</p>
          </div>
        </div>

        <div>
          <label className="label">E-mail do aluno *</label>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ position:'relative', flex:1 }}>
              <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
              <input type="email" className="input pl-10" placeholder="aluno@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email && !isPending && mutate()} />
            </div>
            <button className="btn-gradient whitespace-nowrap" disabled={isPending || !email} onClick={() => mutate()}>
              {isPending
                ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />
                : <><ArrowRight style={{ width:15, height:15 }} /> Convidar</>}
            </button>
          </div>
        </div>

        <div className="alert-info flex items-start gap-2">
          <Mail style={{ width:14, height:14, flexShrink:0, marginTop:2, color:'#a5b4fc' }} />
          <span style={{ fontSize:12 }}>Configure SMTP no servidor para envio automático. Sem SMTP, compartilhe o link abaixo manualmente.</span>
        </div>
      </div>

      {/* Result */}
      {resultado && (
        <div className="card animate-scale-in space-y-4" style={{ border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Check style={{ width:17, height:17, color:'#34d399' }} />
            </div>
            <div>
              <p style={{ fontWeight:700, color:'#34d399', fontSize:14 }}>Convite gerado com sucesso!</p>
              <p style={{ fontSize:12, color:'#4B5768' }}>
                Expira em {new Date(resultado.expira_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
              </p>
            </div>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#22c55e', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Link do convite</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:14, padding:'10px 14px' }}>
              <Link2 style={{ width:15, height:15, color:'#34d399', flexShrink:0 }} />
              <span style={{ fontSize:11, color:'#64748B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, fontFamily:'monospace' }}>{resultado.link_convite}</span>
              <button onClick={copiarLink} style={{
                display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:10, border:'none', cursor:'pointer', flexShrink:0, transition:'all 0.15s',
                background: copied ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)',
                color: copied ? '#34d399' : '#22c55e',
              }}>
                {copied ? <Check style={{ width:13, height:13 }} /> : <Copy style={{ width:13, height:13 }} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#94A3B8', fontSize:13, marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Como funciona</h2>
        <div className="space-y-3">
          {STEPS.map(({ n, emoji, text }) => (
            <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, width:32, height:32, borderRadius:10, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', fontSize:15 }}>
                {emoji}
              </div>
              <div style={{ paddingTop:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#4B5768', textTransform:'uppercase', letterSpacing:'0.06em' }}>Passo {n}</span>
                <p style={{ fontSize:13, color:'#64748B', marginTop:2 }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
