import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";
import { useTranslations } from "../lib/use-translations";
import { InlineEditor } from "../components/InlineEditor";

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function Seasons() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", slug: "", testament: "old", description: "" });
  const [adding, setAdding] = useState(false);

  const { locale, translations, loading: tLoading, saving: tSaving, saveTranslation, getTranslated, hasTranslation, isTranslating } =
    useTranslations("season");

  function loadSeasons() {
    adminApi.getSeasons().then((res) => setSeasons(res.seasons));
  }

  useEffect(() => { loadSeasons(); }, []);

  async function handleSave(seasonId: string, fields: Record<string, string>) {
    if (isTranslating) {
      await saveTranslation(seasonId, fields);
    } else {
      setSaving(true);
      try {
        await adminApi.updateSeason(seasonId, fields);
        setSeasons((prev) =>
          prev.map((s) => (s.id === seasonId ? { ...s, ...fields } : s))
        );
      } finally {
        setSaving(false);
      }
    }
    setEditingId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    addForm.slug = toSlug(addForm.name);
    setAdding(true);
    try {
      await adminApi.createSeason(addForm);
      setShowAdd(false);
      setAddForm({ name: "", slug: "", testament: "old", description: "" });
      loadSeasons();
    } finally {
      setAdding(false);
    }
  }

  const oldCount = seasons.filter((s) => s.testament === "old").length;
  const newCount = seasons.filter((s) => s.testament === "new").length;
  const untranslatedCount = isTranslating
    ? seasons.filter((s) => !hasTranslation(s.id, "name")).length
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Seasons (Books)</h2>
          <p className="text-gray-500 text-sm mt-1">
            {seasons.length} total · {oldCount} Old Testament · {newCount} New Testament
            {isTranslating && !tLoading && (
              <span className="ml-2">
                · <span className="text-green-400">{seasons.length - untranslatedCount}</span> translated ·{" "}
                <span className="text-orange-400">{untranslatedCount}</span> missing
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Season
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Season</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value, slug: toSlug(e.target.value) })}
                required
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Season name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Testament</label>
              <select
                value={addForm.testament}
                onChange={(e) => setAddForm({ ...addForm, testament: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
              >
                <option value="old">Old Testament</option>
                <option value="new">New Testament</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                rows={2}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Season description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {adding ? "Creating..." : "Create Season"}
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-2 gap-4">
        {seasons.map((season) => {
          const displayName = getTranslated(season.id, "name", season.name);
          const displayDesc = getTranslated(season.id, "description", season.description || "");
          const isEditing = editingId === season.id;

          return (
            <div key={season.id} className="bg-surface border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    season.testament === "old"
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {season.testament === "old" ? "OLD" : "NEW"}
                </span>
                {isTranslating && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasTranslation(season.id, "name")
                        ? "bg-green-500/15 text-green-400"
                        : "bg-orange-500/15 text-orange-400"
                    }`}
                  >
                    {locale.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <p className="text-gray-500 text-sm mt-1">{displayDesc}</p>

              <button
                onClick={() => setEditingId(isEditing ? null : season.id)}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {isEditing ? "Close" : "Edit"}
              </button>

              {isEditing && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <InlineEditor
                    fields={[
                      {
                        key: "name",
                        label: "Name",
                        value: isTranslating ? (translations[season.id]?.name ?? "") : season.name,
                      },
                      {
                        key: "description",
                        label: "Description",
                        value: isTranslating ? (translations[season.id]?.description ?? "") : (season.description || ""),
                        multiline: true,
                      },
                    ]}
                    saving={saving || tSaving}
                    onSave={(fields) => handleSave(season.id, fields)}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
