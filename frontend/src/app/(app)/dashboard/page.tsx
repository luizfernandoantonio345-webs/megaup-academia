'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { listarAlunos, analyticsResumo } from '@/lib/api-routes'
import { useEffect, useRef, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Users, TrendingUp, TrendingDown, Calendar, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, Zap, UserCheck,
  Clock, Target, Award, ChevronRight, BarChart2,
} from 'lucide-react'
import Link from 'next/link'

/* ── Types ──────────────────────────────────────────────────────── */
type Aluno = { id: number; nome: string; email: string; ativo: boolean; plano?: string; criado_em?: string; data_checkin?: string; status_pagamento?: string }
type Analytics = { total_alunos?: number; novos_30d?: number; churn_risk?: Array<{ id: number; nome: string; dias_sem_treino?: number; score?: number }> }
type AxiosWrapped<T> = { data: T }

/* ── Color map ──────────────────────────────────────────────────── */
const COLOR_MAP: Record<string, string> = { A: '#6366f1', B: '#ec4899', C: '#f97316', D: '#22c55e', E: '#a855f7', F: '#06b6d4', G: '#ef4444', H: '#eab308', I: '#14b8a6', J: '#8b5cf6', K: '#f43f5e', L: '#10b981', M: '#3b82f6', N: '#fb923c', O: '#84cc16', P: '#e879f9', Q: '#2dd4bf', R: '#f472b6', S: '#38bdf8', T: '#4ade80', U: '#fbbf24', V: '#818cf8', W: '#34d399', X: '#f87171', Y: '#a78bfa', Z: '#60a5fa' }
const getColor = (name: string) => COLOR_MAP[(name || 'A')[0].toUpperCase()] || '#6366f1'
const getInitials = (name: string) => name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??'

