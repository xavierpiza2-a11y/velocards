/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette VéloCards
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#F0D080',
          300: '#E8C04A',
          400: '#C9A84C',
          500: '#B8922A',
          600: '#9A7A1E',
          700: '#7C6118',
          800: '#5E4912',
          900: '#40300B',
        },
        noir: {
          50:  '#1A1A1A',
          100: '#141414',
          200: '#111111',
          300: '#0D0D0D',
          400: '#0A0A0A',
          500: '#080808',
          600: '#050505',
          700: '#030303',
          800: '#020202',
          900: '#000000',
        },
        // Raretés
        rarity: {
          common:    '#6B7280',
          rare:      '#3B82F6',
          epic:      '#8B5CF6',
          legendary: '#F0D080',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #C9A84C 100%)',
        'card-shine':     'linear-gradient(135deg, transparent 40%, rgba(240,208,128,0.15) 50%, transparent 60%)',
        'booster-bg':     'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 8px rgba(201,168,76,0.3)',
        'gold-md': '0 0 20px rgba(201,168,76,0.4)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.5)',
        'legendary': '0 0 30px rgba(240,208,128,0.6), 0 0 60px rgba(240,208,128,0.3)',
      },
      animation: {
        'card-flip':    'cardFlip 0.6s ease-in-out',
        'gold-pulse':   'goldPulse 2s ease-in-out infinite',
        'shine-sweep':  'shineSweep 1.5s ease-in-out',
        'float':        'float 3s ease-in-out infinite',
      },
      keyframes: {
        cardFlip: {
          '0%':   { transform: 'rotateY(90deg) scale(0.8)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg) scale(1)',    opacity: '1' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(201,168,76,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(201,168,76,0.6)' },
        },
        shineSweep: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
