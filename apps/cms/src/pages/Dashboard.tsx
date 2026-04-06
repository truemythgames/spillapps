import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/api";

export function Dashboard() {
  const [storyCount, setStoryCount] = useState(0);
  const [seasonCount, setSeasonCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [speakerCount, setSpeakerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminApi.getStories().then((r) => setStoryCount(r.stories.length)),
      adminApi.getSeasons().then((r) => setSeasonCount(r.seasons.length)),
      adminApi.getPlaylists().then((r) => setPlaylistCount(r.playlists.length)),
      adminApi.getCharacters().then((r) => setCharacterCount(r.characters.length)),
      adminApi.getSpeakers().then((r) => setSpeakerCount(r.speakers.length)),
    ]).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Stories", value: storyCount, icon: "📖", to: "/stories" },
    { label: "Seasons", value: seasonCount, icon: "📅", to: "/seasons" },
    { label: "Playlists", value: playlistCount, icon: "🎵", to: "/playlists" },
    { label: "Characters", value: characterCount, icon: "👤", to: "/characters" },
    { label: "Speakers", value: speakerCount, icon: "🎙️", to: "/speakers" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="bg-surface border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <span className="text-3xl">{card.icon}</span>
                <p className="text-3xl font-bold mt-3">{card.value}</p>
                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-3">
              <Link
                to="/stories"
                className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium"
              >
                Browse Stories
              </Link>
              <Link
                to="/characters"
                className="bg-surface-light border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Manage Characters
              </Link>
              <Link
                to="/playlists"
                className="bg-surface-light border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Manage Playlists
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
