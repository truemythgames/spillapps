import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { adminApi, getCmsApiBaseUrl } from "../lib/api";

type Filter = "all" | "old" | "new";

interface ApiStory {
  id: string;
  title: string;
  description: string;
  bible_ref: string;
  season_name: string;
  testament: string;
  cover_image_url: string | null;
  is_published: number;
}

export function Stories() {
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi
      .getStories()
      .then((res) => setStories(res.stories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = stories;
    if (filter === "old") list = list.filter((s) => s.testament === "old");
    if (filter === "new") list = list.filter((s) => s.testament === "new");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.season_name || "").toLowerCase().includes(q) ||
          (s.bible_ref || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [stories, filter, search]);

  const oldCount = stories.filter((s) => s.testament === "old").length;
  const newCount = stories.filter((s) => s.testament === "new").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-gray-500 text-sm mt-1">
            {stories.length} total · {oldCount} Old Testament · {newCount} New Testament
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {([
          { key: "all", label: `All (${stories.length})` },
          { key: "old", label: `Old Testament (${oldCount})` },
          { key: "new", label: `New Testament (${newCount})` },
        ] as { key: Filter; label: string }[]).map((f) => (
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

      {loading ? (
        <p className="text-gray-500">Loading stories...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div className="aspect-square relative bg-surface-light">
                {story.cover_image_url ? (
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                    📖
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      story.testament === "old"
                        ? "bg-orange-500/80 text-black"
                        : "bg-green-500/80 text-black"
                    }`}
                  >
                    {story.testament === "old" ? "OT" : "NT"}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-primary/70 font-medium tracking-wide uppercase">
                  {story.season_name} — {story.bible_ref}
                </p>
                <p className="font-semibold text-sm mt-0.5 group-hover:text-primary transition-colors">
                  {story.title}
                </p>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {story.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
