import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCmsApp } from "../lib/cms-app-context";
import { markCmsAppGateComplete } from "../lib/cms-app";

/**
 * Always shown after Google sign-in. Pick which product (app_id) this session manages, then enter CMS.
 */
export function SelectApp() {
  const navigate = useNavigate();
  const { appId, setAppId, allowedAppIds } = useCmsApp();
  const [choice, setChoice] = useState(appId);

  function onContinue(e: FormEvent) {
    e.preventDefault();
    setAppId(choice);
    markCmsAppGateComplete();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-8">
        <h1 className="text-primary font-bold text-2xl text-center mb-1">Spill</h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Choose which product to open in the CMS
        </p>

        <form onSubmit={onContinue} className="space-y-4">
          <div className="space-y-2">
            {allowedAppIds.map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  choice === id
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="app"
                  value={id}
                  checked={choice === id}
                  onChange={() => setChoice(id)}
                  className="text-primary"
                />
                <span className="font-mono text-sm text-white/90">{id}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:opacity-95"
          >
            Open CMS
          </button>
        </form>
      </div>
    </div>
  );
}
