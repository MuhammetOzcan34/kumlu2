import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    import("lovable-tagger")
      .then(({ componentTagger }) => {
        plugins.push(componentTagger());
      })
      .catch(() => {
        console.warn("lovable-tagger yüklenemedi (dev only).");
      });
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
      chunkSizeWarningLimit: 1000, // Uyarı limitini artır
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor kütüphaneleri ayır
            vendor: ["react", "react-dom"],
            supabase: ["@supabase/supabase-js"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toast"
            ],
            router: ["react-router-dom"],
            query: ["@tanstack/react-query"],
            icons: ["lucide-react", "@radix-ui/react-icons"]
          },
        },
      },
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
      include: ["react", "react-dom", "@supabase/supabase-js"],
    },
  };
});
