import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

export function Seasons() {
  const [seasons, setSeasons] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getSeasons().then((res) => setSeasons(res.seasons));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Seasons</h2>
      <div className="grid grid-cols-2 gap-4">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="bg-surface border border-white/5 rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    season.testament === "old"
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {season.testament === "old" ? "OLD" : "NEW"}
                </span>
                <h3 className="text-lg font-semibold mt-2">{season.name}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {season.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
