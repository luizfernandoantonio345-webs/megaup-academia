import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)
  const startTime = useRef(null)
  const startValue = useRef(0)

  useEffect(() => {
    if (target === undefined || target === null) return
    const from = startValue.current
    const to = Number(target)
    if (from === to) return

    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const current = from + (to - from) * easeOut(progress)
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))
      if (progress < 1) {
        frame.current = requestAnimationFrame(animate)
      } else {
        startValue.current = to
        startTime.current = null
      }
    }

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(animate)

    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration, decimals])

  return value
}
