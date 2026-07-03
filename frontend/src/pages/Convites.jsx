import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { gerarConvite } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Copy, Check, Mail, Link2, ChevronRight } from 'lucide-react'

const STEPS = [
  { n: 1, text: 'Você digita o e-mail do aluno e clica em Convidar.'                          },
  { n: 2, text: 'O sistema gera um link único e envia por e-mail automaticamente.'             },
  { n: 3, text: 'O aluno clica no link, cria uma senha e já aparece na sua lista.'             },
  { n: 4, text: 'O aluno acessa o app e visualiza os treinos que você prescreveu.'             },
]

export default function Convites() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copied, setCopied] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => gerarConvite({ email_aluno: email }),
    onSuccess: ({ data }) => {
      setResultado(data)
      setEmail('')
      toast.success('Convite gerado com sucesso! 🎉')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro ao gerar convite'),
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
      <div>
        <h1 className="page-title">Convidar alunos</h1>
        <p className="page-subtitle">
          Envie um link de convite. O aluno cria a conta e fica vinculado a você automaticamente.
        </p>
      </div>

      {/* Main form */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Novo convite</h2>
            <p className="text-xs text-gray-500">Link expira em 7 dias</p>
          </div>
        </div>

        <div>
          <label className="label">E-mail do aluno *</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className="input pl-10"
                placeholder="aluno@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && mutate()}
              />
            </div>
            <button
              className="btn-gradient whitespace-nowrap"
              disabled={isPending || !email}
              onClick={() => mutate()}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : <UserPlus className="w-4 h-4" />}
              Convidar
            </button>
          </div>
        </div>

        <div className="alert-info flex items-start gap-2">
          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Configure SMTP no servidor para envio automático por e-mail. Sem SMTP, compartilhe o link manualmente.</span>
        </div>
      </div>

      {/* Result */}
      {resultado && (
        <div className="card border-2 border-emerald-200 bg-emerald-50 animate-scale-in space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">Convite gerado com sucesso!</p>
              <p className="text-xs text-emerald-600">
                Expira em {new Date(resultado.expira_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2 block">
              Link do convite
            </label>
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-emerald-200">
              <Link2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate flex-1 font-mono">{resultado.link_convite}</span>
              <button
                onClick={copiarLink}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Como funciona</h2>
        <ol className="space-y-3">
          {STEPS.map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {n}
              </span>
              <span className="text-sm text-gray-600">{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
