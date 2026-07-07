import { useState } from 'react'

export function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function getVimeoId(url) {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

export default function VideoPlayer({ url, title = 'Demonstração do exercício', className = '' }) {
  if (!url) return null
  const ytId = getYouTubeId(url)
  const vimeoId = !ytId ? getVimeoId(url) : null
  const base = `w-full rounded-xl overflow-hidden aspect-video bg-black ${className}`

  if (ytId) {
    return (
      <div className={base}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  if (vimeoId) {
    return (
      <div className={base}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className={base}>
      <video controls className="w-full h-full" title={title}>
        <source src={url} />
      </video>
    </div>
  )
}

export function VideoThumb({ url, title }) {
  const [playing, setPlaying] = useState(false)
  if (!url) return null
  const ytId = getYouTubeId(url)

  if (playing) {
    return (
      <div style={{ borderRadius: 12, overflow: 'hidden' }}>
        <VideoPlayer url={url} title={title} />
      </div>
    )
  }

  return (
    <div
      onClick={() => setPlaying(true)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 12,
        overflow: 'hidden',
        aspectRatio: '16/9',
        background: '#080D1A',
      }}
    >
      {ytId ? (
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt={title || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="#71717A" viewBox="0 0 24 24">
            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </div>
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(99,102,241,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {title && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{title}</span>
        </div>
      )}
    </div>
  )
}
