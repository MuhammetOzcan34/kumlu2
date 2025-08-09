import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  // Sadece development modunda lovable-tagger yükle
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch {
      // Production'da mevcut olmayabilir, hata bastırılır
      console.warn('lovable-tagger could not be loaded');
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    build: {
      target: "esnext",
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
    },
    define: {
      global: "globalThis"
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js']
    }
  };
});
