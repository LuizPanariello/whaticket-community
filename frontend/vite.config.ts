import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    viteTsconfigPaths(), 
    svgrPlugin()
  ],
  build: {
    sourcemap: true,
    outDir: 'build',
  },
  optimizeDeps: {
    include: ['@mui/icons-material'],
  },
  server: {
    port: 5173,
    watch: {
      usePolling: true
    }
  }
});