import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import { adminApi } from "../lib/api";

type Tab = "preview" | "details";

interface ApiStory {
  id: string;
  title: string;
  description: string;
  bible_ref: string;
  season_name: string;
  testament: string;
  cover_image_url: string | null;
  content: string | null;
}

interface AudioVersion {
  id: string;
  speaker_name: string;
  audio_url: string;
}

export function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState<ApiStory | null>(null);
  const [audioVersions, setAudioVersions] = useState<AudioVersion[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("preview");
  const [loading, setLoading] = useState(true);

  const [activeSpeaker, setActiveSpeaker] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    adminApi
      .getStory(id)
      .then((res: any) => {
        setStory(res.story);
        setAudioVersions(res.audio_versions || []);
        setCharacters(res.characters || []);
        if (res.audio_versions?.length > 0) {
          setActiveSpeaker(res.audio_versions[0].speaker_name);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
    }
  }, [activeSpeaker]);

  function togglePlay() {
    const av = audioVersions.find((a) => a.speaker_name === activeSpeaker);
    if (!av?.audio_url) return;

    if (!audioRef.current) {
      const audio = new Audio(av.audio_url);
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("timeupdate", () => setProgress(audio.currentTime));
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audio.addEventListener("error", () => setIsPlaying(false));
      audioRef.current = audio;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  }

  function fmtTime(s: number) {
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  }

  if (!id) {
    navigate("/stories");
    return null;
  }
  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!story) return <p className="text-gray-500">Story not found.</p>;

  const html = story.content ? marked.parse(story.content) : "";

  const TABS: { id: Tab; label: string }[] = [
    { id: "preview", label: "Preview" },
    { id: "details", label: "Details" },
  ];

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate("/stories")}
        className="text-gray-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to Stories
      </button>

      {/* Hero */}
      <div className="flex gap-8 mb-6">
        <div className="w-56 h-56 rounded-xl overflow-hidden flex-shrink-0 bg-surface-light">
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
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-primary/70 text-xs font-semibold tracking-widest uppercase mb-2">
            {story.season_name} — {story.bible_ref}
          </p>
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <p className="text-gray-400 leading-relaxed text-sm">{story.description}</p>
          <span
            className={`inline-block mt-3 text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
              story.testament === "old"
                ? "bg-orange-500/10 text-orange-400"
                : "bg-green-500/10 text-green-400"
            }`}
          >
            {story.testament === "old" ? "Old Testament" : "New Testament"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
              tab === t.id
                ? "text-primary bg-primary/5 border-b-2 border-primary"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "preview" && (
        <div className="space-y-6">
          {/* Audio player */}
          {audioVersions.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Narration
                </h3>
                <div className="flex gap-2">
                  {audioVersions.map((av) => (
                    <button
                      key={av.speaker_name}
                      onClick={() => setActiveSpeaker(av.speaker_name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeSpeaker === av.speaker_name
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-gray-500 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {av.speaker_name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black text-lg flex-shrink-0"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <div className="flex-1">
                  <div
                    className="h-2 bg-white/5 rounded-full cursor-pointer group"
                    onClick={seek}
                  >
                    <div
                      className="h-full bg-primary rounded-full transition-[width] duration-200 relative"
                      style={{
                        width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
                      }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-gray-600">{fmtTime(progress)}</span>
                    <span className="text-[11px] text-gray-600">
                      {duration > 0 ? fmtTime(duration) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript / content preview */}
          {html ? (
            <div className="bg-surface border border-white/5 rounded-xl p-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">
                Content
              </h3>
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-white prose-blockquote:border-l-2 prose-blockquote:border-white/10 prose-blockquote:bg-white/[0.03] prose-blockquote:rounded-lg prose-blockquote:pl-4 prose-blockquote:py-3"
                dangerouslySetInnerHTML={{ __html: html as string }}
              />
            </div>
          ) : (
            <div className="bg-surface border border-white/5 rounded-xl p-8">
              <p className="text-gray-500 italic">No content available for this story.</p>
            </div>
          )}
        </div>
      )}

      {tab === "details" && (
        <div className="space-y-6">
          {/* Characters */}
          {characters.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Characters
              </h3>
              <div className="flex flex-wrap gap-3">
                {characters.map((ch: any) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
                  >
                    {ch.cover_image_url ? (
                      <img
                        src={ch.cover_image_url}
                        alt={ch.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        👤
                      </div>
                    )}
                    <span className="text-sm text-white">{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio versions list */}
          {audioVersions.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Audio Versions
              </h3>
              <div className="space-y-2">
                {audioVersions.map((av) => (
                  <div
                    key={av.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
                  >
                    <span className="text-sm font-medium">{av.speaker_name}</span>
                    <button
                      onClick={() => {
                        setActiveSpeaker(av.speaker_name);
                        setTab("preview");
                      }}
                      className="text-primary text-sm hover:underline"
                    >
                      Listen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
