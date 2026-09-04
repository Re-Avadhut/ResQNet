/** ResQNet design tokens.
 *
 * Adapted from the Linear design language (dark canvas, hairline borders,
 * tight negative tracking on display type), retuned for an emergency
 * operations tool.
 *
 * Two deliberate departures from Linear:
 *
 * 1. The canvas is lifted from near-black (#010102) to #0a0b0d. Cheap LCD
 *    phone panels smear badly on true black; a slightly lifted canvas keeps
 *    hairline borders visible on low-quality screens.
 *
 * 2. Red is reserved EXCLUSIVELY for emergency semantics. Navigation and
 *    primary actions use signal blue. In a safety-critical UI, red must mean
 *    one thing only — if it is used decoratively, it stops being an alarm.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./frontend/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: '#0a0b0d',
        surface: {
          1: '#131519',
          2: '#191c21',
          3: '#20242b',
        },
        hairline: {
          DEFAULT: '#262a31',
          strong: '#363b44',
        },
        // Text
        ink: {
          DEFAULT: '#f7f8f8',
          muted: '#a8b0bd',
          subtle: '#6f7783',
        },
        // Interactive accent (navigation, primary buttons, focus rings)
        accent: {
          400: '#6fa0ff',
          500: '#3d7dff',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Semantic status. Red is emergency-only.
        emergency: {
          400: '#ff7a7c',
          500: '#ff4d4f',
          600: '#e5383b',
          700: '#b91c1c',
        },
        warning: {
          400: '#fbbf4c',
          500: '#f5a524',
          600: '#d97706',
        },
        rescue: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        info: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        // System font stack: zero network requests, and every platform already
        // has these. A webfont would be another thing to vendor and another
        // thing to fail offline.
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        mono: [
          '"SF Mono"', '"Cascadia Mono"', 'Menlo', 'Consolas',
          '"Roboto Mono"', 'monospace',
        ],
      },
      fontSize: {
        // Linear's scale, with its negative tracking on display sizes.
        'display': ['40px', { lineHeight: '1.15', letterSpacing: '-1px', fontWeight: '600' }],
        'headline': ['28px', { lineHeight: '1.20', letterSpacing: '-0.6px', fontWeight: '600' }],
        'title': ['22px', { lineHeight: '1.25', letterSpacing: '-0.4px', fontWeight: '500' }],
        'subhead': ['20px', { lineHeight: '1.40', letterSpacing: '-0.2px' }],
        'body': ['16px', { lineHeight: '1.50', letterSpacing: '-0.05px' }],
        'body-sm': ['14px', { lineHeight: '1.50' }],
        'caption': ['12px', { lineHeight: '1.40' }],
        'eyebrow': ['13px', { lineHeight: '1.30', letterSpacing: '0.4px', fontWeight: '500' }],
        // Stat readouts. Tabular figures so numbers do not jitter on refresh.
        'stat': ['34px', { lineHeight: '1.05', letterSpacing: '-1.2px', fontWeight: '600' }],
      },
      spacing: {
        // Linear's rhythm: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 96
        section: '96px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6)',
        glow: '0 0 0 1px rgba(61,125,255,.4), 0 0 24px -6px rgba(61,125,255,.45)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
      },
    },
  },
  plugins: [],
};
