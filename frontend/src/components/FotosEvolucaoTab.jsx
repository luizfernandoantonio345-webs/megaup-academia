import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarFotos, uploadFoto, deletarFoto } from '../api'
import toast from 'react-hot-toast'
import { Camera, Trash2, ChevronLeft, ChevronRight, X, Upload, Scale, GitCompare } from 'lucide-react'

const TIPOS = ['frente', 'lado', 'costas']
const TIPO_LABEL = { frente: 'Frente', lado: 'Lado', costas: 'Costas' }

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        // Tenta qualidade 0.72 primeiro; se ainda grande, usa 0.5
        let b64 = canvas.toDataURL('image/jpeg', 0.72).split(',')[1]
        if (b64.length > 200000) b64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1]
        resolve(b64)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function FotoCard({ foto, onDelete, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background:'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <img
        src={`data:image/jpeg;base64,${foto.foto_base64}`}
        alt={`${TIPO_LABEL[foto.tipo]} — ${new Date(foto.data).toLocaleDateString('pt-BR')}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'white', marginBottom: 2 }}>{TIPO_LABEL[foto.tipo]}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
          {new Date(foto.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        {foto.peso && <div style={{ fontSize: 10, color: '#34d399', marginTop: 1 }}>{foto.peso} kg</div>}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(foto) }}
        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <Trash2 style={{ width: 12, height: 12, color: '#f87171' }} />
      </button>
    </div>
  )
}

function UploadModal({ alunoId, onClose, onSuccess }) {
  const qc = useQueryClient()
  const [preview, setPreview] = useState(null)
  const [b64, setB64] = useState(null)
  const [tipo, setTipo] = useState('frente')
  const [peso, setPeso] = useState('')
  const [obs, setObs] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return }
    try {
      const compressed = await compressImage(file)
      setB64(compressed)
      setPreview(`data:image/jpeg;base64,${compressed}`)
    } catch {
      toast.error('Erro ao processar imagem')
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleSubmit = async () => {
    if (!b64) { toast.error('Selecione uma foto'); return }
    setUploading(true)
    try {
      await uploadFoto(alunoId, {
        foto_base64: b64,
        tipo,
        peso: peso ? parseFloat(peso) : null,
        observacao: obs || null,
      })
      qc.invalidateQueries({ queryKey: ['fotos', String(alunoId)] })
      toast.success('Foto adicionada!')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao enviar foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, zIndex: 1, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 17, margin: 0 }}>Adicionar foto de evolução</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color:'var(--text-muted)' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${preview ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 14, padding: preview ? 0 : '32px 24px', cursor: 'pointer', textAlign: 'center', marginBottom: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}
        >
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }} />
          ) : (
            <div>
              <Camera style={{ width: 36, height: 36, color:'var(--text-disabled)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color:'var(--text-muted)', margin: '0 0 4px' }}>Toque para selecionar foto</p>
              <p style={{ fontSize: 11, color:'var(--text-disabled)', margin: 0 }}>Da galeria ou câmera · JPG, PNG · comprimida automaticamente</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Scale style={{ width: 10, height: 10 }} />Peso (kg)
            </label>
            <input className="input" type="number" step="0.1" placeholder="75.5" value={peso} onChange={e => setPeso(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Observação</label>
          <input className="input" placeholder="Ex: Início do ciclo de hipertrofia" value={obs} onChange={e => setObs(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!b64 || uploading} onClick={handleSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {uploading
              ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : <><Upload style={{ width: 14, height: 14 }} />Salvar foto</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── COMPARE SLIDER MODAL ─── */
function CompareModal({ fotoA, fotoB, onClose }) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef()
  const dragging = useRef(false)

  const move = (clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(97, Math.max(3, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }

  const fmt = (f) => new Date(f.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <X style={{ width: 16, height: 16 }} />
      </button>

      {/* Date labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 400, marginBottom: 10, padding: '0 4px' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Antes</div>
          <div style={{ fontSize: 13, color: 'white', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{fmt(fotoA)}</div>
          {fotoA.peso && <div style={{ fontSize: 11, color: '#34d399' }}>{fotoA.peso} kg</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Depois</div>
          <div style={{ fontSize: 13, color: 'white', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{fmt(fotoB)}</div>
          {fotoB.peso && <div style={{ fontSize: 11, color: '#34d399' }}>{fotoB.peso} kg</div>}
        </div>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', maxWidth: 400, aspectRatio: '3/4', overflow: 'hidden', borderRadius: 16, cursor: 'col-resize', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        onMouseDown={() => { dragging.current = true }}
        onMouseUp={() => { dragging.current = false }}
        onMouseLeave={() => { dragging.current = false }}
        onMouseMove={e => { if (dragging.current) move(e.clientX) }}
        onTouchStart={() => { dragging.current = true }}
        onTouchEnd={() => { dragging.current = false }}
        onTouchMove={e => { e.preventDefault(); move(e.touches[0].clientX) }}
      >
        {/* Before (left) */}
        <img
          src={`data:image/jpeg;base64,${fotoA.foto_base64}`}
          alt="antes"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
        {/* After (right, clipped) */}
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${pos}%)`, willChange: 'clip-path' }}>
          <img
            src={`data:image/jpeg;base64,${fotoB.foto_base64}`}
            alt="depois"
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          />
        </div>

        {/* Divider line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, background: 'white', transform: 'translateX(-50%)', pointerEvents: 'none', boxShadow: '0 0 8px rgba(0,0,0,0.6)' }}>
          {/* Handle */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 36, height: 36, background: 'white', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <ChevronLeft style={{ width: 12, height: 12, color: '#333' }} />
            <ChevronRight style={{ width: 12, height: 12, color: '#333' }} />
          </div>
        </div>

        {/* Corner labels */}
        <div style={{ position: 'absolute', top: 10, left: 12, fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.55)', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em', pointerEvents: 'none' }}>ANTES</div>
        <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.55)', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em', pointerEvents: 'none' }}>DEPOIS</div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
        ← Arraste para comparar →
      </p>
    </div>
  )
}

