import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', // This exposes the server to all network interfaces
    port: 5173,      // Default Vite port, you can change it if needed
    strictPort: true // Fails if port is already in use
  }
});