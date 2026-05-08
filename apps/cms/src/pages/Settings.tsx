import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

export function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => setSettings(res.settings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">App Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Configure version requirements and feature flags</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-1">Version Control</h3>
          <p className="text-gray-500 text-sm mb-4">Users on versions below the minimum will see an update prompt.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Minimum App Version</label>
              <input
                value={settings.min_app_version || ""}
                onChange={(e) => update("min_app_version", e.target.value)}
                className="w-64 bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="e.g. 1.0.3"
              />
              <p className="text-[11px] text-gray-600 mt-1">Semver format. Users below this version see an update prompt.</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Update Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => update("force_update", "false")}
                  className={`flex-1 max-w-xs border rounded-xl p-4 text-left transition-all ${
                    settings.force_update !== "true"
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✕</span>
                    <span className="font-semibold text-sm text-white">Soft Update</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Users see a popup but can dismiss it with the X button and keep using the app.</p>
                </button>
                <button
                  onClick={() => update("force_update", "true")}
                  className={`flex-1 max-w-xs border rounded-xl p-4 text-left transition-all ${
                    settings.force_update === "true"
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔒</span>
                    <span className="font-semibold text-sm text-white">Hard Update</span>
                  </div>
                  <p className="text-[11px] text-gray-500">No X button. Users must update to continue using the app.</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-1">Maintenance</h3>
          <p className="text-gray-500 text-sm mb-4">Block all access with a maintenance screen.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => update("maintenance", settings.maintenance === "true" ? "false" : "true")}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.maintenance === "true" ? "bg-red-500" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.maintenance === "true" ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">
              {settings.maintenance === "true" ? "App is in maintenance mode" : "App is live"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
