import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meuPerfil, updateProfile } from '../api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  User, FileText, Award, Tag, Link as LinkIcon,
  Save, CheckCircle, Camera, Mail,
} from 'lucide-react'

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon style={{ width: 13, height: 13, color: '#52525B' }} />
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Perfil() {
  const { user, updateUser } = useAuth()
  const qc = useQueryClient()

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: () => meuPerfil().then(r => r.data),
    staleTime: 5 * 60_000,
  })

  const [form, setForm] = useState({
    nome: '', bio: '', cref: '', especialidades: '', foto_url: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (perfil) {
      setForm({
        nome: perfil.nome || '',
        bio: perfil.bio || '',
        cref: perfil.cref || '',
        especialidades: perfil.especialidades || '',
        foto_url: perfil.foto_url || '',
      })
    }
  }, [perfil])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['meu-perfil'] })
      updateUser({ nome: res.data.nome })
      toast.success('Perfil atualizado!')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: () => toast.error('Erro ao salvar perfil'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {}
    if (form.nome.trim())         payload.nome = form.nome.trim()
    if (form.bio !== undefined)   payload.bio = form.bio
    if (form.cref !== undefined)  payload.cref = form.cref
    if (form.especialidades !== undefined) payload.especialidades = form.especialidades
    if (form.foto_url !== undefined) payload.foto_url = form.foto_url
    mutation.mutate(payload)
  }

  const initials = (form.nome || user?.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[140, 220, 180].map(h => (
          <div key={h} className="skeleton" style={{ borderRadius: 12, height: h }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 2 }}>
          Meu Perfil
        </h1>
        <p style={{ fontSize: 13, color: '#71717A' }}>Informações exibidas para seus alunos</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Avatar + basic info */}
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Informações pessoais
          </h2>

          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              {form.foto_url ? (
                <img
                  src={form.foto_url}
                  alt="Foto de perfil"
                  style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #27272A' }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: '#1C1C1E', border: '2px solid #27272A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 600, color: '#A1A1AA',
                }}>
                  {initials}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                background: '#1C1C1E', border: '1px solid #27272A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera style={{ width: 10, height: 10, color: '#71717A' }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5', marginBottom: 2 }}>{form.nome || user?.nome}</p>
              <p style={{ fontSize: 12, color: '#52525B' }}>Personal Trainer</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nome completo" icon={User}>
              <input
                className="input"
                value={form.nome}
                onChange={set('nome')}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </Field>

            <Field label="E-mail" icon={Mail}>
              <input
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: 11, color: '#52525B', marginTop: 4 }}>
                E-mail não pode ser alterado por aqui
              </p>
            </Field>

            <Field label="URL da foto de perfil" icon={LinkIcon}>
              <input
                className="input"
                value={form.foto_url}
                onChange={set('foto_url')}
                placeholder="https://..."
                type="url"
              />
            </Field>
          </div>
        </div>

        {/* Professional info */}
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Informações profissionais
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="CREF" icon={Award}>
              <input
                className="input"
                value={form.cref}
                onChange={set('cref')}
                placeholder="Ex: 012345-G/SP"
              />
            </Field>

            <Field label="Especialidades" icon={Tag}>
              <input
                className="input"
                value={form.especialidades}
                onChange={set('especialidades')}
                placeholder="Ex: Musculação, Funcional, Emagrecimento"
              />
              <p style={{ fontSize: 11, color: '#52525B', marginTop: 4 }}>
                Separe por vírgula
              </p>
            </Field>

            <Field label="Bio / Apresentação" icon={FileText}>
              <textarea
                className="input"
                value={form.bio}
                onChange={set('bio')}
                placeholder="Conte um pouco sobre você, sua experiência e metodologia..."
                rows={4}
                style={{ resize: 'vertical', minHeight: 100 }}
              />
            </Field>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="btn-primary"
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px' }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle style={{ width: 14, height: 14 }} />
              Salvo!
            </>
          ) : (
            <>
              <Save style={{ width: 14, height: 14 }} />
              Salvar alterações
            </>
          )}
        </button>
      </form>
    </div>
  )
}
