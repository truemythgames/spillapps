import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: "https://spillapps.com",
  trailingSlash: "never",
  integrations: [sitemap()],
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
