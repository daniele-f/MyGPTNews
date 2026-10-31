import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({ base: '/MyGPTNews/', build: { rollupOptions: { input: { main: resolve('index.html'), article: resolve('article/index.html'), search: resolve('search/index.html') } } } });
