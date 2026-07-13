'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

async function getVapidKey(): Promise<string> {
  const res = await api.get<{ public_key: string }>('/push/vapid-public-key')
  return res.data.public_key
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) arr[i] = rawData.charCodeAt(i)
  return arr
}

type PushState = 'unknown' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'

export function PushNotificationToggle() {
  const [state, setState] = useState<PushState>('unknown')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') { setState('denied'); return }

    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setState(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  const { mutate: subscribe, isPending: subscribing } = useMutation({
    mutationFn: async () => {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setState('denied'); throw new Error('denied') }

      const vapidKey = await getVapidKey()
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await api.post('/push/subscribe', sub.toJSON())
      return sub
    },
    onSuccess: () => setState('subscribed'),
    onError: (err: Error) => {
      if (err.message !== 'denied') setState('unsubscribed')
    },
  })

  const { mutate: unsubscribe, isPending: unsubscribing } = useMutation({
    mutationFn: async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await api.post('/push/unsubscribe', { endpoint: sub.endpoint })
        await sub.unsubscribe()
      }
    },
    onSuccess: () => setState('unsubscribed'),
  })

  const loading = subscribing || unsubscribing || state === 'unknown'

  if (state === 'unsupported') return null

  const isOn = state === 'subscribed'
  const color = state === 'denied' ? '#6b7280' : isOn ? '#22c55e' : '#ef4444'

  return (
    <button
      disabled={loading || state === 'denied'}
      onClick={() => isOn ? unsubscribe() : subscribe()}
      style={{
        width: '100%', padding: '14px 18px', borderRadius: 16,
        background: isOn
          ? 'radial-gradient(ellipse at 10% -20%, rgba(34,197,94,0.15) 0%, transparent 55%), #111113'
          : 'radial-gradient(ellipse at 10% -20%, rgba(239,68,68,0.1) 0%, transparent 55%), #111113',
        border: `1px solid ${color}28`,
        cursor: loading || state === 'denied' ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        opacity: state === 'denied' ? 0.6 : 1,
        transition: 'all 0.18s',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: `${color}14`, border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {loading
          ? <Loader2 style={{ width: 18, height: 18, color, animation: 'spin 1s linear infinite' }} />
          : isOn
            ? <Bell style={{ width: 18, height: 18, color }} />
            : <BellOff style={{ width: 18, height: 18, color }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 2 }}>
          {state === 'denied'
            ? 'Notificações bloqueadas'
            : isOn ? 'Notificações ativas' : 'Ativar notificações'}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
          {state === 'denied'
            ? 'Desbloqueie nas configurações do navegador'
            : isOn ? 'Receberá lembretes de treino e streak' : 'Receba lembretes para não perder seu streak'}
        </p>
      </div>
      <div style={{
        width: 38, height: 22, borderRadius: 11, flexShrink: 0,
        background: isOn ? '#22c55e' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${isOn ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
        position: 'relative',
        transition: 'all 0.25s',
        boxShadow: isOn ? '0 0 12px rgba(34,197,94,0.45)' : 'none',
      }}>
        <div style={{
          position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
          background: isOn ? 'white' : 'rgba(255,255,255,0.4)',
          left: isOn ? 19 : 2,
          transition: 'left 0.25s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}
