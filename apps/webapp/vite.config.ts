import { fileURLToPath, URL } from "node:url"
import { foldkit } from "@foldkit/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  plugins: [foldkit(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:3001",
      "/todos": "http://localhost:3001",
      "/health": "http://localhost:3001",
      "/openapi.json": "http://localhost:3001",
      "/docs": "http://localhost:3001",
    },
  },
})
