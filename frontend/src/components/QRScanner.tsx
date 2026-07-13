'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'

interface QRScannerProps {
  onResult: (value: string) => void
  onClose: () => void
}

export function QRScanner({ onResult, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)
  const detectedRef = useRef(false)

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2 || detectedRef.current) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // BarcodeDetector API — native, zero-dependency, supported on Chrome/Edge/Safari 17+
    if ('BarcodeDetector' in window) {
      // @ts-expect-error — BarcodeDetector is not in TypeScript DOM types yet
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      detector
        .detect(canvas)
        .then((codes: Array<{ rawValue: string }>) => {
          if (codes.length > 0 && !detectedRef.current) {
            detectedRef.current = true
            stopCamera()
            onResult(codes[0].rawValue)
          } else {
            rafRef.current = requestAnimationFrame(scanFrame)
          }
        })
        .catch(() => {
          rafRef.current = requestAnimationFrame(scanFrame)
        })
    } else {
      // Fallback: dynamic import jsQR (only loaded when BarcodeDetector unavailable)
      import('jsqr').then(({ default: jsQR }) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code && !detectedRef.current) {
          detectedRef.current = true
          stopCamera()
          onResult(code.data)
        } else {
          rafRef.current = requestAnimationFrame(scanFrame)
        }
      }).catch(() => {
        rafRef.current = requestAnimationFrame(scanFrame)
      })
    }
  }, [onResult, stopCamera])

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.play().then(() => {
          if (!cancelled) {
            setStarting(false)
            rafRef.current = requestAnimationFrame(scanFrame)
          }
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setStarting(false)
          setError(
            err.name === 'NotAllowedError'
              ? 'Permissão de câmera negada. Permita o acesso nas configurações do navegador.'
              : 'Câmera não disponível. Verifique se outro app está usando.'
          )
        }
      })

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [scanFrame, stopCamera])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.96)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <button
        onClick={() => { stopCamera(); onClose() }}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}
      >
        <X style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ color: 'white', fontSize: 17, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>
          Aponte para o QR da academia
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>
          Check-in automático ao detectar
        </p>
      </div>

      <div style={{ position: 'relative', width: 280, height: 280 }}>
        {starting && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', borderRadius: 20, zIndex: 2,
          }}>
            <Loader2 style={{ width: 32, height: 32, color: '#ef4444', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error ? (
          <div style={{
            width: '100%', height: '100%', borderRadius: 20,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: 20, textAlign: 'center',
          }}>
            <Camera style={{ width: 36, height: 36, color: '#f87171' }} />
            <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'Inter,sans-serif' }}>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: 280, height: 280, objectFit: 'cover', borderRadius: 20, display: 'block' }}
          />
        )}

        {/* Viewfinder corners */}
        {!error && (
          <>
            {[
              { top: 0, left: 0, borderTop: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '16px 0 0 0' },
              { top: 0, right: 0, borderTop: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '0 16px 0 0' },
              { bottom: 0, left: 0, borderBottom: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '0 0 0 16px' },
              { bottom: 0, right: 0, borderBottom: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '0 0 16px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
            ))}
            {/* Scan line */}
            <div style={{
              position: 'absolute', left: 12, right: 12, height: 2,
              background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
              boxShadow: '0 0 8px #ef4444',
              animation: 'scanLine 2s ease-in-out infinite',
              top: '50%',
            }} />
          </>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-120px); opacity: 0.6; }
          50%  { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0.6; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
