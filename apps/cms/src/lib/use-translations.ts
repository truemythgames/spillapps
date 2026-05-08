import { useEffect, useState, useCallback } from "react";
import { adminApi } from "./api";
import { useLocale, type CmsLocale } from "./locale-context";

export interface TranslationMap {
  [entityId: string]: Record<string, string>;
}

export function useTranslations(entityType: string) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<TranslationMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (locale === "en") {
      setTranslations({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    adminApi
      .getTranslations(entityType, locale)
      .then((res) => {
        if (cancelled) return;
        const map: TranslationMap = {};
        for (const row of res.translations) {
          if (!map[row.entity_id]) map[row.entity_id] = {};
          map[row.entity_id][row.field] = row.value;
        }
        setTranslations(map);
      })
      .catch(() => { if (!cancelled) setTranslations({}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entityType, locale]);

  const saveTranslation = useCallback(
    async (entityId: string, fields: Record<string, string>) => {
      if (locale === "en") return;
      setSaving(true);
      try {
        await adminApi.saveTranslation({
          entity_type: entityType,
          entity_id: entityId,
          locale,
          translations: fields,
        });
        setTranslations((prev) => ({
          ...prev,
          [entityId]: { ...prev[entityId], ...fields },
        }));
      } finally {
        setSaving(false);
      }
    },
    [entityType, locale]
  );

  const getTranslated = useCallback(
    (entityId: string, field: string, fallback: string): string => {
      if (locale === "en") return fallback;
      return translations[entityId]?.[field] ?? fallback;
    },
    [locale, translations]
  );

  const hasTranslation = useCallback(
    (entityId: string, field: string): boolean => {
      return !!translations[entityId]?.[field];
    },
    [translations]
  );

  return {
    locale,
    translations,
    loading,
    saving,
    saveTranslation,
    getTranslated,
    hasTranslation,
    isTranslating: locale !== "en",
  };
}

export function translatedFields(entityType: string): string[] {
  switch (entityType) {
    case "story":
      return ["title", "description", "transcript"];
    case "season":
      return ["name", "description"];
    case "character":
      return ["name", "description", "overview"];
    case "playlist":
      return ["name", "description"];
    default:
      return ["name", "description"];
  }
}
