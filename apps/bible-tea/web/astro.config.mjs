import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://bibletea.app",
  trailingSlash: "never",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
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
