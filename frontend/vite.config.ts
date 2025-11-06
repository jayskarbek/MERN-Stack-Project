import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: 'http://134.199.193.253:5100/', // Listen on all network interfaces
    port: 5100,
    allowedHosts: true,
    plugins: [react()]
  },
});
