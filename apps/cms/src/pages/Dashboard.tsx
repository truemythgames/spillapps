import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCatalog, hasGeneratedContent, type CatalogStory } from "../lib/content";

export function Dashboard() {
  const [catalog, setCatalog] = useState<CatalogStory[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalog()
      .then(async (stories) => {
        setCatalog(stories);
        const seeds = stories.filter((s) => s.inSeed);
        const checks = await Promise.all(seeds.map((s) => hasGeneratedContent(s.id)));
        setGeneratedCount(checks.filter(Boolean).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const seedCount = catalog.filter((s) => s.inSeed).length;

  const cards = [
    { label: "Total Stories", value: catalog.length, icon: "📖" },
    { label: "Seed Stories", value: seedCount, icon: "🌱" },
    { label: "Generated", value: generatedCount, icon: "✅" },
    { label: "Remaining", value: seedCount - generatedCount, icon: "⏳" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-surface border border-white/5 rounded-xl p-6"
              >
                <span className="text-3xl">{card.icon}</span>
                <p className="text-3xl font-bold mt-3">{card.value}</p>
                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-3">
              <Link
                to="/stories"
                className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium"
              >
                Browse Stories
              </Link>
              <a
                href="http://localhost:3456/stories/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-light border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Content Server
              </a>
            </div>
          </div>

          {/* Generation progress */}
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Generation Progress</h3>
            <p className="text-gray-500 text-sm mb-4">
              {generatedCount} of {seedCount} seed stories generated
            </p>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-500"
                style={{
                  width: seedCount > 0 ? `${(generatedCount / seedCount) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="text-right text-xs text-gray-600 mt-1">
              {seedCount > 0 ? Math.round((generatedCount / seedCount) * 100) : 0}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}
