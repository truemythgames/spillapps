import type { APIRoute } from "astro";
import { getCatalog, getPlaylists, getSeasons, getCharacters, getPrayers } from "../lib/stories";

const SITE = "https://bibletea.app";
const NO_LOCALE_PAGES = new Set(["/privacy", "/terms"]);

interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq?: string;
  priority?: number;
}

function url(loc: string, lastmod: string, changefreq?: string, priority?: number): string {
  let s = `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>`;
  if (changefreq) s += `\n<changefreq>${changefreq}</changefreq>`;
  if (priority != null) s += `\n<priority>${priority}</priority>`;
  s += "\n</url>";
  return s;
}

export const GET: APIRoute = async () => {
  const catalog = getCatalog();
  const [playlists, seasons, characters, prayers] = await Promise.all([
    getPlaylists(catalog),
    getSeasons(),
    getCharacters(),
    getPrayers(),
  ]);

  const today = new Date().toISOString();

  const entries: SitemapEntry[] = [
    { path: "/", lastmod: today, changefreq: "daily", priority: 1 },
    { path: "/stories", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { path: "/playlists", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { path: "/characters", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { path: "/prayers", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { path: "/books", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { path: "/privacy", lastmod: "2026-03-26T00:00:00.000Z", changefreq: "yearly", priority: 0.3 },
    { path: "/terms", lastmod: "2026-04-13T00:00:00.000Z", changefreq: "yearly", priority: 0.3 },
  ];

  for (const story of catalog) {
    entries.push({ path: `/stories/${story.id}`, lastmod: today, changefreq: "monthly", priority: 0.7 });
  }
  for (const pl of playlists) {
    entries.push({ path: `/playlists/${pl.id}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }
  for (const ch of characters) {
    entries.push({ path: `/characters/${ch.id}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }
  for (const season of seasons) {
    entries.push({ path: `/books/${season.slug}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }
  for (const prayer of prayers) {
    entries.push({ path: `/prayers/${prayer.slug}`, lastmod: today, changefreq: "monthly", priority: 0.6 });
  }

  const urls: string[] = [];
  for (const e of entries) {
    const hasLocales = !NO_LOCALE_PAGES.has(e.path);
    urls.push(url(`${SITE}${e.path}`, e.lastmod, e.changefreq, e.priority));
    if (hasLocales) {
      const esPath = e.path === "/" ? "/es" : `/es${e.path}`;
      urls.push(url(`${SITE}${esPath}`, e.lastmod, e.changefreq, e.priority));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
