import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform, NativeModules } from "react-native";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

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

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: getDeviceLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
