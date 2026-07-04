import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { chatMensagens, chatEnviar } from '../api'
import { Send, MessageCircle, Loader2 } from 'lucide-react'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso) {
  const d = new Date(iso)
  const hoje = new Date()
  if (d.toDateString() === hoje.toDateString()) return 'Hoje'
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)
  if (d.toDateString() === ontem.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function ChatBox({ alunoId, outroNome }) {
  const [texto, setTexto] = useState('')
  const [lastId, setLastId] = useState(0)
  const [msgs, setMsgs] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { isLoading } = useQuery({
    queryKey: ['chat', alunoId, lastId],
    queryFn: () =>
      chatMensagens(alunoId, lastId).then(r => {
        const novas = r.data
        if (novas.length > 0) {
          setMsgs(prev => {
            const ids = new Set(prev.map(m => m.id))
            const unicas = novas.filter(m => !ids.has(m.id))
            return [...prev, ...unicas]
          })
          setLastId(novas[novas.length - 1].id)
        }
        return novas
      }),
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  })

  const { mutate: enviar, isPending: sending } = useMutation({
    mutationFn: () => chatEnviar(alunoId, texto.trim()),
    onSuccess: ({ data }) => {
      setMsgs(prev => {
        const ids = new Set(prev.map(m => m.id))
        return ids.has(data.id) ? prev : [...prev, { ...data, meu: true }]
      })
      setLastId(data.id)
      setTexto('')
      inputRef.current?.focus()
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (texto.trim() && !sending) enviar()
    }
  }

  // Group by date
  const groups = []
  let lastDate = null
  for (const m of msgs) {
    const d = formatDate(m.criado_em)
    if (d !== lastDate) { groups.push({ type: 'date', label: d, key: `d-${m.id}` }); lastDate = d }
    groups.push({ type: 'msg', ...m })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 4px', display: 'flex',
        flexDirection: 'column', gap: 8,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent',
      }}>
        {isLoading && msgs.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Loader2 style={{ width: 20, height: 20, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        {msgs.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <MessageCircle style={{ width: 22, height: 22, color: '#6366f1' }} />
            </div>
            <p style={{ color: '#4B5768', fontSize: 13, fontWeight: 600 }}>Nenhuma mensagem ainda</p>
            <p style={{ color: '#1F2D4A', fontSize: 12, marginTop: 4 }}>Envie a primeira mensagem para {outroNome}</p>
          </div>
        )}
        {groups.map((item, i) => {
          if (item.type === 'date') {
            return (
              <div key={item.key} style={{ textAlign: 'center', margin: '8px 0' }}>
                <span style={{ fontSize: 11, color: '#2A3A56', fontWeight: 600, background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 999 }}>{item.label}</span>
              </div>
            )
          }
          return (
            <div key={item.id} style={{ display: 'flex', justifyContent: item.meu ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '9px 13px',
                borderRadius: item.meu ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: item.meu ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.07)',
                border: item.meu ? 'none' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: item.meu ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
              }}>
                <p style={{ fontSize: 14, color: item.meu ? 'white' : '#CBD5E1', lineHeight: 1.45, margin: 0, wordBreak: 'break-word' }}>
                  {item.texto}
                </p>
                <p style={{ fontSize: 10, color: item.meu ? 'rgba(255,255,255,0.5)' : '#2A3A56', margin: '4px 0 0', textAlign: 'right' }}>
                  {formatTime(item.criado_em)}{item.meu && (item.lido ? ' ✓✓' : ' ✓')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 0 0', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Mensagem para ${outroNome || 'aluno'}...`}
          rows={1}
          style={{
            flex: 1, resize: 'none',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '10px 14px', color: '#EFF6FF', fontSize: 14,
            fontFamily: 'Inter, sans-serif', outline: 'none', lineHeight: 1.5,
            maxHeight: 100, overflowY: 'auto',
          }}
        />
        <button
          onClick={() => texto.trim() && !sending && enviar()}
          disabled={!texto.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: texto.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: texto.trim() ? '0 0 18px rgba(99,102,241,0.4)' : 'none',
            transition: 'all 0.2s', opacity: sending ? 0.6 : 1,
          }}
        >
          {sending
            ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            : <Send style={{ width: 16, height: 16, color: texto.trim() ? 'white' : '#3D4F6A' }} />
          }
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
