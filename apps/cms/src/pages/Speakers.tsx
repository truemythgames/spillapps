import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

export function Speakers() {
  const [speakers, setSpeakers] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getSpeakers().then((res) => setSpeakers(res.speakers));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Speakers</h2>
      <div className="grid grid-cols-3 gap-4">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="bg-surface border border-white/5 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold">{speaker.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{speaker.bio}</p>
            <p className="text-gray-600 text-xs mt-2">
              Style: {speaker.voice_style}
            </p>
            {speaker.is_default && (
              <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                Default
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
