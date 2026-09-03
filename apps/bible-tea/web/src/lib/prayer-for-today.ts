import type { Locale } from "./i18n";
import { dayOfYear } from "./daily-verses";
import { getPrayerDetail, getPrayers, type PrayerDetail } from "./stories";

const MORNING_SLUGS = [
  "new-day",
  "surrender-day",
  "focus-and-clarity",
  "gods-presence-today",
  "purpose-today",
  "morning-gratitude",
];

export async function getPrayerForToday(
  date: Date = new Date(),
  locale: Locale = "en",
): Promise<PrayerDetail | null> {
  const prayers = await getPrayers(locale);
  const pool = prayers.filter(
    (p) => MORNING_SLUGS.includes(p.slug) || p.category_slug === "morning",
  );
  const use = pool.length > 0 ? pool : prayers;
  if (use.length === 0) return null;
  const pick = use[dayOfYear(date) % use.length];
  return getPrayerDetail(pick.slug, locale);
}
