import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getCatalog,
  coverUrl,
  hasGeneratedContent,
  type CatalogStory,
} from "../lib/content";

type Filter = "all" | "seed" | "generated";

export function Stories() {
  const [catalog, setCatalog] = useState<CatalogStory[]>([]);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("seed");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCatalog()
      .then(async (stories) => {
        setCatalog(stories);
        const seeds = stories.filter((s) => s.inSeed);
        const checks = await Promise.all(
          seeds.map(async (s) => [s.id, await hasGeneratedContent(s.id)] as const)
        );
        setGenerated(new Set(checks.filter(([, ok]) => ok).map(([id]) => id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = catalog;
    if (filter === "seed") list = list.filter((s) => s.inSeed);
    if (filter === "generated") list = list.filter((s) => generated.has(s.id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q) ||
          s.bibleRef.toLowerCase().includes(q)
      );
    }
    return list;
  }, [catalog, filter, search, generated]);

  const seedCount = catalog.filter((s) => s.inSeed).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-gray-500 text-sm mt-1">
            {catalog.length} total · {seedCount} seed · {generated.size} generated
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {(["seed", "all", "generated"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-gray-400 border border-white/10 hover:border-white/20"
            }`}
          >
            {f === "all" ? "All" : f === "seed" ? "Seed (40)" : "Generated"}
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
        <p className="text-gray-500">Loading catalog...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((story) => {
            const isGenerated = generated.has(story.id);
            return (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="aspect-square relative bg-surface-light">
                  {isGenerated ? (
                    <img
                      src={coverUrl(story.id)}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                      📖
                    </div>
                  )}
                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {story.inSeed && (
                      <span className="bg-primary/80 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SEED
                      </span>
                    )}
                    {isGenerated && (
                      <span className="bg-green-500/80 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        READY
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-primary/70 font-medium tracking-wide uppercase">
                    {story.section} — {story.bibleRef}
                  </p>
                  <p className="font-semibold text-sm mt-0.5 group-hover:text-primary transition-colors">
                    {story.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {story.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
