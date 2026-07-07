import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { chatMensagens, chatEnviar } from '../api'
import { Send, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Backend retorna UTC sem sufixo 'Z' — append para o browser interpretar corretamente
const toDate = (iso) => new Date(iso && iso.endsWith('Z') ? iso : (iso || '') + 'Z')

function fmtHora(iso) {
  return toDate(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDia(iso) {
  const d = toDate(iso)
  const hoje = new Date()
  if (d.toDateString() === hoje.toDateString()) return 'Hoje'
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  if (d.toDateString() === ontem.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function ChatBox({ alunoId, outroNome }) {
  const [texto, setTexto] = useState('')
  const [msgs, setMsgs] = useState([])
  const lastIdRef   = useRef(0)
  const inputRef    = useRef(null)
  const scrollRef   = useRef(null)
  const atBottomRef = useRef(true)  // true = usuário está no fim → auto-scroll

  /* ── helpers de scroll ── */
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const checkAtBottom = () => {
    const el = scrollRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  /* ── polling: 2 s quando ativo ── */
  useQuery({
    queryKey: ['chat', alunoId],
    queryFn: async () => {
      const r = await chatMensagens(alunoId, lastIdRef.current)
      const novas = r.data
      if (novas.length > 0) {
        setMsgs(prev => {
          const ids = new Set(prev.filter(m => !m._temp).map(m => m.id))
          const unicas = novas.filter(m => !ids.has(m.id))
          return unicas.length ? [...prev, ...unicas] : prev
        })
        lastIdRef.current = novas[novas.length - 1].id
      }
      return novas
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  })

  /* ── auto-scroll apenas quando estava no fim ── */
  useEffect(() => {
    if (atBottomRef.current) scrollToBottom()
  }, [msgs.length, scrollToBottom])

  /* ── scroll inicial ── */
  useEffect(() => { scrollToBottom('instant') }, [])  // eslint-disable-line

  /* ── envio com UI otimista ── */
  const { mutate: enviar, isPending: sending } = useMutation({
    mutationFn: ({ t }) => chatEnviar(alunoId, t),
    onSuccess: ({ data }, { tempId }) => {
      setMsgs(prev => {
        const sem = prev.filter(m => m.id !== tempId)
        const ids = new Set(sem.map(m => m.id))
        return ids.has(data.id) ? sem : [...sem, { ...data, meu: true }]
      })
      if (data.id > lastIdRef.current) lastIdRef.current = data.id
      inputRef.current?.focus()
    },
    onError: (_, { tempId, t }) => {
      setMsgs(prev => prev.filter(m => m.id !== tempId))
      setTexto(t)
      toast.error('Falha ao enviar. Tente novamente.')
    },
  })

  const handleSend = useCallback(() => {
    const t = texto.trim()
    if (!t || sending) return
    const tempId = `temp-${Date.now()}`
    // adiciona imediatamente com timestamp local correto
    setMsgs(prev => [...prev, {
      id: tempId, texto: t, meu: true, lido: false,
      criado_em: new Date().toISOString().replace('Z', '') + 'Z',
      _temp: true,
    }])
    setTexto('')
    atBottomRef.current = true
    if (inputRef.current) inputRef.current.style.height = 'auto'
    enviar({ t, tempId })
  }, [texto, sending, enviar])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleChange = (e) => {
    setTexto(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  /* ── agrupa mensagens por dia ── */
  const groups = []
  let lastDia = null
  for (const m of msgs) {
    const dia = fmtDia(m.criado_em)
    if (dia !== lastDia) { groups.push({ type: 'sep', dia, key: `sep-${m.id}` }); lastDia = dia }
    groups.push({ type: 'msg', ...m })
  }

  const restantes = 2000 - texto.length
  const avisoChars = restantes < 200 && texto.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Lista de mensagens */}
      <div
        ref={scrollRef}
        onScroll={checkAtBottom}
        style={{
          flex: 1, overflowY: 'auto', padding: '4px 0 8px',
          display: 'flex', flexDirection: 'column',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent',
        }}
      >
        {msgs.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle style={{ width: 20, height: 20, color: '#818cf8' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#71717A', margin: 0 }}>Nenhuma mensagem ainda</p>
            <p style={{ fontSize: 12, color: '#3F3F46', margin: 0 }}>Envie a primeira mensagem para {outroNome}</p>
          </div>
        )}

        {groups.map(item => {
          if (item.type === 'sep') return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 8px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              <span style={{ fontSize: 11, color: '#52525B', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{item.dia}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>
          )

          const eu = item.meu
          return (
            <div key={item.id} style={{
              display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start',
              padding: '2px 0',
              opacity: item._temp ? 0.65 : 1,
              transition: 'opacity 0.2s',
            }}>
              <div style={{
                maxWidth: '74%', minWidth: 64,
                padding: '8px 12px 5px',
                borderRadius: eu ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: eu ? '#6366f1' : '#1C1C1E',
                border: eu ? 'none' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: eu ? '0 2px 10px rgba(99,102,241,0.3)' : 'none',
              }}>
                <p style={{ fontSize: 14, color: eu ? '#ffffff' : '#E4E4E7', lineHeight: 1.5, margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {item.texto}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: eu ? 'rgba(255,255,255,0.42)' : '#52525B', lineHeight: 1 }}>
                    {fmtHora(item.criado_em)}
                  </span>
                  {eu && (
                    <span style={{
                      fontSize: 10, lineHeight: 1,
                      color: item._temp ? 'rgba(255,255,255,0.3)' : item.lido ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                    }}>
                      {item._temp ? '⏳' : item.lido ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ height: 4 }} />
      </div>

      {/* Input */}
      <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {avisoChars && (
          <p style={{ textAlign: 'right', fontSize: 11, color: restantes < 50 ? '#f87171' : '#71717A', marginBottom: 5, marginTop: 0 }}>
            {restantes} restantes
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.45)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
            placeholder={`Mensagem para ${outroNome || 'aluno'}…`}
            maxLength={2000}
            rows={1}
            style={{
              flex: 1, resize: 'none', outline: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 14, padding: '10px 14px',
              color: '#F4F4F5', fontSize: 14,
              fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
              maxHeight: 120, overflowY: 'auto',
              transition: 'border-color 0.15s',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!texto.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none', flexShrink: 0,
              cursor: texto.trim() && !sending ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: texto.trim() ? '#6366f1' : 'rgba(255,255,255,0.05)',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseDown={e => { if (texto.trim()) e.currentTarget.style.transform = 'scale(0.88)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {sending
              ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'cspin .7s linear infinite' }} />
              : <Send style={{ width: 14, height: 14, color: texto.trim() ? 'white' : '#52525B', transition: 'color 0.15s' }} />
            }
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#3F3F46', marginTop: 6, textAlign: 'center', margin: '5px 0 0' }}>
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      <style>{`@keyframes cspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
