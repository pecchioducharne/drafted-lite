import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Automatically open the app in the browser
  },
  build: {
    outDir: 'build', // Output directory for the build
  },
});