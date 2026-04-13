import type { APIRoute } from "astro";
import { getCatalog, getPlaylists, getSeasons, getCharacters } from "../lib/stories";

const SITE = "https://bibletea.app";

export const GET: APIRoute = async () => {
  const catalog = getCatalog();
  const [playlists, seasons, characters] = await Promise.all([
    getPlaylists(catalog),
    getSeasons(),
    getCharacters(),
  ]);

  const urls: string[] = [
    SITE + "/",
    SITE + "/stories",
    SITE + "/playlists",
    SITE + "/characters",
    SITE + "/books",
    SITE + "/privacy",
    SITE + "/terms",
  ];

  for (const story of catalog) {
    urls.push(`${SITE}/stories/${story.id}`);
  }

  for (const pl of playlists) {
    urls.push(`${SITE}/playlists/${pl.id}`);
  }

  for (const ch of characters) {
    urls.push(`${SITE}/characters/${ch.id}`);
  }

  for (const season of seasons) {
    urls.push(`${SITE}/books/${season.slug}`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
