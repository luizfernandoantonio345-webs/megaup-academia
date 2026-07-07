import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const el = document.querySelector('.scroll-content-area')
    if (el) el.scrollTop = 0
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
}
