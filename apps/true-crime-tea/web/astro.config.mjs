import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://truecrimetea.app",
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
