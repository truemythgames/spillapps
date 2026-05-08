import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";
import { useTranslations } from "../lib/use-translations";
import { InlineEditor } from "../components/InlineEditor";

export function Playlists() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", playlist_type: "curated", is_featured: false });
  const [adding, setAdding] = useState(false);

  const { locale, translations, loading: tLoading, saving: tSaving, saveTranslation, getTranslated, hasTranslation, isTranslating } =
    useTranslations("playlist");

  function loadPlaylists() {
    adminApi.getPlaylists().then((res) => setPlaylists(res.playlists));
  }

  useEffect(() => { loadPlaylists(); }, []);

  async function handleSave(playlistId: string, fields: Record<string, string>) {
    if (isTranslating) {
      await saveTranslation(playlistId, fields);
    } else {
      setSaving(true);
      try {
        await adminApi.updatePlaylist(playlistId, fields);
        setPlaylists((prev) =>
          prev.map((p) => (p.id === playlistId ? { ...p, ...fields } : p))
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
    setAdding(true);
    try {
      await adminApi.createPlaylist(addForm);
      setShowAdd(false);
      setAddForm({ name: "", description: "", playlist_type: "curated", is_featured: false });
      loadPlaylists();
    } finally {
      setAdding(false);
    }
  }

  const untranslatedCount = isTranslating
    ? playlists.filter((p) => !hasTranslation(p.id, "name")).length
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Playlists</h2>
          <p className="text-gray-500 text-sm mt-1">
            {playlists.length} total
            {isTranslating && !tLoading && (
              <span className="ml-2">
                · <span className="text-green-400">{playlists.length - untranslatedCount}</span> translated ·{" "}
                <span className="text-orange-400">{untranslatedCount}</span> missing
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Playlist
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Playlist</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Playlist name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={addForm.playlist_type}
                onChange={(e) => setAddForm({ ...addForm, playlist_type: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
              >
                <option value="curated">Curated</option>
                <option value="generated">Generated</option>
                <option value="editorial">Editorial</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                rows={2}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Playlist description"
              />
            </div>
            <div className="col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.is_featured}
                  onChange={(e) => setAddForm({ ...addForm, is_featured: e.target.checked })}
                  className="rounded"
                />
                Featured
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {adding ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-2 gap-4">
        {playlists.map((playlist) => {
          const displayName = getTranslated(playlist.id, "name", playlist.name);
          const displayDesc = getTranslated(playlist.id, "description", playlist.description || "");
          const isEditing = editingId === playlist.id;

          return (
            <div key={playlist.id} className="bg-surface border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                {isTranslating && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasTranslation(playlist.id, "name")
                        ? "bg-green-500/15 text-green-400"
                        : "bg-orange-500/15 text-orange-400"
                    }`}
                  >
                    {locale.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">{displayDesc}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                  {playlist.playlist_type}
                </span>
                {playlist.is_featured && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={() => setEditingId(isEditing ? null : playlist.id)}
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
                        value: isTranslating ? (translations[playlist.id]?.name ?? "") : playlist.name,
                      },
                      {
                        key: "description",
                        label: "Description",
                        value: isTranslating ? (translations[playlist.id]?.description ?? "") : (playlist.description || ""),
                        multiline: true,
                      },
                    ]}
                    saving={saving || tSaving}
                    onSave={(fields) => handleSave(playlist.id, fields)}
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
