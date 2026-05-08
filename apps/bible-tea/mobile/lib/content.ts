import Constants from "expo-constants";
import { Platform, NativeModules } from "react-native";
import catalog from "../../content/story-catalog.json";
import characterCatalog from "../../content/character-catalog.json";

const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
const devHost = debuggerHost?.split(":")[0] ?? "localhost";

const extra = Constants.expoConfig?.extra as { mediaBase?: string; appId?: string } | undefined;
const MEDIA_BASE = extra?.mediaBase?.replace(/\/$/, "") || "https://media.spillapps.com";
const APP_ID = extra?.appId || "bible-tea";

const CONTENT_SERVER = __DEV__
  ? `http://${devHost}:3456`
  : `${MEDIA_BASE}/${APP_ID}`;

function getDeviceLang(): string {
  try {
    if (Platform.OS === "ios") {
      const settings = NativeModules.SettingsManager?.settings;
      const langs: string[] | undefined =
        settings?.AppleLanguages ?? settings?.AppleLocale;
      if (Array.isArray(langs) && langs.length > 0) {
        return langs[0].split("-")[0];
      }
    } else if (Platform.OS === "android") {
      const locale = NativeModules.I18nManager?.localeIdentifier;
      if (locale) return locale.split("_")[0];
    }
  } catch {}
  return "en";
}

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
  const lang = getDeviceLang();
  if (lang !== "en") {
    return storyContentUrl(storyId, `transcript.${lang}.md`);
  }
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
