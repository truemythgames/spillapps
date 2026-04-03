import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";
import { coverUrl, getCatalog, type CatalogStory } from "../lib/content";

interface CharacterForm {
  id: string;
  name: string;
  description: string;
  cover_image_key: string;
  sort_order: number;
  story_ids: string[];
}

const EMPTY_FORM: CharacterForm = {
  id: "",
  name: "",
  description: "",
  cover_image_key: "",
  sort_order: 0,
  story_ids: [],
};

export function Characters() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<CatalogStory[]>([]);
  const [editing, setEditing] = useState<CharacterForm | null>(null);
  const [storySearch, setStorySearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    getCatalog().then(setCatalog).catch(() => {});
  }, []);

  async function load() {
    try {
      const res = await adminApi.getCharacters();
      setCharacters(res.characters);
    } catch {
      setCharacters([]);
    }
  }

  function startCreate() {
    setEditing({ ...EMPTY_FORM });
    setStorySearch("");
  }

  function startEdit(ch: any) {
    setEditing({
      id: ch.id,
      name: ch.name,
      description: ch.description || "",
      cover_image_key: ch.cover_image_key || "",
      sort_order: ch.sort_order || 0,
      story_ids: (ch.stories || []).map((s: any) => s.id),
    });
    setStorySearch("");
  }

  async function save() {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await adminApi.updateCharacter(editing.id, editing);
      } else {
        await adminApi.createCharacter(editing);
      }
      setEditing(null);
      await load();
    } catch (err) {
      alert("Failed to save: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this character?")) return;
    try {
      await adminApi.deleteCharacter(id);
      await load();
    } catch (err) {
      alert("Failed to delete: " + (err as Error).message);
    }
  }

  function toggleStory(storyId: string) {
    if (!editing) return;
    const has = editing.story_ids.includes(storyId);
    setEditing({
      ...editing,
      story_ids: has
        ? editing.story_ids.filter((id) => id !== storyId)
        : [...editing.story_ids, storyId],
    });
  }

  const filteredCatalog = storySearch.trim()
    ? catalog.filter(
        (s) =>
          s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
          s.id.toLowerCase().includes(storySearch.toLowerCase())
      )
    : catalog.slice(0, 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Characters</h2>
        <button
          onClick={startCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Character
        </button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">
              {editing.id ? "Edit Character" : "New Character"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. Moses"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. Deliverer of Israel"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Stories ({editing.story_ids.length} selected)
                </label>

                {editing.story_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {editing.story_ids.map((sid) => {
                      const story = catalog.find((s) => s.id === sid);
                      return (
                        <span
                          key={sid}
                          className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-primary/25"
                          onClick={() => toggleStory(sid)}
                        >
                          {story?.title || sid}
                          <span className="text-primary/60">×</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary mb-2"
                  placeholder="Search stories to add..."
                />
                <div className="max-h-48 overflow-y-auto space-y-1 border border-white/5 rounded-lg p-2">
                  {filteredCatalog.map((story) => {
                    const selected = editing.story_ids.includes(story.id);
                    return (
                      <button
                        key={story.id}
                        onClick={() => toggleStory(story.id)}
                        className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                          selected
                            ? "bg-primary/15 text-primary"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <img
                          src={coverUrl(story.id)}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <span className="truncate">{story.title}</span>
                        {selected && <span className="ml-auto text-primary">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !editing.name.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character list */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((ch) => (
          <div
            key={ch.id}
            className="bg-surface border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              {ch.stories?.[0]?.id ? (
                <img
                  src={coverUrl(ch.stories[0].id)}
                  alt={ch.name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{ch.name}</h3>
                <p className="text-gray-500 text-sm mt-0.5 truncate">{ch.description}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {ch.stories?.length || 0} stories · order {ch.sort_order}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => startEdit(ch)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => remove(ch.id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {characters.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No characters yet. Click "Add Character" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
