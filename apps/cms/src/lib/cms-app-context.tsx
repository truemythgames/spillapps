import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAllowedAppIds, getCmsAppId, setCmsAppId } from "./cms-app";

interface CmsAppContextType {
  appId: string;
  setAppId: (id: string) => void;
  allowedAppIds: string[];
}

const CmsAppContext = createContext<CmsAppContextType | null>(null);

export function CmsAppProvider({ children }: { children: ReactNode }) {
  const allowedAppIds = useMemo(() => getAllowedAppIds(), []);
  const [appId, setAppIdState] = useState(() => getCmsAppId());

  const setAppId = useCallback((id: string) => {
    setCmsAppId(id);
    setAppIdState(getCmsAppId());
  }, []);

  const value = useMemo(
    () => ({ appId, setAppId, allowedAppIds }),
    [appId, setAppId, allowedAppIds]
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
