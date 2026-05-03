import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so assets work on GitHub Pages (project URL or custom domain) without a second build.
// https://vitejs.dev/config/shared-options.html#base
export default defineConfig({
  base: './',
  plugins: [react()],
});
