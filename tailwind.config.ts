import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './extension/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        header: 'var(--bg-header)',
        search: 'var(--bg-search)',
        'search-focus': 'var(--bg-search-focus)',
        'sidebar-active': 'var(--bg-sidebar-active)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-hairline': 'var(--border-hairline)',
        'icon-default': 'var(--icon-default)',
        'icon-hover-bg': 'var(--icon-hover-bg)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        body: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        capture: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        'card-hover-light': '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'card-hover-dark': '0 1px 3px 0 rgba(0,0,0,0.60), 0 4px 8px 3px rgba(0,0,0,0.30)',
      },
    },
  },
  plugins: [],
};

export default config;

