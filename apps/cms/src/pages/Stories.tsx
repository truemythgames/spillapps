import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/api";
import { useTranslations } from "../lib/use-translations";
import { InlineEditor } from "../components/InlineEditor";

type Filter = "all" | "old" | "new" | "untranslated" | "no_audio";

interface ApiStory {
  id: string;
  title: string;
  description: string;
  bible_ref: string;
  season_name: string;
  testament: string;
  cover_image_url: string | null;
  is_published: number;
  audio_count: number;
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function Stories() {
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [addForm, setAddForm] = useState({ title: "", slug: "", season_id: "", description: "" });
  const [adding, setAdding] = useState(false);

  const { locale, translations, loading: tLoading, saving: tSaving, saveTranslation, getTranslated, hasTranslation, isTranslating } =
    useTranslations("story");

  function loadStories() {
    adminApi
      .getStories()
      .then((res) => setStories(res.stories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadStories(); }, []);

  useEffect(() => {
    adminApi.getSeasons().then((res) => setSeasons(res.seasons));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.season_id) return;
    addForm.slug = toSlug(addForm.title);
    setAdding(true);
    try {
      await adminApi.createStory(addForm);
      setShowAdd(false);
      setAddForm({ title: "", slug: "", season_id: "", description: "" });
      loadStories();
    } finally {
      setAdding(false);
    }
  }

  async function handleSave(storyId: string, fields: Record<string, string>) {
    if (isTranslating) {
      await saveTranslation(storyId, fields);
    } else {
      setSaving(true);
      try {
        await adminApi.updateStory(storyId, fields);
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, ...fields } : s))
        );
      } finally {
        setSaving(false);
      }
    }
    setEditingId(null);
  }

  const filtered = useMemo(() => {
    let list = stories;
    if (filter === "old") list = list.filter((s) => s.testament === "old");
    if (filter === "new") list = list.filter((s) => s.testament === "new");
    if (filter === "untranslated" && isTranslating) {
      list = list.filter((s) => !hasTranslation(s.id, "title"));
    }
    if (filter === "no_audio") {
      if (isTranslating) {
        list = list.filter((s) => !hasTranslation(s.id, "transcript"));
      } else {
        list = list.filter((s) => !s.audio_count);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.season_name || "").toLowerCase().includes(q) ||
          (s.bible_ref || "").toLowerCase().includes(q) ||
          getTranslated(s.id, "title", "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [stories, filter, search, translations, isTranslating, getTranslated, hasTranslation]);

  const oldCount = stories.filter((s) => s.testament === "old").length;
  const newCount = stories.filter((s) => s.testament === "new").length;
  const noAudioCount = isTranslating
    ? stories.filter((s) => !hasTranslation(s.id, "transcript")).length
    : stories.filter((s) => !s.audio_count).length;
  const untranslatedCount = isTranslating
    ? stories.filter((s) => !hasTranslation(s.id, "title")).length
    : 0;
  const translatedCount = stories.length - untranslatedCount;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-gray-500 text-sm mt-1">
            {stories.length} total · {oldCount} Old Testament · {newCount} New Testament
            {isTranslating && !tLoading && (
              <span className="ml-2">
                · <span className="text-green-400">{translatedCount}</span> translated ·{" "}
                <span className="text-orange-400">{untranslatedCount}</span> missing
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Story
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Story</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input
                value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value, slug: toSlug(e.target.value) })}
                required
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Story title"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Season *</label>
              <select
                value={addForm.season_id}
                onChange={(e) => setAddForm({ ...addForm, season_id: e.target.value })}
                required
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
              >
                <option value="">Select a season...</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                rows={2}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Story description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {adding ? "Creating..." : "Create Story"}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {([
          { key: "all" as Filter, label: `All (${stories.length})` },
          { key: "old" as Filter, label: `Old Testament (${oldCount})` },
          { key: "new" as Filter, label: `New Testament (${newCount})` },
          { key: "no_audio" as Filter, label: isTranslating ? `No Transcript (${noAudioCount})` : `No Audio (${noAudioCount})` },
          ...(isTranslating
            ? [{ key: "untranslated" as Filter, label: `Missing (${untranslatedCount})` }]
            : []),
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-gray-400 border border-white/10 hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stories..."
          className="ml-auto bg-surface border border-white/10 rounded-lg px-4 py-1.5 text-sm text-white placeholder:text-gray-600 w-64"
        />
      </div>

      {loading || tLoading ? (
        <p className="text-gray-500">Loading stories...</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((story) => {
            const displayTitle = getTranslated(story.id, "title", story.title);
            const displayDesc = getTranslated(story.id, "description", story.description);
            const isEditing = editingId === story.id;

            return (
              <div
                key={story.id}
                className="group bg-surface border border-white/5 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 p-3">
                  <Link to={`/stories/${story.id}`} className="flex-shrink-0">
                    {story.cover_image_url ? (
                      <img src={story.cover_image_url} alt={story.title} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface-light flex items-center justify-center text-gray-600 text-lg">📖</div>
                    )}
                  </Link>
                  <Link to={`/stories/${story.id}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {displayTitle}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {story.season_name} — {story.bible_ref}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!story.audio_count && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                        NO AUDIO
                      </span>
                    )}
                    {isTranslating && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          hasTranslation(story.id, "title") ? "bg-green-500/15 text-green-400" : "bg-orange-500/15 text-orange-400"
                        }`}
                      >
                        {locale.toUpperCase()}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        story.testament === "old" ? "bg-orange-500/10 text-orange-400" : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {story.testament === "old" ? "OT" : "NT"}
                    </span>
                    <button
                      onClick={() => setEditingId(isEditing ? null : story.id)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1"
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-0">
                    <div className="pt-3">
                      <InlineEditor
                        fields={[
                          {
                            key: "title",
                            label: "Title",
                            value: isTranslating ? (translations[story.id]?.title ?? "") : story.title,
                          },
                          {
                            key: "description",
                            label: "Description",
                            value: isTranslating ? (translations[story.id]?.description ?? "") : story.description,
                            multiline: true,
                          },
                        ]}
                        saving={saving || tSaving}
                        onSave={(fields) => handleSave(story.id, fields)}
                        onClose={() => setEditingId(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
