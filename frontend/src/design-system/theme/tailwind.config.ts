import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#121212',
          50: '#3A3A3A',
          100: '#333333',
          200: '#2C2C2C',
          300: '#252525',
          400: '#1E1E1E',
          500: '#1A1A1A',
          600: '#161616',
          700: '#121212',
          800: '#0E0E0E',
          900: '#0A0A0A',
          light: '#1E1E1E',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        primary: {
          DEFAULT: '#B08968',
          foreground: '#ffffff',
          400: '#B08968',
          500: '#B08968',
          600: '#9A5C4A',
        },
        accent: {
          DEFAULT: '#4A6572',
          foreground: '#E0E0E0',
          400: '#4A6572',
          500: '#4A6572',
          600: '#4A6572',
        },
        success: {
          400: '#264653',
          500: '#264653',
          600: '#264653',
        },
        slate: {
          850: '#1E1E1E',
          900: '#121212',
          800: '#1A1A1A',
          700: '#2C2C2C',
          600: '#3A3A3A',
          500: '#6B7280',
          400: '#A8B1B9',
          300: '#C0C7CE',
          200: '#D8DDE2',
          100: '#E8EBED',
          50: '#F5F6F7',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#B08968',
        background: '#121212',
        foreground: '#E0E0E0',
        secondary: {
          DEFAULT: '#1E1E1E',
          foreground: '#E0E0E0',
        },
        destructive: {
          DEFAULT: '#B75553',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#9A5C4A',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#A8B1B9',
        },
        popover: {
          DEFAULT: '#1E1E1E',
          foreground: '#E0E0E0',
        },
        card: {
          DEFAULT: '#1E1E1E',
          dark: '#121212',
          light: '#1A1A1A',
          foreground: '#E0E0E0',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', 'Fira Code', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }],        /* 12px */
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],    /* 14px */
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],       /* 16px */
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],    /* 18px */
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0' }],     /* 20px */
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],    /* 24px */
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }], /* 30px */
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],   /* 36px */
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],         /* 48px */
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],        /* 60px */
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],         /* 72px */
      },
      spacing: {
        '0': '0',
        '0.5': '0.125rem',  /* 2px */
        '1': '0.25rem',     /* 4px */
        '2': '0.5rem',      /* 8px - base unit */
        '3': '0.75rem',     /* 12px */
        '4': '1rem',        /* 16px = 2 * 8px */
        '5': '1.25rem',     /* 20px */
        '6': '1.5rem',      /* 24px = 3 * 8px */
        '8': '2rem',        /* 32px = 4 * 8px */
        '10': '2.5rem',     /* 40px = 5 * 8px */
        '12': '3rem',       /* 48px = 6 * 8px */
        '16': '4rem',       /* 64px = 8 * 8px */
        '20': '5rem',       /* 80px = 10 * 8px */
        '24': '6rem',       /* 96px = 12 * 8px */
        '32': '8rem',       /* 128px = 16 * 8px */
        '40': '10rem',      /* 160px = 20 * 8px */
        '48': '12rem',      /* 192px = 24 * 8px */
        '56': '14rem',      /* 224px = 28 * 8px */
        '64': '16rem',      /* 256px = 32 * 8px */
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        emerald: 'var(--shadow-primary)',
        cyan: 'var(--shadow-accent)',
        none: 'none',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
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
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-out': 'fadeOut 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '700ms',
      },
      transitionTimingFunction: {
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      zIndex: {
        base: '0',
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        'modal-backdrop': '1300',
        modal: '1400',
        popover: '1500',
        tooltip: '1600',
      },
      maxWidth: {
        prose: '65ch',
        narrow: '42rem',
        content: '56rem',
        wide: '72rem',
        'enterprise': '1200px', // Enterprise standard: center-aligned max width
        'enterprise-wide': '1600px',
      },
      minWidth: {
        'card': '320px', // Enterprise standard: minimum card width
      },
      minHeight: {
        'card': '180px', // Enterprise standard: minimum card height
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-dark': 'var(--gradient-dark)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-glow': 'var(--gradient-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
