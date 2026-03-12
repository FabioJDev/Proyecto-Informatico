/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — light red design system
        'brand-red':    '#990100',
        'brand-bright': '#B90504',
        'brand-dark':   '#333333',
        'brand-light':  '#F6F6F6',
        'brand-gray':   '#E8E8E8',

        // Legacy primary — maps to brand red
        primary: {
          DEFAULT: '#990100',
          deep:    '#700000',
          soft:    '#B90504',
          dim:     'rgba(153,1,0,0.08)',
        },
        secondary: {
          DEFAULT: '#990100',
          dim:     'rgba(153,1,0,0.06)',
        },
        tertiary: {
          DEFAULT: '#1D4ED8',
          dim:     'rgba(29,78,216,0.10)',
        },
        // Surface scale — light theme
        surface: {
          base: '#F6F6F6',
          mid:  '#FFFFFF',
          high: '#FFFFFF',
        },
        // Keep emerald for success states
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#1A7A4A',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Keep amber for warning states
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#B45309',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Red shades
        red: {
          400: '#B90504',
          500: '#990100',
          600: '#700000',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #990100 0%, #B90504 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #B90504, #990100)',
        'gradient-success':   'linear-gradient(135deg, #1A7A4A, #16a34a)',
        'gradient-danger':    'linear-gradient(135deg, #990100, #B90504)',
        'gradient-mesh':
          'radial-gradient(circle at 100% 0%, rgba(153,1,0,0.04) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(153,1,0,0.03) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(153,1,0,0.25)',
        'glow-gold':    '0 0 20px rgba(180,83,9,0.20)',
        'glow-emerald': '0 0 20px rgba(26,122,74,0.25)',
        'glow-red':     '0 0 25px rgba(153,1,0,0.25)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.10)',
        'navbar':       '0 2px 20px rgba(0,0,0,0.06)',
      },
      borderColor: {
        subtle: '#E8E8E8',
        strong: '#CCCCCC',
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
