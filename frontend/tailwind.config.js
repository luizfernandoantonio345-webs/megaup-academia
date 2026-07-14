/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* ── MegaUp Energy (brand red) ── */
        energy: {
          50:  '#FFF1F0', 100: '#FFD9D7', 200: '#FFB3AF',
          300: '#FF8C87', 400: '#FF5D56', 500: '#E8342B',
          600: '#C8291F', 700: '#A01F16', 800: '#76150D', 900: '#4D0B07',
        },
        /* ── AI / Teal ── */
        ai: {
          from: '#00C9B0', to: '#0088CC',
          muted: 'rgba(0,201,176,0.08)',
        },
        /* ── XP / Purple ── */
        xp: {
          from: '#8B5CF6', to: '#6D28D9',
        },
        /* ── Surfaces ── */
        surface: {
          0: '#0D0D0F',
          1: '#141416',
          2: '#1A1A1D',
          3: '#222225',
          4: '#2A2A2E',
        },
        /* ── Legado (compatibilidade) ── */
        primary: {
          50: '#FFF1F0', 100: '#FFD9D7', 200: '#FFB3AF',
          300: '#FF8C87', 400: '#FF5D56', 500: '#E8342B',
          600: '#C8291F', 700: '#A01F16', 800: '#76150D', 900: '#4D0B07',
        },
        base: {
          950: '#070B14', 900: '#0E1525', 800: '#141D30',
          700: '#1A2540', 600: '#1F2D4A', 500: '#253355',
        },
        brand: {
          sidebar:          '#0A0A0C',
          'sidebar-hover':  '#141416',
          'sidebar-active': '#1A1A1D',
          'sidebar-border': '#1A1A1D',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up':     'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down':   'slideDown 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':     'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer':      'shimmer 1.6s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'progress':     'progressBar 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'shake':        'shake 0.35s ease both',
        'streak-pulse': 'streakPulse 2s ease-in-out infinite',
        'count-up':     'countUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'sheet-up':     'sheetUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        'ping-once':    'ping 0.6s ease-out 1',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { '0%': { opacity: '0' },                                            '100%': { opacity: '1' } },
        slideUp:     { '0%': { opacity: '0', transform: 'translateY(14px)' },             '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown:   { '0%': { opacity: '0', transform: 'translateY(-10px)' },            '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:     { '0%': { opacity: '0', transform: 'scale(0.94)' },                  '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:     { '0%': { backgroundPosition: '300% 0' },                            '100%': { backgroundPosition: '-300% 0' } },
        float:       { '0%,100%': { transform: 'translateY(0)' },                         '50%': { transform: 'translateY(-8px)' } },
        glowPulse:   { '0%,100%': { boxShadow: '0 0 16px rgba(232,52,43,0.25)' },        '50%': { boxShadow: '0 0 32px rgba(232,52,43,0.55)' } },
        progressBar: { '0%': { width: '0%' },                                             '100%': { width: 'var(--progress-width,100%)' } },
        shake:       { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-5px)' }, '40%': { transform: 'translateX(5px)' }, '60%': { transform: 'translateX(-3px)' }, '80%': { transform: 'translateX(3px)' } },
        streakPulse: { '0%,100%': { transform: 'scale(1)' },                              '50%': { transform: 'scale(1.08)' } },
        countUp:     { '0%': { opacity: '0', transform: 'translateY(10px)' },             '100%': { opacity: '1', transform: 'translateY(0)' } },
        sheetUp:     { '0%': { transform: 'translateY(100%)' },                           '100%': { transform: 'translateY(0)' } },
        pulseDot:    { '0%,100%': { opacity: '1' },                                       '50%': { opacity: '0.4' } },
      },
      boxShadow: {
        /* Elevação */
        'xs':         '0 1px 2px rgba(0,0,0,0.40)',
        'card':       '0 2px 8px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.30)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.30)',
        'modal':      '0 24px 56px rgba(0,0,0,0.60), 0 12px 20px rgba(0,0,0,0.35)',
        /* Glows */
        'glow':        '0 0 0 1px rgba(232,52,43,0.15), 0 4px 24px rgba(232,52,43,0.25)',
        'glow-strong': '0 0 0 1px rgba(232,52,43,0.25), 0 8px 40px rgba(232,52,43,0.35)',
        'glow-sm':     '0 0 12px rgba(232,52,43,0.20)',
        'glow-ai':     '0 4px 24px rgba(0,201,176,0.20), 0 0 0 1px rgba(0,201,176,0.12)',
        'glow-win':    '0 4px 24px rgba(0,201,127,0.20), 0 0 0 1px rgba(0,201,127,0.12)',
        'glow-xp':     '0 4px 24px rgba(139,92,246,0.20), 0 0 0 1px rgba(139,92,246,0.12)',
        'glow-amber':  '0 4px 24px rgba(245,166,35,0.20), 0 0 0 1px rgba(245,166,35,0.12)',
        /* Glass */
        'glass': '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
        'inner-glow': 'inset 0 0 20px rgba(232,52,43,0.08)',
      },
      borderRadius: {
        'xs':   '4px',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',
        '3xl':  '32px',
        '4xl':  '40px',
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backgroundImage: {
        'grad-energy':  'linear-gradient(135deg, #E8342B 0%, #FF5D45 50%, #FF7A4A 100%)',
        'grad-energy-btn': 'linear-gradient(180deg, #FF5D56 0%, #E8342B 100%)',
        'grad-ai':      'linear-gradient(135deg, rgba(0,201,176,0.12) 0%, rgba(0,136,204,0.08) 100%)',
        'grad-xp':      'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'grad-hero':    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,52,43,0.15) 0%, transparent 70%)',
        'grad-card':    'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, transparent 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '68': '17rem',
        '76': '19rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
      },
    },
  },
  plugins: [],
}
