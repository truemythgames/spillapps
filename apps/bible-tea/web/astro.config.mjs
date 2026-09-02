import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://bibletea.app",
  image: {
    domains: ["media.spillapps.com"],
    remotePatterns: [{ protocol: "https", hostname: "media.spillapps.com" }],
  },
  // Cloudflare Pages serves directory-format pages at trailing-slash URLs and
  // 308-redirects the bare form, so all internal/canonical URLs must use "/".
  trailingSlash: "always",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
