import type { APIRoute } from "astro";
import { getCatalog, getPlaylists, getSeasons, getCharacters } from "../lib/stories";

const SITE = "https://historytea.app";

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq?: string;
  priority?: number;
}

export const GET: APIRoute = async () => {
  const catalog = getCatalog();
  const [playlists, seasons, characters] = await Promise.all([
    getPlaylists(catalog),
    getSeasons(),
    getCharacters(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const entries: SitemapEntry[] = [
    { loc: SITE + "/", lastmod: today, changefreq: "daily", priority: 1.0 },
    { loc: SITE + "/stories", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: SITE + "/playlists", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: SITE + "/characters", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { loc: SITE + "/books", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { loc: SITE + "/privacy", lastmod: "2026-03-26", changefreq: "yearly", priority: 0.3 },
    { loc: SITE + "/terms", lastmod: "2026-04-13", changefreq: "yearly", priority: 0.3 },
  ];

  for (const story of catalog) {
    entries.push({ loc: `${SITE}/stories/${story.id}`, lastmod: today, changefreq: "monthly", priority: 0.7 });
  }

  for (const pl of playlists) {
    entries.push({ loc: `${SITE}/playlists/${pl.id}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }

  for (const ch of characters) {
    entries.push({ loc: `${SITE}/characters/${ch.id}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }

  for (const season of seasons) {
    entries.push({ loc: `${SITE}/books/${season.slug}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""}${e.priority != null ? `\n    <priority>${e.priority}</priority>` : ""}
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
