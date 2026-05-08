import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAllowedAppIds, getCmsAppId, setCmsAppId } from "./cms-app";
import { adminApi } from "./api";

type CategoryLabels = Record<string, string>;

interface CmsAppContextType {
  appId: string;
  setAppId: (id: string) => void;
  allowedAppIds: string[];
  categoryLabels: CategoryLabels | null;
}

const CmsAppContext = createContext<CmsAppContextType | null>(null);

export function CmsAppProvider({ children }: { children: ReactNode }) {
  const allowedAppIds = useMemo(() => getAllowedAppIds(), []);
  const [appId, setAppIdState] = useState(() => getCmsAppId());
  const [categoryLabels, setCategoryLabels] = useState<CategoryLabels | null>(null);

  const setAppId = useCallback((id: string) => {
    setCmsAppId(id);
    setAppIdState(getCmsAppId());
  }, []);

  useEffect(() => {
    setCategoryLabels(null);
    adminApi.getSettings().then((res) => {
      const raw = res.settings.category_labels;
      if (raw) {
        try { setCategoryLabels(JSON.parse(raw)); } catch {}
      }
    }).catch(() => {});
  }, [appId]);

  const value = useMemo(
    () => ({ appId, setAppId, allowedAppIds, categoryLabels }),
    [appId, setAppId, allowedAppIds, categoryLabels]
  );

  return (
    <CmsAppContext.Provider value={value}>{children}</CmsAppContext.Provider>
  );
}

export function useCmsApp() {
  const ctx = useContext(CmsAppContext);
  if (!ctx) throw new Error("useCmsApp must be used within CmsAppProvider");
  return ctx;
}
