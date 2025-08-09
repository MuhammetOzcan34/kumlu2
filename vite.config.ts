import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch {
      // Production'da mevcut olmayabilir, hata bastırılır
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
      sourcemap: false
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
    },
    define: {
      global: "globalThis"
    }
  };
});
