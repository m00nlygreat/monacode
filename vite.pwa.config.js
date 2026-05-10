import { defineConfig } from 'vite';
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

function copyPwaStaticFiles() {
  return {
    name: 'copy-pwa-static-files',
    closeBundle() {
      const outDir = resolve('docs');
      mkdirSync(resolve(outDir, 'icons'), { recursive: true });
      copyFileSync(resolve('src/pwa/manifest.webmanifest'), resolve(outDir, 'manifest.webmanifest'));
      copyFileSync(resolve('src/pwa/sw.js'), resolve(outDir, 'sw.js'));
      cpSync(resolve('src/pwa/icons'), resolve(outDir, 'icons'), { recursive: true });
    },
  };
}

export default defineConfig({
  root: 'src/pwa',
  base: './',
  plugins: [copyPwaStaticFiles()],
  build: {
    outDir: '../../docs',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve('src/pwa/index.html'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
