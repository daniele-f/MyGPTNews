import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({ base: '/MyGPTNews/', build: { rollupOptions: { input: { main: resolve('index.html'), archive: resolve('archive/index.html'), search: resolve('search/index.html') } } } });
