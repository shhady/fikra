const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        hairline: 'rgb(var(--hairline) / <alpha-value>)',

        chalk: 'rgb(var(--chalk) / <alpha-value>)',
        steel: 'rgb(var(--steel) / <alpha-value>)',

        // `slate` is BOTH our caption token and Tailwind's built-in 50–950 ramp.
        // Assigning a bare string here would replace the ramp, silently killing
        // every `slate-800`-style class in the admin area. DEFAULT keeps
        // `text-slate` meaning our token while the numeric shades still resolve.
        slate: {
          ...colors.slate,
          DEFAULT: 'rgb(var(--slate) / <alpha-value>)',
        },

        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-soft': 'rgb(var(--gold-soft) / <alpha-value>)',

        // `gold` predates the light re-theme; the variable now holds
        // ultramarine (see the naming note in globals.css). New code should
        // say what it means:
        accent: 'rgb(var(--gold) / <alpha-value>)',
        'accent-soft': 'rgb(var(--gold-soft) / <alpha-value>)',
      },

      fontFamily: {
        // IBM Plex covers Latin, Arabic AND Hebrew in one superfamily — the only
        // mainstream family that does. So the site reads as one voice in all
        // three languages instead of three unrelated typefaces bolted together.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // Rubik for display: born as a Hebrew face, with real Arabic and Latin
        // coverage — the one family whose own story matches this studio's.
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-xl': [
          'clamp(2.5rem, 5.2vw, 4.25rem)',
          { lineHeight: '1.06', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        'display-lg': [
          'clamp(2rem, 3.6vw, 2.875rem)',
          { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '600' },
        ],
        'display-md': [
          'clamp(1.5rem, 2.4vw, 2rem)',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
      },

      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) * 1.5)',
      },

      maxWidth: {
        prose: '68ch',
      },

      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        // The ambient light breathes, very slowly. Almost subliminal — you notice
        // it is alive without being able to say why.
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-2%, 1.5%, 0) scale(1.06)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        drift: 'drift 18s ease-in-out infinite',
        marquee: 'marquee 42s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
