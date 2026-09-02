interface Env {
  MEDIA: R2Bucket;
  IMAGES?: {
    input(stream: ReadableStream | ArrayBuffer): {
      transform(opts: { width?: number; height?: number; fit?: string }): {
        output(opts: { format?: string; quality?: number }): Promise<{ response(): Response } | { response(): Response }>;
      };
    };
  };
}

const MAX_AGE = "public, max-age=31536000, immutable";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const width = parseDim(url.searchParams.get("w"));
    const quality = clamp(Number(url.searchParams.get("q") || 72), 40, 90);
    const canResize = !!width && isImageKey(key);

    const cache = (caches as any).default as Cache;
    const cacheUrl = new URL(url.toString());
    if (!canResize) cacheUrl.search = "";
    else {
      cacheUrl.search = "";
      cacheUrl.searchParams.set("w", String(width));
      cacheUrl.searchParams.set("q", String(quality));
      cacheUrl.searchParams.set("v", "2");
    }
    const cacheKey = new Request(cacheUrl.toString());

    const shouldPurge = url.searchParams.has("purge");

    if (!shouldPurge) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } else {
      await cache.delete(cacheKey);
    }

    const object = await env.MEDIA.get(key);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    if (canResize && env.IMAGES && object.body) {
      try {
        const transformed = await env.IMAGES.input(object.body)
          .transform({ width: width!, fit: "scale-down" })
          .output({ format: "image/webp", quality });
        const resized = transformed.response();
        const headers = new Headers(resized.headers);
        headers.set("Cache-Control", MAX_AGE);
        headers.set("Access-Control-Allow-Origin", "*");
        const response = new Response(resized.body, { status: 200, headers });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      } catch (e) {
        console.warn("[media] resize failed, serving original", e);
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || getMimeType(key));
    headers.set("Cache-Control", MAX_AGE);
    headers.set("ETag", object.etag);
    if (object.size != null) headers.set("Content-Length", String(object.size));
    if (object.uploaded) headers.set("Last-Modified", object.uploaded.toUTCString());
    headers.set("Access-Control-Allow-Origin", "*");

    const response = new Response(object.body, { status: 200, headers });
    // Never store the original under a resized cache key — that would pin the
    // full-size file to ?w= for a year if Images is missing or fails.
    if (!canResize) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  },
} satisfies ExportedHandler<Env>;

function parseDim(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(1024, Math.max(80, Math.round(n)));
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isImageKey(key: string) {
  return /\.(webp|png|jpe?g)$/i.test(key);
}

function getMimeType(key: string): string {
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".m4a")) return "audio/mp4";
  return "application/octet-stream";
}
