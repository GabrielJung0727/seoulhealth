import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ─── Brand Color Palette ──────────────────────────────────────────────
      colors: {
        brand: {
          // Primary — deep corporate navy
          navy:        '#0D1B2A',
          'navy-light': '#1A2E42',

          // Secondary — trust blue
          blue:        '#1A3A5C',
          teal:        '#1B6CA8',
          'teal-light': '#2D8BC4',

          // Accent — premium gold
          gold:        '#B8965A',
          'gold-light': '#D4AF7A',
          'gold-pale':  '#F0DFB8',

          // Neutral — warm off-whites and grays
          cream:       '#F8F5F0',
          'cream-dark': '#F0EDE8',
          muted:       '#6B7280',
          'muted-light': '#9CA3AF',
          border:      '#E5E0D8',
          'border-dark': '#D4CFC8',
        },
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          '"Playfair Display"',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        display: [
          '"Cormorant Garamond"',
          '"Playfair Display"',
          'Georgia',
          'serif',
        ],
      },

      // ─── Font Size ────────────────────────────────────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'xs':  ['0.75rem',  { lineHeight: '1.25rem' }],
        'admin-sm':  ['0.9375rem', { lineHeight: '1.5rem'   }],
        'admin-base': ['1.125rem',  { lineHeight: '1.75rem'  }],
        'admin-lg':  ['1.25rem',   { lineHeight: '1.875rem' }],
        'admin-xl':  ['1.5rem',    { lineHeight: '2rem'     }],
        'admin-2xl': ['2rem',      { lineHeight: '2.5rem'   }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '88':  '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },

      // ─── Max Width ────────────────────────────────────────────────────────
      maxWidth: {
        '8xl': '90rem',
        '9xl': '100rem',
      },

      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        'sm':  '0.25rem',
        'md':  '0.375rem',
        'lg':  '0.5rem',
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 2px 12px rgba(13, 27, 42, 0.06)',
        'card-hover': '0 6px 24px rgba(13, 27, 42, 0.10)',
        'premium':    '0 4px 24px rgba(13, 27, 42, 0.08)',
        'premium-lg': '0 8px 48px rgba(13, 27, 42, 0.12)',
        'inner-gold': 'inset 0 1px 0 rgba(184, 150, 90, 0.15)',
        'nav':        '0 2px 16px rgba(13, 27, 42, 0.07)',
      },

      // ─── Animation ────────────────────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.6s ease-in-out',
        'fade-in-up':   'fadeInUp 0.6s ease-out',
        'slide-down':   'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up':     'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // ─── Transition Timing ────────────────────────────────────────────────
      transitionTimingFunction: {
        'premium':    'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      // ─── Line Height ──────────────────────────────────────────────────────
      lineHeight: {
        'tighter': '1.1',
        'snug':    '1.3',
      },

      // ─── Letter Spacing ───────────────────────────────────────────────────
      letterSpacing: {
        'widest-2': '0.2em',
        'widest-3': '0.3em',
      },
    },
  },
  plugins: [],
}

export default config
