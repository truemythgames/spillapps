import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://bibletea.app",
  trailingSlash: "never",
  build: {
    inlineStylesheets: "always",
    format: "file",
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