export default function FotosEvolucaoTab({ alunoId }) {
  const qc = useQueryClient()
  const [showUpload, setShowUpload] = useState(false)
  const [lightbox, setLightbox] = useState(null)  // { fotos: [], index: 0 }
  const [filterTipo, setFilterTipo] = useState('')
  const [compareTarget, setCompareTarget] = useState(null)  // { fotoA, fotoB }

  const { data: fotos = [], isLoading } = useQuery({
    queryKey: ['fotos', String(alunoId)],
    queryFn: () => listarFotos(alunoId).then(r => r.data),
    staleTime: 5 * 60_000,
  })

  const { mutate: remover } = useMutation({
    mutationFn: ({ fotoId }) => deletarFoto(alunoId, fotoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fotos', String(alunoId)] }); toast.success('Foto removida') },
  })

  const handleDelete = (foto) => {
    if (window.confirm('Remover esta foto?')) remover({ fotoId: foto.id })
  }

  const filtered = filterTipo ? fotos.filter(f => f.tipo === filterTipo) : fotos

  // Pick the tipo with most fotos for the compare button
  const compareTipo = filterTipo || (() => {
    const counts = {}
    fotos.forEach(f => { counts[f.tipo] = (counts[f.tipo] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  })()
  const compareCandidates = fotos.filter(f => f.tipo === compareTipo).sort((a, b) => new Date(a.data) - new Date(b.data))
  const canCompare = compareCandidates.length >= 2
  const openCompare = () => setCompareTarget({ fotoA: compareCandidates[0], fotoB: compareCandidates[compareCandidates.length - 1] })

  // Agrupar por mês/ano
  const byMonth = {}
  for (const f of filtered) {
    const d = new Date(f.data)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    if (!byMonth[key]) byMonth[key] = { label, items: [] }
    byMonth[key].items.push(f)
  }
  const monthEntries = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color:'var(--text-primary)', margin: 0 }}>Fotos de Evolução</h3>
          <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 3, marginBottom: 0 }}>
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''} registrada{fotos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canCompare && (
            <button onClick={openCompare} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              <GitCompare style={{ width: 12, height: 12 }} />Comparar
            </button>
          )}
          <button className="btn-primary btn-sm" onClick={() => setShowUpload(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera style={{ width: 13, height: 13 }} />Adicionar foto
          </button>
        </div>
      </div>

      {/* Filtro por tipo */}
      {fotos.length > 0 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {['', ...TIPOS].map(t => (
            <button key={t || 'all'} onClick={() => setFilterTipo(t)} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: filterTipo === t ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: filterTipo === t ? 'rgba(99,102,241,0.15)' : 'transparent', color: filterTipo === t ? '#fca5a5' : 'var(--text-muted)', outline: 'none' }}>
              {t ? TIPO_LABEL[t] : 'Todas'}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 14 }} />)}
        </div>
      ) : fotos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background:'var(--bg-card)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Camera style={{ width: 40, height: 40, color:'var(--text-disabled)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color:'var(--text-muted)', margin: '0 0 6px' }}>Nenhuma foto ainda</p>
          <p style={{ fontSize: 12, color:'var(--text-disabled)', margin: '0 0 16px', lineHeight: 1.6 }}>
            Registre a evolução física com fotos mensais — frente, lado e costas
          </p>
          <button className="btn-primary btn-sm" onClick={() => setShowUpload(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Camera style={{ width: 13, height: 13 }} />Primeira foto
          </button>
        </div>
      ) : (
        monthEntries.map(([key, { label, items }]) => (
          <div key={key}>
            <div style={{ fontSize: 11, fontWeight: 600, color:'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {items.map((f, idx) => (
                <FotoCard
                  key={f.id}
                  foto={f}
                  onDelete={handleDelete}
                  onClick={() => setLightbox({ fotos: items, index: idx })}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color:'var(--text-secondary)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>

          {lightbox.index > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: lb.index - 1 })) }} style={{ position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ChevronLeft style={{ width: 22, height: 22 }} />
            </button>
          )}

          <img
            src={`data:image/jpeg;base64,${lightbox.fotos[lightbox.index].foto_base64}`}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 12 }}
            onClick={e => e.stopPropagation()}
          />

          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{TIPO_LABEL[lightbox.fotos[lightbox.index].tipo]}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {new Date(lightbox.fotos[lightbox.index].data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            {lightbox.fotos[lightbox.index].peso && (
              <div style={{ fontSize: 11, color: '#34d399', marginTop: 2 }}>{lightbox.fotos[lightbox.index].peso} kg</div>
            )}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {lightbox.index + 1} / {lightbox.fotos.length}
            </div>
          </div>

          {lightbox.index < lightbox.fotos.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: lb.index + 1 })) }} style={{ position: 'absolute', right: 16, width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ChevronRight style={{ width: 22, height: 22 }} />
            </button>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal alunoId={alunoId} onClose={() => setShowUpload(false)} onSuccess={() => setShowUpload(false)} />
      )}

      {compareTarget && (
        <CompareModal fotoA={compareTarget.fotoA} fotoB={compareTarget.fotoB} onClose={() => setCompareTarget(null)} />
      )}
    </div>
  )
}

