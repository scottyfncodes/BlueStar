import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to https://scottyfncodes.github.io/BlueStar/
export default defineConfig({
  plugins: [react()],
  base: '/BlueStar/',
  build: { outDir: 'dist', sourcemap: false },
});
