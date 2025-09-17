import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'doom-black': '#000000',
        'terminal-green': '#00ff41',
        'blood-red': '#ff0000',
        'warning-amber': '#ffaa00',
        'void-purple': '#7700ff',
        'glitch-blue': '#00ffff',
      },
      fontFamily: {
        'vt323': ['var(--font-vt323)', 'monospace'],
        'mono': ['Courier New', 'monospace'],
      },
      animation: {
        'glitch': 'glitch-skew 1s infinite linear alternate-reverse',
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
        'ticker': 'ticker 30s linear infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        'glitch-skew': {
          '0%': { transform: 'skew(0deg)' },
          '10%': { transform: 'skew(2deg)' },
          '20%': { transform: 'skew(0deg)' },
          '30%': { transform: 'skew(1deg)' },
          '40%': { transform: 'skew(0deg)' },
          '50%': { transform: 'skew(-1deg)' },
          '60%': { transform: 'skew(0deg)' },
          '70%': { transform: 'skew(-2deg)' },
          '80%': { transform: 'skew(0deg)' },
          '90%': { transform: 'skew(2deg)' },
          '100%': { transform: 'skew(0deg)' },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' },
        },
        'ticker': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
