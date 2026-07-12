'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { listarAlunos, analyticsResumo } from '@/lib/api-routes'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Dumbbell, UserPlus, ArrowRight, BarChart2,
  TrendingUp, Activity, AlertTriangle, Zap, Target,
  ChevronRight, Flame,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useState, useEffect, useRef } from 'react'

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (target === prev.current) return
    const start = prev.current
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(start + (target - start) * ease))
      if (p < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
}

function Avatar({ nome, size = 34 }: { nome: string; size?: number }) {
  const initials = (nome || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
  const color = colors[(nome?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0,
    }}>{initials}</div>
  )
}

function KpiCard({ label, value, icon: Icon, color, href, sublabel, delay = 0 }: {
  label: string; value: number | string; icon: React.ElementType
  color: string; href?: string; sublabel?: string; delay?: number
}) {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  const counted = useCountUp(isNaN(num) ? 0 : num)
  const display = isNaN(num) ? value : counted
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={href ? { scale: 1.015, y: -2 } : {}}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden', cursor: href ? 'pointer' : 'default' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 15, height: 15, color }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{display}{typeof value === 'number' && label.includes('Taxa') ? '%' : ''}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{sublabel}</div>}
      </div>
      {href && <ChevronRight style={{ position: 'absolute', right: 16, bottom: 22, width: 14, height: 14, color: 'var(--text-disabled)' }} />}
    </motion.div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1c1d22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{payload[0].value} treino{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function Sk({ h }: { h: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 10 }} />
}

const PD = (p: unknown) => p

type Aluno = { id: number; nome: string; objetivo?: string }
type Analytics = {
  treinos_por_dia?: { dia: string; total: number }[]
  treinos_semana?: number
  total_alunos?: number
  alunos_ativos_7d?: number
  risco_abandono?: { id: number; nome: string; dias_inativo: number; score: number }[]
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: alunos = [], isLoading: la } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  const { data: analytics, isLoading: lan } = useQuery({
    queryKey: ['analytics-resumo', 7],
    queryFn: () => analyticsResumo(7).then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  const a = analytics as Analytics | undefined
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const recentAlunos = [...(alunos as Aluno[])].reverse().slice(0, 5)
  const treinosDia = (a?.treinos_por_dia || []).slice(-7).map(r => ({ dia: r.dia.slice(5), treinos: r.total }))
  const totalTreinos = a?.treinos_semana ?? 0
  const totalAlunos = a?.total_alunos ?? (alunos as Aluno[]).length
  const ativos = a?.alunos_ativos_7d ?? 0
  const riscoAbandono = a?.risco_abandono ?? []
  const taxaAtividade = totalAlunos > 0 ? Math.round((ativos / totalAlunos) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 3 }}>
            {saudacao}, {user?.nome?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/convites"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(239,68,68,0.35)', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dc2626'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
        >
          <UserPlus style={{ width: 14, height: 14 }} /> Adicionar aluno
        </Link>
      </motion.div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <KpiCard label="Total de Alunos"   value={la ? 0 : totalAlunos}     icon={Users}        color="#3b82f6" href="/alunos"    sublabel="Ver lista completa"      delay={0}    />
        <KpiCard label="Treinos (7 dias)"  value={lan ? 0 : totalTreinos}   icon={Dumbbell}     color="#ef4444"                  sublabel="Execuções registradas"   delay={0.05} />
        <KpiCard label="Alunos Ativos"     value={lan ? 0 : ativos}         icon={Flame}        color="#22c55e"                  sublabel="Treinaram esta semana"   delay={0.1}  />
        <KpiCard label="Taxa de Atividade" value={lan ? 0 : taxaAtividade}  icon={Target}       color="#a855f7"                  sublabel="% de alunos ativos"      delay={0.15} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Atividade — últimos 7 dias</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Treinos executados por dia</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
              <Activity style={{ width: 12, height: 12, color: '#ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>LIVE</span>
            </div>
          </div>
          {lan ? <Sk h={180} /> : treinosDia.length === 0 ? (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Dumbbell style={{ width: 24, height: 24, color: 'var(--text-disabled)' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma execução registrada</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={treinosDia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="treinos" stroke="#ef4444" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Visão geral</h2>
            <TrendingUp style={{ width: 15, height: 15, color: 'var(--text-disabled)' }} />
          </div>
          {lan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><Sk h={32} /><Sk h={32} /><Sk h={32} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
              {[
                { label: 'Alunos cadastrados', value: totalAlunos, max: Math.max(totalAlunos, 1), color: '#3b82f6' },
                { label: 'Treinos esta semana', value: totalTreinos, max: Math.max(totalTreinos, 1), color: '#ef4444' },
                { label: 'Alunos ativos', value: ativos, max: Math.max(totalAlunos, 1), color: '#22c55e' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: '100%', background: color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <Link href="/convites" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}
                >
                  <UserPlus style={{ width: 13, height: 13 }} /> Convidar aluno
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Alunos recentes</h2>
            <Link href="/alunos" style={{ fontSize: 12, color: '#ef4444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              Ver todos <ArrowRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
          {la ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3,4].map(i => <Sk key={i} h={42} />)}</div>
          ) : recentAlunos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <Users style={{ width: 24, height: 24, color: 'var(--text-disabled)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Nenhum aluno ainda</p>
              <Link href="/convites" style={{ fontSize: 12, padding: '7px 16px', background: '#ef4444', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Enviar convite</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentAlunos.map((a, i) => (
                <Link key={a.id} href={`/alunos/${a.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', textDecoration: 'none', borderBottom: i < recentAlunos.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'opacity 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  <Avatar nome={a.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                    {a.objetivo && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.objetivo}</div>}
                  </div>
                  <ChevronRight style={{ width: 13, height: 13, color: 'var(--text-disabled)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Ações rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { href: '/convites',   icon: UserPlus,   label: 'Enviar convite por e-mail',  color: '#3b82f6' },
              { href: '/exercicios', icon: Dumbbell,   label: 'Gerenciar exercícios',         color: '#22c55e' },
              { href: '/ia',         icon: Zap,        label: 'Sugestões de progressão IA',  color: '#a855f7' },
              { href: '/financeiro', icon: BarChart2,  label: 'Cobranças e planos',           color: '#f97316' },
              { href: '/analytics',  icon: TrendingUp, label: 'Relatório completo',           color: '#ef4444' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 7, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 14, height: 14, color }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                <ChevronRight style={{ width: 13, height: 13, color: 'var(--text-disabled)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Churn risk */}
      {!lan && riscoAbandono.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle style={{ width: 15, height: 15, color: '#f97316' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Risco de abandono</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{riscoAbandono.length} aluno{riscoAbandono.length > 1 ? 's' : ''} precisam de atenção</p>
              </div>
            </div>
            <Link href="/inativos" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
              Ver todos <ArrowRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {riscoAbandono.slice(0, 4).map((al, i) => {
              const sc = al.score >= 8 ? '#ef4444' : al.score >= 5 ? '#f97316' : '#fbbf24'
              return (
                <Link key={al.id} href={`/alunos/${al.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', textDecoration: 'none', borderBottom: i < Math.min(riscoAbandono.length, 4) - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'opacity 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  <Avatar nome={al.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.nome}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc, flexShrink: 0, marginLeft: 8 }}>
                        {al.dias_inativo === 999 ? 'Nunca treinou' : `${al.dias_inativo}d sem treinar`}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(al.score / 10) * 100}%`, background: sc, borderRadius: 99 }} />
                    </div>
                  </div>
                  <ChevronRight style={{ width: 13, height: 13, color: 'var(--text-disabled)', flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
