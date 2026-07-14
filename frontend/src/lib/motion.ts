import type { Variants, Transition } from 'framer-motion'

/* ── Spring configs ─────────────────────────────────────────────────── */
export const springs = {
  snappy: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
  normal: { type: 'spring', stiffness: 350, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 18 } as Transition,
}

/* ── Easing presets ─────────────────────────────────────────────────── */
export const ease = {
  out:    [0.22, 1, 0.36, 1] as const,
  in:     [0.64, 0, 0.78, 0] as const,
  inout:  [0.65, 0, 0.35, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
}

/* ── Base variants ──────────────────────────────────────────────────── */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: ease.out } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: ease.in } },
}

export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.out } },
  exit:    { opacity: 0, y: 8, transition: { duration: 0.15, ease: ease.in } },
}

export const slideDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: ease.out } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15, ease: ease.in } },
}

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.out } },
  exit:    { opacity: 0, x: -8, transition: { duration: 0.15 } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springs.normal },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

export const scaleBouncy: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: springs.bouncy },
}

/* ── List stagger ───────────────────────────────────────────────────── */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.03 } },
}

export const listItem: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: ease.out } },
}

/* ── Page transitions ───────────────────────────────────────────────── */
export const pageEnter: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: ease.out } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

/* ── Card hover ─────────────────────────────────────────────────────── */
export const cardHover = {
  rest:  { y: 0, transition: { duration: 0.2, ease: ease.out } },
  hover: { y: -2, transition: { duration: 0.2, ease: ease.out } },
}

/* ── Modal / overlay ────────────────────────────────────────────────── */
export const overlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const modal: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springs.normal },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
}

export const sheet: Variants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: springs.normal },
  exit:    { y: '100%', transition: { duration: 0.2, ease: ease.in } },
}
