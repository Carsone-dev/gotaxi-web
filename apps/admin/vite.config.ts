import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@gotaxi/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "mapbox-gl": "maplibre-gl",
    },
  },
  server: {
    port: 3001,
    host: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query", "@tanstack/react-table"],
          charts: ["recharts"],
          map: ["maplibre-gl", "react-map-gl"],
        },
      },
    },
  },
});
