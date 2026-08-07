import type { APIRoute } from "astro";
import { getCatalog, coverUrl, hasCover } from "../lib/stories";

const SITE = "https://bibletea.app";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS feed for Bible Tea stories — backs PodcastSeries.webFeed schema. */
export const GET: APIRoute = async () => {
  const catalog = getCatalog();
  const now = new Date().toUTCString();

  const items = catalog
    .slice()
    .reverse()
    .slice(0, 50)
    .map((story) => {
      const link = `${SITE}/stories/${story.id}/`;
      const image = hasCover(story.id)
        ? `\n      <enclosure url="${escapeXml(coverUrl(story.id))}" length="0" type="image/webp" />`
        : "";
      return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(story.description)}</description>
      <category>${escapeXml(story.section)}</category>${image}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Bible Tea — Bible Storycast</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Every Bible story retold as immersive audio. From Genesis to Revelation.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <itunes:author>Bible Tea</itunes:author>
    <itunes:image href="${SITE}/icon.png" />
    <itunes:category text="Religion &amp; Spirituality" />
    <itunes:explicit>false</itunes:explicit>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
