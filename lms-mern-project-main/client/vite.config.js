import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_REACT_APP_API_URL': JSON.stringify('https://lms.fikra.solutions/api/v1')
  }
})
