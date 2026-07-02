/**
 * Componente inteligente de vídeo.
 * Detecta automaticamente YouTube, Vimeo ou vídeo direto (mp4).
 * Uso: <VideoPlayer url="https://youtube.com/watch?v=..." />
 */

function getYouTubeId(url) {
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
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
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

  // Vídeo direto (mp4, webm, etc.)
  return (
    <div className={base}>
      <video controls className="w-full h-full" title={title}>
        <source src={url} />
        Seu navegador não suporta vídeos HTML5.
      </video>
    </div>
  )
}

/** Thumbnail clicável — mostra o player só quando clicado. Economiza banda. */
export function VideoThumb({ url, title }) {
  if (!url) return null
  const ytId = getYouTubeId(url)

  return (
    <details className="group">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium select-none">
          <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            ▶
          </span>
          Ver demonstração
        </div>
        {ytId && (
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={title}
            className="mt-2 w-full rounded-xl object-cover max-h-40 group-open:hidden"
          />
        )}
      </summary>
      <div className="mt-2">
        <VideoPlayer url={url} title={title} />
      </div>
    </details>
  )
}
