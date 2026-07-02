import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { gerarConvite } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Copy, Check, Mail, Loader2 } from 'lucide-react'

export default function Convites() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copied, setCopied] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => gerarConvite({ email_aluno: email }),
    onSuccess: ({ data }) => {
      setResultado(data)
      setEmail('')
      toast.success('Convite gerado! E-mail enviado se SMTP estiver configurado.')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro ao gerar convite'),
  })

  const copiarLink = async () => {
    await navigator.clipboard.writeText(resultado.link_convite)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Convidar alunos</h1>
        <p className="text-gray-500">
          Envie um link de convite por e-mail. O aluno cria a conta e já fica vinculado a você.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do aluno</label>
          <div className="flex gap-3">
            <input
              type="email"
              className="input flex-1"
              placeholder="aluno@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && email && mutate()}
            />
            <button
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
              disabled={isPending || !email}
              onClick={() => mutate()}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Convidar
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
          <Mail className="w-4 h-4 inline mr-1.5" />
          O convite expira em 7 dias. Configure SMTP no <code>.env</code> para envio automático.
        </div>
      </div>

      {resultado && (
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Convite gerado!</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Expira em: <strong>{new Date(resultado.expira_em).toLocaleDateString('pt-BR')}</strong>
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
            <span className="text-xs text-gray-500 truncate flex-1">{resultado.link_convite}</span>
            <button
              onClick={copiarLink}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">Como funciona</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          {[
            'Você digita o e-mail do aluno e clica em Convidar.',
            'O sistema gera um link único e envia o e-mail (se SMTP configurado).',
            'O aluno clica no link, cria uma senha e já aparece na sua lista.',
            'O aluno pode então acessar o app para ver seus treinos.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
