/**
 * Set Cache-Control metadata on all objects in the spill-media R2 bucket.
 * After running, R2 public access will serve the header and Cloudflare
 * will cache images at the edge.
 *
 * Run: npx wrangler r2 object list spill-media --prefix bible-tea/ | ...
 * OR use this script with wrangler dev locally bound to the bucket.
 *
 * Usage: npx tsx scripts/r2-set-cache-headers.ts
 * Requires: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "c34e072d06363120d0fedf55fc673661";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BUCKET_NAME = "spill-media";

if (!API_TOKEN) {
  console.error("Set CLOUDFLARE_API_TOKEN env var (needs R2 read/write)");
  process.exit(1);
}

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}`;

interface R2Object {
  key: string;
  size: number;
}

async function listObjects(prefix: string, cursor?: string): Promise<{ objects: R2Object[]; cursor?: string }> {
  const params = new URLSearchParams({ prefix, per_page: "500" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${BASE}/objects?${params}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const data = await res.json() as any;
  if (!data.success) throw new Error(JSON.stringify(data.errors));
  return {
    objects: data.result.objects || [],
    cursor: data.result.truncated ? data.result.cursor : undefined,
  };
}

async function copyWithHeaders(key: string) {
  // R2 API: copy object onto itself with new httpMetadata
  const res = await fetch(`${BASE}/objects/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "cf-copy-destination-if-none-match": "*",
      "cf-copy-source": key,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });

  if (!res.ok) {
    // Fallback: download and re-upload with metadata
    const getRes = await fetch(`${BASE}/objects/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    if (!getRes.ok) {
      console.error(`  SKIP ${key}: GET failed ${getRes.status}`);
      return false;
    }
    const body = await getRes.arrayBuffer();
    const contentType = getRes.headers.get("content-type") || "application/octet-stream";

    const putRes = await fetch(`${BASE}/objects/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body,
    });
    if (!putRes.ok) {
      console.error(`  SKIP ${key}: PUT failed ${putRes.status}`);
      return false;
    }
  }
  return true;
}

async function main() {
  const prefixes = ["bible-tea/", "history-tea/"];
  let total = 0;
  let updated = 0;

  for (const prefix of prefixes) {
    console.log(`\nProcessing prefix: ${prefix}`);
    let cursor: string | undefined;

    do {
      const { objects, cursor: next } = await listObjects(prefix, cursor);
      cursor = next;

      for (const obj of objects) {
        if (!obj.key.match(/\.(webp|png|jpg|jpeg|mp3|m4a)$/i)) continue;
        total++;
        const ok = await copyWithHeaders(obj.key);
        if (ok) {
          updated++;
          if (updated % 50 === 0) console.log(`  Updated ${updated} objects...`);
        }
      }
    } while (cursor);
  }

  console.log(`\nDone: ${updated}/${total} objects updated with Cache-Control headers.`);
}

main().catch(console.error);
