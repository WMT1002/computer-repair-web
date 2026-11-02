import defaultTheme from 'tailwindcss/defaultTheme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: Object.fromEntries(
        Object.entries(defaultTheme.fontSize).map(([name, [size, options]]) => [
          name,
          [`calc(${size} * var(--ui-text-scale))`, {
            ...options,
            lineHeight: options.lineHeight.endsWith('rem')
              ? `calc(${options.lineHeight} * var(--ui-text-scale))`
              : options.lineHeight,
          }],
        ])
      ),
      colors: {
        sky: { 100: '#e8eff6', 200: '#cbdbea', 300: '#b0c6db', 400: '#93b4d4', 500: '#547fa6', 600: '#365e84', 700: '#2b4e70' },
        cyan: { 300: '#b0c6db', 400: '#93b4d4', 500: '#547fa6', 600: '#365e84' },
        emerald: { 300: '#acc7b5', 400: '#8eb7a0', 500: '#5c8a70', 600: '#426d58' },
        purple: { 300: '#bcc3d0', 400: '#a1adbf', 500: '#7c8ba2', 600: '#63738b' },
        amber: { 300: '#ddc79f', 400: '#d1b17b', 500: '#b28b4d', 600: '#886528' },
        slate: { 950: '#11151b', 900: '#14181f', 800: '#1c222b', 700: '#35404e' },
      },
      fontFamily: {
        mono: ['Noto Sans TC', 'sans-serif'],
        sans: ['Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
