import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform, NativeModules, Settings } from "react-native";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

const SUPPORTED = ["en", "es"];

function getDeviceLang(): string {
  try {
    if (Platform.OS === "ios") {
      const settings = NativeModules.SettingsManager?.settings;
      const langs: string[] | undefined =
        settings?.AppleLanguages ?? settings?.AppleLocale;
      if (Array.isArray(langs) && langs.length > 0) {
        const lang = langs[0].split("-")[0];
        if (SUPPORTED.includes(lang)) return lang;
      }
      const fromSettings = Settings.get("AppleLanguages");
      if (Array.isArray(fromSettings) && fromSettings.length > 0) {
        const lang = fromSettings[0].split("-")[0];
        if (SUPPORTED.includes(lang)) return lang;
      }
    } else if (Platform.OS === "android") {
      const locale = NativeModules.I18nManager?.localeIdentifier;
      if (locale) {
        const lang = locale.split("_")[0];
        if (SUPPORTED.includes(lang)) return lang;
      }
    }
  } catch {}

  try {
    const intlLang = Intl.DateTimeFormat().resolvedOptions().locale?.split("-")[0];
    if (intlLang && SUPPORTED.includes(intlLang)) return intlLang;
  } catch {}

  return "en";
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: getDeviceLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
