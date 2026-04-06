import Constants from "expo-constants";
import catalog from "../../content/story-catalog.json";
import characterCatalog from "../../content/character-catalog.json";

const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
const devHost = debuggerHost?.split(":")[0] ?? "localhost";
const CONTENT_SERVER = `http://${devHost}:3456`;

export interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  testament?: string;
  order?: number;
  inSeed?: boolean;
  seedId?: string | null;
}

export interface Speaker {
  key: string;
  name: string;
  audioUrl: string;
}

const SPEAKER_META: Record<string, string> = {
  grace: "Grace",
  maya: "Maya",
  jordan: "Jordan",
};

export function getAllStories(): CatalogStory[] {
  return catalog as CatalogStory[];
}

export function getSeedStories(): CatalogStory[] {
  return (catalog as CatalogStory[]).filter((s) => s.inSeed);
}

export function getStoryById(id: string): CatalogStory | undefined {
  return (catalog as CatalogStory[]).find((s) => s.id === id);
}

export function storyContentUrl(storyId: string, file: string): string {
  return `${CONTENT_SERVER}/stories/${storyId}/${file}`;
}

export function coverUrl(storyId: string): string {
  return storyContentUrl(storyId, "cover.webp");
}

export function transcriptUrl(storyId: string): string {
  return storyContentUrl(storyId, "transcript.md");
}

export interface CharacterInfo {
  id: string;
  name: string;
  subtitle: string;
  overview: string;
  storyIds: string[];
}

export function getAllCharacters(): CharacterInfo[] {
  return characterCatalog as CharacterInfo[];
}

export function getCharacterById(id: string): CharacterInfo | undefined {
  return (characterCatalog as CharacterInfo[]).find((c) => c.id === id);
}

export function characterImageUrl(charId: string): string {
  return `${CONTENT_SERVER}/characters/${charId}.webp`;
}

export function speakersForStory(storyId: string): Speaker[] {
  return Object.entries(SPEAKER_META).map(([key, name]) => ({
    key,
    name,
    audioUrl: storyContentUrl(storyId, `narration-${key}.mp3`),
  }));
}
