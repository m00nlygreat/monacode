import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

function copyExtensionManifest() {
  return {
    name: 'copy-extension-manifest',
    closeBundle() {
      copyFileSync(resolve('src/extension/manifest.json'), resolve('dist/manifest.json'));
      copyFileSync(resolve('src/extension/background.js'), resolve('dist/background.js'));
    },
  };
}

export default defineConfig({
  root: 'src/extension',
  base: './',
  plugins: [copyExtensionManifest()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        editor: resolve('src/extension/editor.html'),
      },
    },
  },
});
