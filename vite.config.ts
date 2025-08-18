import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        port: 8080,
        host: 'localhost',
        // HMR bağlantı sorunlarını önle
        clientPort: 8080,
        protocol: 'ws'
      },
      watch: {
        usePolling: true,
        interval: 100,
        // Dosya değişikliklerini daha iyi takip et
        ignored: ['**/node_modules/**', '**/.git/**']
      },
      cors: {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      },
      // Proxy ayarları - CORS sorunlarını önle
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins,
    build: {
      target: "esnext",
      outDir: "dist",
      sourcemap: false,
      // Terser yerine esbuild kullan (daha hızlı)
      minify: 'esbuild',
      rollupOptions: {
        external: ['react-is'],
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
      // Module resolution sorunlarını önle
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      // Symlink sorunlarını önle
      preserveSymlinks: false,
      // Dedupe modülleri
      dedupe: ['react', 'react-dom']
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
        'lucide-react',
        'react-is',
        // ERR_ABORTED hatalarını önlemek için ek modüller
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        'class-variance-authority',
        'clsx',
        'tailwind-merge'
      ],
      // Büyük kütüphaneleri önceden bundle'la
      force: true,
      // Module loading sorunlarını önle
      exclude: ['@vite/client', '@vite/env']
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