import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

export function Playlists() {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getPlaylists().then((res) => setPlaylists(res.playlists));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Playlists</h2>
      <div className="grid grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-surface border border-white/5 rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{playlist.name}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {playlist.description}
                </p>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
