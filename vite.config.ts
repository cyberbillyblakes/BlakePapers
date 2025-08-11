import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index.js";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("lodash") || id.includes("date-fns")) return "vendor-utils";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("recharts")) return "vendor-recharts";
            return "vendor";
          }
        },
      },
    },
  },
  plugins: [
    react(),
    expressPlugin(),
    ...(mode === "production"
      ? [visualizer({ open: true, filename: "dist/stats.html" })]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // only dev server
    async configureServer(server) {
      const app = await createServer();
      server.middlewares.use(app);
    },
  };
}
