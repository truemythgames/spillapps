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
          <h3 className="text-lg font-semibold mb-4">Version Control</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base"></span>
                <span className="font-semibold text-white">iOS</span>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Minimum Version</label>
                <input
                  value={settings.min_ios_version || ""}
                  onChange={(e) => update("min_ios_version", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                  placeholder="e.g. 1.0.3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => update("force_update_ios", "false")}
                  className={`flex-1 border rounded-lg px-3 py-2.5 text-center transition-all text-sm font-medium ${
                    settings.force_update_ios !== "true"
                      ? "border-primary bg-primary/10 text-white"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  Soft Update
                </button>
                <button
                  onClick={() => update("force_update_ios", "true")}
                  className={`flex-1 border rounded-lg px-3 py-2.5 text-center transition-all text-sm font-medium ${
                    settings.force_update_ios === "true"
                      ? "border-red-500 bg-red-500/10 text-white"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  Hard Update
                </button>
              </div>
            </div>
            <div className="border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base"></span>
                <span className="font-semibold text-white">Android</span>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Minimum Version</label>
                <input
                  value={settings.min_android_version || ""}
                  onChange={(e) => update("min_android_version", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                  placeholder="e.g. 1.0.3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => update("force_update_android", "false")}
                  className={`flex-1 border rounded-lg px-3 py-2.5 text-center transition-all text-sm font-medium ${
                    settings.force_update_android !== "true"
                      ? "border-primary bg-primary/10 text-white"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  Soft Update
                </button>
                <button
                  onClick={() => update("force_update_android", "true")}
                  className={`flex-1 border rounded-lg px-3 py-2.5 text-center transition-all text-sm font-medium ${
                    settings.force_update_android === "true"
                      ? "border-red-500 bg-red-500/10 text-white"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  Hard Update
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
