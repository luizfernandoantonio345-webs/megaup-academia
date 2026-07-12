import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://megaup-api.onrender.com'

export default function Debug() {
  const [ping, setPing] = useState('testando...')
  const [health, setHealth] = useState('testando...')
  const [corsTest, setCorsTest] = useState('testando...')

  useEffect(() => {
    fetch(API + '/ping', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setPing('✅ ' + JSON.stringify(d)))
      .catch(e => setPing('❌ ' + e.message))

    fetch(API + '/health', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setHealth('✅ ' + JSON.stringify(d)))
      .catch(e => setHealth('❌ ' + e.message))

    fetch(API + '/ping', { cache: 'no-store', credentials: 'include' })
      .then(r => r.ok ? '✅ CORS OK (credentials: include)' : '⚠️ status ' + r.status)
      .then(setCorsTest)
      .catch(e => setCorsTest('❌ CORS BLOQUEADO — ' + e.message))
  }, [])

  const row = (label, value) => (
    <tr>
      <td style={{ padding: '8px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ padding: '8px 12px', color: '#f9fafb', wordBreak: 'break-all' }}>{value}</td>
    </tr>
  )

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', background: '#111113', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, marginBottom: 8, color: '#ef4444' }}>MegaUp Diagnóstico</h1>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 24 }}>
        Abra esta página em aba anônima para evitar cache do Service Worker.
      </p>

      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 700, background: '#1a1a1d', borderRadius: 8, overflow: 'hidden' }}>
        <tbody>
          {row('API URL (baked no bundle)', API)}
          {row('window.origin', typeof window !== 'undefined' ? window.location.origin : '—')}
          {row('/ping (sem credenciais)', ping)}
          {row('/ping (com credenciais)', corsTest)}
          {row('/health', health)}
          {row('SW Cache', typeof caches !== 'undefined' ? 'disponível' : 'indisponível')}
          {row('User-Agent', navigator.userAgent)}
        </tbody>
      </table>

      <p style={{ marginTop: 24, fontSize: 11, color: '#374151' }}>
        Se API URL mostrar localhost → bundle foi gerado sem VITE_API_URL → rebuild necessário.<br />
        Se /ping mostrar ❌ CORS BLOQUEADO → problema de CORS no backend.<br />
        Se /ping mostrar ❌ Failed to fetch → backend fora do ar ou URL errada.
      </p>
    </div>
  )
}
