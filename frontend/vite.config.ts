import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '134.199.193.253', // Listen on all network interfaces
    port: 5000,
    allowedHosts: true,
    plugins: [react()]
  },
});
