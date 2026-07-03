import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'

const PRESETS = [30, 60, 90, 120, 180]

export default function RestTimer({ defaultSeconds = 60, onComplete, className = '' }) {
  const [total, setTotal]       = useState(defaultSeconds)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning]   = useState(false)
  const intervalRef = useRef(null)

  const progress = remaining / total
  const circumference = 2 * Math.PI * 44 // r=44
  const strokeDash = circumference * (1 - progress)

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const start = useCallback(() => {
    if (remaining === 0) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onComplete?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [remaining, onComplete])

  const reset = useCallback(() => {
    stop()
    setRemaining(total)
  }, [stop, total])

  const changePreset = (secs) => {
    stop()
    setTotal(secs)
    setRemaining(secs)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const colorClass = remaining <= 10
    ? 'text-red-500'
    : remaining <= 30
      ? 'text-amber-500'
      : 'text-primary-600'

  const ringColor = remaining <= 10
    ? '#ef4444'
    : remaining <= 30
      ? '#f59e0b'
      : '#4f46e5'

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${colorClass}`}>{timeStr}</span>
          <span className="text-xs text-gray-400 font-medium">descanso</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Reiniciar"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={running ? stop : start}
          disabled={remaining === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
            running
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-primary-600 hover:bg-primary-700 shadow-glow-sm'
          } disabled:opacity-40`}
        >
          {running
            ? <Pause className="w-5 h-5" />
            : <Play className="w-5 h-5 ml-0.5" />
          }
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <Timer className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5">
        {PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => changePreset(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              total === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s >= 60 ? `${s / 60}m` : `${s}s`}
          </button>
        ))}
      </div>
    </div>
  )
}
