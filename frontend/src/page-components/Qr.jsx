import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'react-qr-code'
import { getCheckinToken } from '../api'
import { RefreshCw, QrCode, Clock } from 'lucide-react'

export default function Qr() {
  const [fullscreen, setFullscreen] = useState(false)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['checkin-qr'],
    queryFn: () => getCheckinToken().then(r => r.data),
    staleTime: 60 * 60_000, // token válido o dia todo
    retry: false,
  })

  const checkinUrl = data?.token
    ? `${window.location.origin}/checkin?t=${data.token}`
    : null

  const validade = data?.valido_ate
    ? new Date(data.valido_ate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  if (fullscreen && checkinUrl) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, cursor: 'pointer', zIndex: 9999 }}
        onClick={() => setFullscreen(false)}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
          MegaUp — Check-in
        </div>
        <div style={{ padding: 20, background: 'white', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.12)' }}>
          <QRCode value={checkinUrl} size={280} fgColor="#0D0D0F" bgColor="white" />
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#666' }}>
          Válido até {validade} · toque para fechar
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'Inter, sans-serif' }}>QR de Check-in</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Mostre este QR code na entrada da academia</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 24px' }}>
        {isLoading ? (
          <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: '#E8342B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : checkinUrl ? (
          <>
            <div
              onClick={() => setFullscreen(true)}
              style={{ padding: 16, background: 'white', borderRadius: 16, cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', transition: 'transform 0.15s', display: 'inline-block' }}
              title="Clique para tela cheia"
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <QRCode value={checkinUrl} size={200} fgColor="#0D0D0F" bgColor="white" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#10b981', fontWeight: 600, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                <Clock style={{ width: 13, height: 13 }} />
                Válido até {validade}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                Token renova automaticamente à meia-noite
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 280 }}>
              <button
                onClick={() => setFullscreen(true)}
                className="btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <QrCode style={{ width: 14, height: 14 }} />
                Tela cheia
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <RefreshCw style={{ width: 13, height: 13, animation: isFetching ? 'spin 0.7s linear infinite' : 'none' }} />
                Atualizar
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <QrCode style={{ width: 40, height: 40, color: 'var(--text-disabled)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Erro ao gerar QR code</p>
            <button onClick={() => refetch()} className="btn-primary" style={{ marginTop: 12, fontSize: 13 }}>Tentar novamente</button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px', fontFamily: 'Inter, sans-serif' }}>Como funciona</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { n: 1, text: 'Abra esta página na entrada da academia ou num tablet fixo' },
            { n: 2, text: 'O aluno aponta a câmera do celular para o QR code' },
            { n: 3, text: 'O app MegaUp registra automaticamente a presença do aluno' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(232,52,43,0.12)', border: '1px solid rgba(232,52,43,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#E8342B', fontFamily: 'Inter, sans-serif' }}>{n}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, fontFamily: 'Inter, sans-serif' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
