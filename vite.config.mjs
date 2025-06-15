import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@tailwindcss/forms', 'framer-motion', 'lucide-react'],
          charts: ['recharts', 'd3'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form'],
          utils: ['date-fns', 'axios']
        }
      }
    },
    // Use esbuild for minification instead of terser for better compatibility
    minify: 'esbuild'
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  },
  // Define Node.js globals for browser compatibility
  define: {
    global: 'globalThis',
  }
});