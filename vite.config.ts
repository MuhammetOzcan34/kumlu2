import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === 'development') {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins,
    build: {
      target: 'esnext' // Üst düzey await desteği için hedefi güncelle
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
