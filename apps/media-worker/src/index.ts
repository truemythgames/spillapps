interface Env {
  MEDIA: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const cache = (caches as any).default as Cache;
    const cacheUrl = new URL(url.toString());
    cacheUrl.search = "";
    const cacheKey = new Request(cacheUrl.toString());

    // Allow cache refresh via ?purge=1 — deletes old cache, fetches fresh from R2
    const shouldPurge = url.searchParams.has("purge");

    if (!shouldPurge) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } else {
      await cache.delete(cacheKey);
    }

    // Fetch from R2
    const object = await env.MEDIA.get(key);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || getMimeType(key));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.etag);
    if (object.size != null) headers.set("Content-Length", String(object.size));
    if (object.uploaded) headers.set("Last-Modified", object.uploaded.toUTCString());
    headers.set("Access-Control-Allow-Origin", "*");

    const response = new Response(object.body, { status: 200, headers });

    // Store fresh version in edge cache
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
} satisfies ExportedHandler<Env>;

function getMimeType(key: string): string {
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".m4a")) return "audio/mp4";
  return "application/octet-stream";
}
