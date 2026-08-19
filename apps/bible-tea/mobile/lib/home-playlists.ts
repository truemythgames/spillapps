import type { Playlist, StoryWithCover } from "@/stores/app";

const DAILY_COUNT = 12;

function hashDay(seed: number) {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const next = hashDay(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function utcDayIndex(now = Date.now()) {
  return Math.floor(now / 86400000);
}

function storyKey(story: StoryWithCover) {
  return story.apiId || story.id;
}

/** Fresh 12-story mix. Same set for every user on the same UTC day. */
export function everydayWordPlaylist(
  stories: StoryWithCover[],
  name: string,
  now = Date.now()
): Playlist | null {
  if (stories.length === 0) return null;
  const day = utcDayIndex(now);
  return {
    id: `everyday-word-${day}`,
    name,
    stories: seededShuffle(stories, day).slice(0, Math.min(DAILY_COUNT, stories.length)),
  };
}

/** Everyday Word first. Other rows never repeat those cards, or each other. */
export function homePlaylistRows(
  playlists: Playlist[],
  everyday: Playlist | null
): Playlist[] {
  const used = new Set<string>();
  if (everyday) {
    for (const s of everyday.stories) used.add(storyKey(s));
  }

  const rest: Playlist[] = [];
  const seenPlaylist = new Set<string>();
  for (const p of playlists) {
    if (!p.stories.length || p.id === everyday?.id || seenPlaylist.has(p.id)) continue;
    seenPlaylist.add(p.id);
    const unique = p.stories.filter((s) => {
      const key = storyKey(s);
      if (used.has(key)) return false;
      used.add(key);
      return true;
    });
    if (unique.length) rest.push({ ...p, stories: unique });
  }

  return [...(everyday ? [everyday] : []), ...rest];
}
