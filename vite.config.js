import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redireciona comandos de celular para web
      'react-native': 'react-native-web',
    },
  },
  define: {
    // Corrige o erro "global is not defined"
    global: 'window',
    // Corrige o erro "__DEV__ is not defined" (AQUI ESTÁ A MÁGICA)
    __DEV__: JSON.stringify(false),
  },
})
