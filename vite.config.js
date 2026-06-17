import { defineConfig } from 'vite';

export default defineConfig({
  // Define a base como './' para que todos os caminhos gerados no build sejam relativos.
  // Isso é obrigatório para que os arquivos funcionem dentro do protocolo file:// do Electron.
  base: './',
  server: {
    port: 5173,
    strictPort: true
  }
});
