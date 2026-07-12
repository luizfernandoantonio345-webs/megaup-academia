'use client'

/**
 * Camada de compatibilidade React Router → Next.js App Router.
 * Aliased via next.config.ts: import 'react-router-dom' → este módulo.
 * Permite aproveitar as páginas existentes sem reescrita imediata.
 */

import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation'
import NextLink from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { forwardRef } from 'react'

// ── useNavigate ────────────────────────────────────────────────────────────────
export function useNavigate() {
  const router = useRouter()
  return (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === 'number') {
      if (to === -1) router.back()
      return
    }
    if (opts?.replace) router.replace(to)
    else router.push(to)
  }
}

// ── useLocation ────────────────────────────────────────────────────────────────
export function useLocation() {
  const pathname = usePathname()
  const searchParams = useNextSearchParams()
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null as unknown,
    key: 'default',
  }
}

// ── useParams ──────────────────────────────────────────────────────────────────
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useNextParams() as T
}

// ── useSearchParams ────────────────────────────────────────────────────────────
export function useSearchParams() {
  const sp = useNextSearchParams()
  return [sp, () => {}] as const
}

// ── Link ───────────────────────────────────────────────────────────────────────
export const Link = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof NextLink> & { to?: string; replace?: boolean }
>(function Link({ to, href, replace, children, ...props }, ref) {
  return (
    <NextLink
      ref={ref}
      href={(to ?? href ?? '/') as string}
      replace={replace}
      {...props}
    >
      {children}
    </NextLink>
  )
})
Link.displayName = 'Link'

// ── NavLink ────────────────────────────────────────────────────────────────────
// React Router NavLink adds active class — we approximate with pathname check
export const NavLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof NextLink> & {
    to?: string
    replace?: boolean
    className?: string | ((props: { isActive: boolean }) => string)
    style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties)
    children?: ReactNode | ((props: { isActive: boolean }) => ReactNode)
    end?: boolean
  }
>(function NavLink({ to, href, replace, className, style, children, end, ...props }, ref) {
  const pathname = usePathname()
  const path = (to ?? href ?? '/') as string
  const isActive = end ? pathname === path : pathname === path || pathname.startsWith(path + '/')

  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className
  const resolvedStyle =
    typeof style === 'function' ? style({ isActive }) : style
  const resolvedChildren =
    typeof children === 'function' ? children({ isActive }) : children

  return (
    <NextLink
      ref={ref}
      href={path}
      replace={replace}
      className={resolvedClassName}
      style={resolvedStyle}
      {...props}
    >
      {resolvedChildren}
    </NextLink>
  )
})
NavLink.displayName = 'NavLink'

// ── Navigate ───────────────────────────────────────────────────────────────────
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter()
  // Runs on mount via useEffect-like mechanism
  if (typeof window !== 'undefined') {
    if (replace) router.replace(to)
    else router.push(to)
  }
  return null
}

// ── Outlet ─────────────────────────────────────────────────────────────────────
// No-op in Next.js — children are rendered by the layout
export function Outlet() {
  return null
}

// ── useMatch ───────────────────────────────────────────────────────────────────
export function useMatch(pattern: string) {
  const pathname = usePathname()
  const isMatch = pathname === pattern || pathname.startsWith(pattern)
  return isMatch ? { pathname, params: {} } : null
}

// ── BrowserRouter (no-op wrapper) ─────────────────────────────────────────────
export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ── Routes / Route (no-op — Next.js handles routing) ─────────────────────────
export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>
}
export function Route({ element }: { path?: string; element?: ReactNode }) {
  return <>{element}</>
}
