#!/usr/bin/env npx tsx
/**
 * Submit bibletea.app URLs to IndexNow (Bing, Yandex, etc.).
 * Key file must be live at https://bibletea.app/{key}.txt
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "bibletea.app";
const SITE = `https://${HOST}`;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

function findKey(): string {
  const envKey = process.env.INDEXNOW_KEY?.trim();
  if (envKey) return envKey;
  const marker = join(ROOT, ".indexnow-key");
  if (existsSync(marker)) return readFileSync(marker, "utf8").trim();
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

  const sitemapRes = await fetch(`${SITE}/sitemap.xml`);
  if (!sitemapRes.ok) throw new Error(`Failed to fetch sitemap: ${sitemapRes.status}`);
  const xml = await sitemapRes.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) throw new Error("No URLs found in sitemap");

  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += 10000) {
    batches.push(urls.slice(i, i + 10000));
  }

  console.log(`IndexNow: submitting ${urls.length} URLs in ${batches.length} batch(es)…`);

  for (const [i, urlList] of batches.entries()) {
    const body = { host: HOST, key, keyLocation, urlList };
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
