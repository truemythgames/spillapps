import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

export function Speakers() {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", bio: "", voice_style: "", is_default: false });
  const [adding, setAdding] = useState(false);

  function loadSpeakers() {
    adminApi.getSpeakers().then((res) => setSpeakers(res.speakers));
  }

  useEffect(() => { loadSpeakers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setAdding(true);
    try {
      await adminApi.createSpeaker(addForm);
      setShowAdd(false);
      setAddForm({ name: "", bio: "", voice_style: "", is_default: false });
      loadSpeakers();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Speakers</h2>
          <p className="text-gray-500 text-sm mt-1">{speakers.length} speakers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Speaker
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Speaker</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Speaker name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Voice Style</label>
              <input
                value={addForm.voice_style}
                onChange={(e) => setAddForm({ ...addForm, voice_style: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="e.g. warm, authoritative"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Bio</label>
              <textarea
                value={addForm.bio}
                onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                rows={2}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600"
                placeholder="Speaker bio"
              />
            </div>
            <div className="col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.is_default}
                  onChange={(e) => setAddForm({ ...addForm, is_default: e.target.checked })}
                  className="rounded"
                />
                Default speaker
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {adding ? "Creating..." : "Create Speaker"}
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-3 gap-4">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="bg-surface border border-white/5 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold">{speaker.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{speaker.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
              <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                {speaker.voice_style}
              </span>
              <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                {speaker.story_count || 0} stories
              </span>
              {speaker.is_default ? (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Default
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
