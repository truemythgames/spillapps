import { useState, useEffect } from "react";

interface Field {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

interface Props {
  fields: Field[];
  saving: boolean;
  onSave: (fields: Record<string, string>) => Promise<void>;
  onClose: () => void;
}

export function InlineEditor({ fields, saving, onSave, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = f.value;
    setValues(init);
    setDirty(false);
  }, [fields]);

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  }

  async function handleSave() {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) out[k] = v.trim();
    }
    if (Object.keys(out).length === 0) return;
    await onSave(out);
    setDirty(false);
  }

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            {f.label}
          </label>
          {f.multiline ? (
            <textarea
              value={values[f.key] ?? ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary resize-y"
            />
          ) : (
            <input
              type="text"
              value={values[f.key] ?? ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-primary text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
