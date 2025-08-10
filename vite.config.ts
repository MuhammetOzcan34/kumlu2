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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            supabase: ["@supabase/supabase-js"],
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
