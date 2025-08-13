import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const plugins = [react()];

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
      // Terser yerine esbuild kullan (daha hızlı)
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor kütüphaneleri ayrı chunk'lara böl
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'chart-vendor': ['recharts'],
            'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          },
          // Dosya adlarını optimize et
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Chunk boyut uyarılarını artır
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        '@supabase/supabase-js',
        '@tanstack/react-query',
        'react-router-dom',
        'lucide-react'
      ],
      // Büyük kütüphaneleri önceden bundle'la
      force: true,
    },
    // CSS optimizasyonu
    css: {
      devSourcemap: mode === 'development',
    },
    // Performans için ek ayarlar
    esbuild: {
      // Production'da console.log'ları kaldır
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Minification ayarları
      minifyIdentifiers: mode === 'production',
      minifySyntax: mode === 'production',
      minifyWhitespace: mode === 'production',
    },
  };
});