import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/nandivarunreddy.github.io/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return "gsap";
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(
              id
            )
          ) {
            return "vendor";
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ["three", "gsap", "lenis"],
  },
});
