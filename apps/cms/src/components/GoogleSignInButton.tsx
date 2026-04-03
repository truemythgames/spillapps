import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("GSI script")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GSI script"));
    document.head.appendChild(script);
  });
}

type Props = {
  clientId: string;
  onCredential: (credential: string) => void;
  onError?: () => void;
};

export function GoogleSignInButton({ clientId, onCredential, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredRef = useRef(onCredential);
  const onErrRef = useRef(onError);
  onCredRef.current = onCredential;
  onErrRef.current = onError;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        const el = containerRef.current;
        const id = window.google?.accounts?.id;
        if (!el || !id) {
          onErrRef.current?.();
          return;
        }

        id.initialize({
          client_id: clientId,
          callback: (res) => {
            if (res.credential) onCredRef.current(res.credential);
            else onErrRef.current?.();
          },
        });

        el.innerHTML = "";
        id.renderButton(el, {
          theme: "filled_black",
          size: "large",
          width: 280,
          type: "standard",
        });
      })
      .catch(() => onErrRef.current?.());

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[48px] items-center justify-center"
    />
  );
}
