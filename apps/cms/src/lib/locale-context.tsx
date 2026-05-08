import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "cms_locale";
const SUPPORTED_LOCALES = ["en", "es"] as const;
export type CmsLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABELS: Record<CmsLocale, string> = {
  en: "English",
  es: "Español",
};

function readStored(): CmsLocale {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v && SUPPORTED_LOCALES.includes(v as CmsLocale)) return v as CmsLocale;
  return "en";
}

interface LocaleContextType {
  locale: CmsLocale;
  setLocale: (l: CmsLocale) => void;
  locales: readonly CmsLocale[];
  localeLabel: (l: CmsLocale) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<CmsLocale>(readStored);

  const setLocale = useCallback((l: CmsLocale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      locales: SUPPORTED_LOCALES,
      localeLabel: (l: CmsLocale) => LOCALE_LABELS[l] ?? l,
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