/* ── Count-up hook ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  const frame = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const start = useRef<number | null>(null)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    start.current = null
    const animate = (ts: number) => {
      if (!start.current) start.current = ts
      const p = Math.min((ts - start.current) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(ease * target))
      if (p < 1) frame.current = requestAnimationFrame(animate)
    }
    frame.current = requestAnimationFrame(animate)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration])
  return val
}

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = getColor(name)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  )
}

/* ── KPI card ────────────────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color, trend, trendLabel, prefix = '', suffix = '' }: { label: string; value: number; icon: React.ElementType; color: string; trend?: 'up' | 'down' | null; trendLabel?: string; prefix?: string; suffix?: string }) {
  const display = useCountUp(value)
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : 'transparent'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px -8px ${color}20` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, borderRadius: '50%', background: `${color}10`, pointerEvents: 'none', filter: 'blur(20px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
        {trend && trendLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: `${trendColor}10`, border: `1px solid ${trendColor}25` }}>
            <TrendIcon style={{ width: 11, height: 11, color: trendColor }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: trendColor }}>{trendLabel}</span>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
          {prefix}{display.toLocaleString('pt-BR')}{suffix}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

/* ── Chart tooltip ────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{payload[0]?.value} alunos</div>
    </div>
  )
}

/* ── Activity item ────────────────────────────────────────────── */
function ActivityItem({ aluno, action, time, color }: { aluno: Aluno; action: string; time: string; color: string }) {
  return (
    <Link href={`/alunos/${aluno.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <Avatar name={aluno.nome} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aluno.nome}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{action}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-disabled)', whiteSpace: 'nowrap' }}>{time}</span>
      </div>
    </Link>
  )
}

/* ── Quick Action ──────────────────────────────────────────────── */
function QuickAction({ to, icon: Icon, label, color }: { to: string; icon: React.ElementType; label: string; color: string }) {
  return (
    <Link href={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', textDecoration: 'none', transition: 'all 0.15s' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `${color}08`; el.style.borderColor = `${color}30`; el.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg-elevated)'; el.style.borderColor = 'var(--border-subtle)'; el.style.transform = '' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 17, height: 17, color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </Link>
  )
}

/* ── Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()

  const { data: alunosRes } = useQuery<AxiosWrapped<Aluno[]>>({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos() as Promise<AxiosWrapped<Aluno[]>>,
    staleTime: 60_000,
  })

  const { data: analyticsRes } = useQuery<AxiosWrapped<Analytics>>({
    queryKey: ['analytics-resumo', 7],
    queryFn: () => analyticsResumo(7) as Promise<AxiosWrapped<Analytics>>,
    staleTime: 60_000,
  })

  const alunos: Aluno[] = alunosRes?.data || []
  const analytics: Analytics = analyticsRes?.data || {}

  const totalAlunos = analytics.total_alunos ?? alunos.length
  const ativos = alunos.filter(a => a.ativo).length
  const inativos = alunos.filter(a => !a.ativo).length
  const novos = analytics.novos_30d ?? 0
  const churnRisk = analytics.churn_risk || []
  const recentes = [...alunos].sort((a, b) => (b.criado_em || '').localeCompare(a.criado_em || '')).slice(0, 5)
  const inadimplentes = alunos.filter(a => a.status_pagamento === 'overdue' || a.status_pagamento === 'atrasado').length

  const taxaAtividade = totalAlunos > 0 ? Math.round((ativos / totalAlunos) * 100) : 0
  const firstName = user?.nome?.split(' ')[0] || 'Personal'
  const now = new Date()
  const h = now.getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  const chartData = [
    { dia: 'Seg', alunos: Math.max(2, ativos - 8) },
    { dia: 'Ter', alunos: Math.max(2, ativos - 5) },
    { dia: 'Qua', alunos: Math.max(2, ativos - 3) },
    { dia: 'Qui', alunos: Math.max(2, ativos + 1) },
    { dia: 'Sex', alunos: Math.max(2, ativos + 2) },
    { dia: 'Sáb', alunos: Math.max(2, ativos - 1) },
    { dia: 'Dom', alunos: Math.max(2, ativos - 10) },
  ]

  const peakDay = chartData.reduce((a, b) => a.alunos > b.alunos ? a : b)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: 4 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/alunos/novo" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.35)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(239,68,68,0.45)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(239,68,68,0.35)' }}
          >
            <Users style={{ width: 14, height: 14 }} /> Novo aluno
          </Link>
        </div>
      </div>

      {/* ── KPI grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <KpiCard label="Total de Alunos" value={totalAlunos} icon={Users} color="#6366f1" trend="up" trendLabel={`+${novos} novos`} />
        <KpiCard label="Alunos Ativos" value={ativos} icon={UserCheck} color="#22c55e" trend="up" trendLabel={`${taxaAtividade}%`} />
        <KpiCard label="Inativos" value={inativos} icon={Activity} color="#f97316" trend={inativos > 5 ? 'down' : null} trendLabel="atenção" />
        <KpiCard label="Inadimplentes" value={inadimplentes} icon={DollarSign} color="#ef4444" trend={inadimplentes > 0 ? 'down' : null} trendLabel={inadimplentes > 0 ? 'cobrar' : ''} />
        <KpiCard label="Risco de Churn" value={churnRisk.length} icon={TrendingDown} color="#a855f7" trend={churnRisk.length > 3 ? 'down' : null} trendLabel={churnRisk.length > 3 ? 'alto' : ''} />
        <KpiCard label="Novos (30d)" value={novos} icon={TrendingUp} color="#06b6d4" trend={novos > 0 ? 'up' : null} trendLabel={novos > 0 ? '+crescendo' : ''} />
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16 }}>

        {/* Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '22px 22px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Atividade na Semana</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pico: {peakDay.dia} com {peakDay.alunos} presenças</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <BarChart2 style={{ width: 12, height: 12, color: '#ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>7 dias</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: 'var(--text-disabled)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-disabled)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="alunos" stroke="#ef4444" strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Alunos Recentes</h2>
            <Link href="/alunos" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Ver todos <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          <div>
            {recentes.length === 0 && (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: 13 }}>Nenhum aluno cadastrado</div>
            )}
            {recentes.map((a, i) => (
              <ActivityItem key={a.id} aluno={a}
                action={a.ativo ? `Ativo · ${a.plano || 'Plano básico'}` : 'Inativo'}
                time={i === 0 ? 'hoje' : i === 1 ? 'ontem' : `${i + 1}d`}
                color={a.ativo ? '#22c55e' : '#f97316'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>

        {/* Churn risk */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Risco de Abandono</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{churnRisk.length} alunos em alerta</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target style={{ width: 16, height: 16, color: '#a855f7' }} />
            </div>
          </div>

          {churnRisk.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
              <Award style={{ width: 28, height: 28, color: '#22c55e' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ótimo! Nenhum aluno em risco</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {churnRisk.slice(0, 4).map(a => {
                const score = a.score ?? Math.min(100, (a.dias_sem_treino || 0) * 3)
                const scoreColor = score > 70 ? '#ef4444' : score > 40 ? '#f97316' : '#eab308'
                return (
                  <Link key={a.id} href={`/alunos/${a.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <Avatar name={a.nome} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', borderRadius: 2, background: scoreColor, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, flexShrink: 0 }}>{score}%</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 16, height: 16, color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Ações Rápidas</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acesso direto às ferramentas</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <QuickAction to="/alunos/novo"   icon={Users}      label="Novo Aluno"   color="#6366f1" />
            <QuickAction to="/treinos"        icon={Target}     label="Treino"       color="#22c55e" />
            <QuickAction to="/ia"             icon={Zap}        label="IA"           color="#eab308" />
            <QuickAction to="/agenda"         icon={Calendar}   label="Agenda"       color="#f97316" />
            <QuickAction to="/qr"             icon={Clock}      label="Check-in"     color="#14b8a6" />
            <QuickAction to="/financeiro"     icon={DollarSign} label="Financeiro"   color="#10b981" />
          </div>
        </div>
      </div>

      {/* Spacer mobile */}
      <div className="lg:hidden" style={{ height: 80 }} />
    </div>
  )
}
