import * as Linking from "expo-linking";

/** Parse bibletea:// widget / deep links into a story id. */
export function storyIdFromUrl(url: string): string | null {
  try {
    // Raw fallbacks first — Linking.parse is inconsistent across URL shapes
    const raw =
      url.match(/bibletea:\/\/\/?story\/([^/?#]+)/i) ||
      url.match(/[?&]storyId=([^&#]+)/i);
    if (raw?.[1]) return decodeURIComponent(raw[1]);

    const parsed = Linking.parse(url);
    const path = (parsed.path || "").replace(/^\//, "");
    const pathMatch = path.match(/^story\/([^/?#]+)/);
    if (pathMatch?.[1]) return decodeURIComponent(pathMatch[1]);

    if (parsed.hostname === "story") {
      const id = (parsed.path || "").replace(/^\//, "").split("/")[0];
      if (id) return decodeURIComponent(id);
    }
  } catch {}
  return null;
}
