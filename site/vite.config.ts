import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths: the built site is relocatable to any subpath
  // (e.g. apps.charliekrug.com/bizdate) with no base-path configuration.
  base: './',
  build: {
    outDir: 'dist',
  },
});
