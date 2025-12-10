import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Permite acesso via IP da rede
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002', // Força IPv4 para evitar erro de node
        changeOrigin: true,
        secure: false,
        // Logs para debug:
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Erro no Proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('✅ Vite Proxy recebendo requisição:', req.method, req.url);
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
