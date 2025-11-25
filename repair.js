const fs = require('fs');
const path = require('path');

// 1. Corrigir tailwind.config.js
const tailwindConfig = \/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: { 'spin-slow': 'spin 3s linear infinite' }
    },
  },
  plugins: [],
}\;

// 2. Corrigir postcss.config.js
const postcssConfig = \export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}\;

// 3. Corrigir src/index.css
const indexCss = \@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #020617;
  color: white;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
\;

console.log('?? A reparar arquivos de configuração...');

try {
    fs.writeFileSync('tailwind.config.js', tailwindConfig, 'utf8');
    console.log('? tailwind.config.js reparado.');
    
    fs.writeFileSync('postcss.config.js', postcssConfig, 'utf8');
    console.log('? postcss.config.js reparado.');
    
    fs.writeFileSync(path.join('src', 'index.css'), indexCss, 'utf8');
    console.log('? src/index.css reparado.');
    
    console.log('?? Tudo pronto! Agora rode: npm run dev');
} catch (e) {
    console.error('? Erro ao reparar:', e);
}
