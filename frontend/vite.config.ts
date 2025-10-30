import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: 'localhost', // Listen on all network interfaces
    port: 5100,
    allowedHosts: true,
    plugins: [react()]
  },
});
