import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { getCmsApiBaseUrl } from "../lib/api";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-surface border border-white/5 rounded-2xl p-10 w-full max-w-sm text-center">
        <h1 className="text-primary font-bold text-2xl mb-1">Spill</h1>
        <p className="text-gray-400 text-sm mb-8">Admin — sign in with Google</p>

        {!CLIENT_ID ? (
          <p className="text-amber-400 text-sm">
            Set VITE_GOOGLE_CLIENT_ID in <code className="text-white/80">apps/cms/.env</code>
          </p>
        ) : (
          <GoogleSignInButton
            clientId={CLIENT_ID}
            onCredential={async (credential) => {
              setError(null);
              const result = await login(credential);
              if (!result.ok) {
                if (result.reason === "email") {
                  setError(
                    "This Google account isn’t on the allowlist. Set VITE_ALLOWED_EMAIL in apps/cms/.env to your exact email, or remove that line to allow any account (dev only)."
                  );
                } else if (result.reason === "api") {
                  const base = getCmsApiBaseUrl();
                  const hint =
                    result.detail?.includes("Failed to fetch") ||
                    result.detail?.includes("NetworkError")
                      ? ` No response from ${base} — run the API (wrangler dev) or set VITE_API_BASE_URL in apps/cms/.env (e.g. https://api.spillapps.com). Add your CMS origin to Worker CORS_ALLOWED_ORIGINS.`
                      : "";
                  setError(
                    `API: ${result.detail ?? "unknown error"} (calling ${base})${hint}`
                  );
                } else {
                  setError("Session from the server was invalid. Try again.");
                }
                return;
              }
              navigate("/select-app", { replace: true });
            }}
            onError={() => setError("Sign-in failed. Try again.")}
          />
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
