/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#6D28D9',
        background: '#FFFFFF',
        foreground: '#111111',
        primary: {
          DEFAULT: '#6D28D9',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#6D28D9',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#FAFAFA',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#6D28D9',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        surface: '#FAFAFA',
        'surface-secondary': '#F3F4F6',
      },

      borderRadius: {
        DEFAULT: '16px',
        lg: '24px',
        xl: '32px',
        full: '9999px',
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        '2xl': '64px',
        unit: '4px',
        gutter: '24px',
        'container-max': '1280px',
        'px-sm': '8px',
        'px-md': '16px',
        'px-lg': '24px',
        'px-xl': '40px',
        'px-2xl': '64px',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'monospace'],
      },

      fontSize: {
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '28px', letterSpacing: '0em', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', letterSpacing: '0em', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'button-text': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
      },

      boxShadow: {
        'sm': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'md': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'lg': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'xl': '0 30px 80px rgba(0, 0, 0, 0.18)',
        '2xl': '0 40px 100px rgba(0, 0, 0, 0.20)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};