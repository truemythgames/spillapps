#!/usr/bin/env npx tsx
/**
 * Submit bibletea.app URLs to IndexNow (Bing, Yandex, etc.).
 * Key file must be live at https://bibletea.app/{key}.txt
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const HOST = "bibletea.app";
const SITE = `https://${HOST}`;
const ROOT = join(import.meta.dirname, "..");
const PUBLIC = join(ROOT, "public");

function findKey(): string {
  const envKey = process.env.INDEXNOW_KEY?.trim();
  if (envKey) return envKey;
  const marker = join(ROOT, ".indexnow-key");
  if (existsSync(marker)) return readFileSync(marker, "utf8").trim();
  // Fall back to scanning public/*.txt that look like UUIDs
  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  for (const name of readdirSync(PUBLIC)) {
    if (/^[0-9a-f-]{36}\.txt$/i.test(name)) {
      return name.replace(/\.txt$/i, "");
    }
  }
  throw new Error("No IndexNow key found. Set INDEXNOW_KEY or create public/{uuid}.txt");
}

async function main() {
  const key = findKey();
  const keyLocation = `${SITE}/${key}.txt`;

  // Pull live sitemap so we submit exactly what's deployed
  const sitemapRes = await fetch(`${SITE}/sitemap.xml`);
  if (!sitemapRes.ok) throw new Error(`Failed to fetch sitemap: ${sitemapRes.status}`);
  const xml = await sitemapRes.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) throw new Error("No URLs found in sitemap");

  // IndexNow accepts max 10,000 URLs per request
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += 10000) {
    batches.push(urls.slice(i, i + 10000));
  }

  console.log(`IndexNow: submitting ${urls.length} URLs in ${batches.length} batch(es)…`);

  for (const [i, urlList] of batches.entries()) {
    const body = {
      host: HOST,
      key,
      keyLocation,
      urlList,
    };
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(`Batch ${i + 1}: HTTP ${res.status} ${text || "(ok)"}`);
    if (![200, 202].includes(res.status)) {
      throw new Error(`IndexNow rejected batch ${i + 1}: ${res.status} ${text}`);
    }
  }

  console.log("IndexNow submission complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
