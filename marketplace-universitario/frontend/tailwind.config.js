/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Red Noir — primary palette
        primary: {
          DEFAULT: '#DC1E3C',
          deep:    '#A8102A',
          soft:    '#FF3355',
          dim:     'rgba(220,30,60,0.12)',
        },
        secondary: {
          DEFAULT: '#E8A045',
          dim:     'rgba(232,160,69,0.12)',
        },
        tertiary: {
          DEFAULT: '#FF6B8A',
          dim:     'rgba(255,107,138,0.10)',
        },
        // Surface scale
        surface: {
          base: '#0D0608',
          mid:  '#150A0C',
          high: '#1F1014',
        },
        // Keep emerald for success states
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#22C55E',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Keep amber for price / warning accents
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#E8A045',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Red shades (replaces indigo)
        red: {
          400: '#FF3355',
          500: '#DC1E3C',
          600: '#A8102A',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #DC1E3C 0%, #FF3355 50%, #A8102A 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #E8A045, #FF6B8A)',
        'gradient-success':   'linear-gradient(135deg, #22C55E, #16a34a)',
        'gradient-danger':    'linear-gradient(135deg, #EF4444, #DC2626)',
        'gradient-mesh':
          'radial-gradient(ellipse 70% 45% at 15% -5%, rgba(220,30,60,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 85% 105%, rgba(232,160,69,0.10) 0%, transparent 55%)',
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(220,30,60,0.40)',
        'glow-gold':    '0 0 20px rgba(232,160,69,0.30)',
        'glow-emerald': '0 0 20px rgba(34,197,94,0.30)',
        'glow-red':     '0 0 20px rgba(220,30,60,0.35)',
        'card-hover':   '0 20px 60px rgba(220,30,60,0.15)',
        'navbar':       '0 1px 40px rgba(0,0,0,0.5)',
      },
      borderColor: {
        subtle: 'rgba(220,30,60,0.08)',
        strong: 'rgba(220,30,60,0.18)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'float':      'floatBadge 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-dot':  'pulseDot 1.4s ease-in-out infinite',
        'spin-ring':  'spinRing 0.9s linear infinite',
        'slide-in':   'slideInRight 0.35s cubic-bezier(0.23,1,0.32,1) forwards',
        'gradient':   'gradientShift 5s ease infinite',
      },
    },
  },
  plugins: [],
};
