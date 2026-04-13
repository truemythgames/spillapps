import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://bibletea.app",
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
  build: {
    inlineStylesheets: "always",
  },
});
