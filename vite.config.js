import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    // The WebGL stack is only reached through a dynamic import in the archive
    // page, so Rollup keeps it in its own chunk. (A manualChunks rule here
    // pulled shared helpers into that chunk and made every page preload it.)
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    css: false,
  },
});
