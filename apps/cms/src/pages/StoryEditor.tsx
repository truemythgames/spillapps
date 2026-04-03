import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import {
  getCatalog,
  coverUrl,
  transcriptUrl,
  narrationUrl,
  getDefaultPrompts,
  regenerateTranscript,
  regenerateImage,
  regenerateNarration,
  SPEAKERS,
  type CatalogStory,
  type DefaultPrompts,
} from "../lib/content";

type Tab = "preview" | "image" | "transcript" | "narration";

export function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState<CatalogStory | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<DefaultPrompts | null>(null);
  const [tab, setTab] = useState<Tab>("preview");

  // Editable prompts
  const [imagePrompt, setImagePrompt] = useState("");
  const [transcriptSystem, setTranscriptSystem] = useState("");
  const [transcriptUser, setTranscriptUser] = useState("");

  // Loading states
  const [regenImage, setRegenImage] = useState(false);
  const [regenTranscript, setRegenTranscript] = useState(false);
  const [regenNarration, setRegenNarration] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  // Audio player
  const [activeSpeaker, setActiveSpeaker] = useState<string>(SPEAKERS[0].key);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cache buster for regenerated content
  const [cacheBust, setCacheBust] = useState(Date.now());

  useEffect(() => {
    if (!id) return;
    getCatalog().then((catalog) => {
      setStory(catalog.find((s) => s.id === id) ?? null);
    });
    loadTranscript();
    getDefaultPrompts(id).then((p) => {
      setPrompts(p);
      setImagePrompt(p.imagePrompt);
      setTranscriptSystem(p.transcriptSystemPrompt);
      setTranscriptUser(p.transcriptUserPrompt);
    }).catch(() => {});
  }, [id]);

  function loadTranscript() {
    if (!id) return;
    fetch(transcriptUrl(id))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setTranscript)
      .catch(() => setTranscript(null));
  }

  function flash(type: "ok" | "error", msg: string) {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 5000);
  }

  async function handleRegenImage() {
    if (!id) return;
    setRegenImage(true);
    setStatus(null);
    try {
      const res = await regenerateImage(id, { prompt: imagePrompt });
      if (res.ok) {
        flash("ok", `Image regenerated (${res.sizeKB} KB)`);
        setCacheBust(Date.now());
      } else {
        flash("error", res.error ?? "Unknown error");
      }
    } catch (err: any) {
      flash("error", err.message);
    } finally {
      setRegenImage(false);
    }
  }

  async function handleRegenTranscript() {
    if (!id) return;
    setRegenTranscript(true);
    setStatus(null);
    try {
      const res = await regenerateTranscript(id, {
        systemPrompt: transcriptSystem,
        userPrompt: transcriptUser,
      });
      if (res.ok) {
        flash("ok", `Transcript regenerated (${res.wordCount} words)`);
        loadTranscript();
      } else {
        flash("error", res.error ?? "Unknown error");
      }
    } catch (err: any) {
      flash("error", err.message);
    } finally {
      setRegenTranscript(false);
    }
  }

  async function handleRegenNarration(speaker: string) {
    if (!id) return;
    setRegenNarration(speaker);
    setStatus(null);
    try {
      const res = await regenerateNarration(id, speaker);
      if (res.ok) {
        flash("ok", `${speaker} narration regenerated (${res.sizeKB} KB)`);
        setCacheBust(Date.now());
      } else {
        flash("error", res.error ?? "Unknown error");
      }
    } catch (err: any) {
      flash("error", err.message);
    } finally {
      setRegenNarration(null);
    }
  }

  // Audio controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
    }
  }, [activeSpeaker, cacheBust]);

  function togglePlay() {
    if (!id) return;
    if (!audioRef.current) {
      const audio = new Audio(narrationUrl(id, activeSpeaker) + `?t=${cacheBust}`);
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("timeupdate", () => setProgress(audio.currentTime));
      audio.addEventListener("ended", () => { setIsPlaying(false); setProgress(0); });
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

  if (!id) { navigate("/stories"); return null; }
  if (!story) return <p className="text-gray-500">Loading...</p>;

  const html = transcript ? marked.parse(transcript) : "";

  const TABS: { id: Tab; label: string }[] = [
    { id: "preview", label: "Preview" },
    { id: "image", label: "Cover Image" },
    { id: "transcript", label: "Transcript" },
    { id: "narration", label: "Narration" },
  ];

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate("/stories")}
        className="text-gray-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to Stories
      </button>

      {/* Hero */}
      <div className="flex gap-8 mb-6">
        <div className="w-56 h-56 rounded-xl overflow-hidden flex-shrink-0 bg-surface-light">
          <img
            src={coverUrl(id) + `?t=${cacheBust}`}
            alt={story.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-primary/70 text-xs font-semibold tracking-widest uppercase mb-2">
            {story.section} — {story.bibleRef}
          </p>
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <p className="text-gray-400 leading-relaxed text-sm">{story.description}</p>
        </div>
      </div>

      {/* Status toast */}
      {status && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
          status.type === "ok"
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {status.msg}
        </div>
      )}

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

      {/* Tab content */}
      {tab === "preview" && (
        <div className="space-y-6">
          {/* Player */}
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Narration</h3>
              <div className="flex gap-2">
                {SPEAKERS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSpeaker(s.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeSpeaker === s.key
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-gray-500 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {s.name}
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
                <div className="h-2 bg-white/5 rounded-full cursor-pointer group" onClick={seek}>
                  <div
                    className="h-full bg-primary rounded-full transition-[width] duration-200 relative"
                    style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : "0%" }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-gray-600">{fmtTime(progress)}</span>
                  <span className="text-[11px] text-gray-600">{duration > 0 ? fmtTime(duration) : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript preview */}
          <div className="bg-surface border border-white/5 rounded-xl p-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Transcript</h3>
            {transcript ? (
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-white prose-h1:hidden prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-em:text-gray-500 prose-strong:text-white prose-blockquote:border-l-2 prose-blockquote:border-white/10 prose-blockquote:bg-white/[0.03] prose-blockquote:rounded-lg prose-blockquote:pl-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-gray-300 [&_blockquote_em]:text-gray-300 [&_blockquote_p]:text-gray-300 [&_blockquote_p:first-of-type]:before:content-none [&_blockquote_p:last-of-type]:after:content-none"
                dangerouslySetInnerHTML={{ __html: html as string }}
              />
            ) : (
              <p className="text-gray-500 italic">No transcript yet.</p>
            )}
          </div>
        </div>
      )}

      {tab === "image" && (
        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Image Prompt
            </h3>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={5}
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono leading-relaxed resize-y"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRegenImage}
                disabled={regenImage}
                className="bg-primary text-black px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {regenImage ? "Generating..." : "Regenerate Image"}
              </button>
              {prompts && imagePrompt !== prompts.imagePrompt && (
                <button
                  onClick={() => setImagePrompt(prompts.imagePrompt)}
                  className="text-gray-500 hover:text-white text-xs transition-colors"
                >
                  Reset to default
                </button>
              )}
              {regenImage && (
                <span className="text-gray-500 text-xs">This takes 10-30 seconds...</span>
              )}
            </div>
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Current Cover
            </h3>
            <img
              key={cacheBust}
              src={coverUrl(id) + `?t=${cacheBust}`}
              alt={story.title}
              className="max-w-md rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {tab === "transcript" && (
        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              System Prompt
            </h3>
            <textarea
              value={transcriptSystem}
              onChange={(e) => setTranscriptSystem(e.target.value)}
              rows={8}
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono leading-relaxed resize-y"
            />
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              User Prompt
            </h3>
            <textarea
              value={transcriptUser}
              onChange={(e) => setTranscriptUser(e.target.value)}
              rows={6}
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono leading-relaxed resize-y"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRegenTranscript}
                disabled={regenTranscript}
                className="bg-primary text-black px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {regenTranscript ? "Generating..." : "Regenerate Transcript"}
              </button>
              {prompts && (transcriptSystem !== prompts.transcriptSystemPrompt || transcriptUser !== prompts.transcriptUserPrompt) && (
                <button
                  onClick={() => {
                    setTranscriptSystem(prompts.transcriptSystemPrompt);
                    setTranscriptUser(prompts.transcriptUserPrompt);
                  }}
                  className="text-gray-500 hover:text-white text-xs transition-colors"
                >
                  Reset to defaults
                </button>
              )}
              {regenTranscript && (
                <span className="text-gray-500 text-xs">This takes 10-20 seconds...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "narration" && (
        <div className="space-y-4">
          {SPEAKERS.map((s) => (
            <div key={s.key} className="bg-surface border border-white/5 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-gray-500 text-sm">
                  {s.key === "grace" && "Warm & casual"}
                  {s.key === "maya" && "Dramatic & expressive"}
                  {s.key === "jordan" && "Calm & reflective"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveSpeaker(s.key);
                    setTab("preview");
                    setTimeout(togglePlay, 100);
                  }}
                  className="text-primary text-sm hover:underline"
                >
                  Listen
                </button>
                <button
                  onClick={() => handleRegenNarration(s.key)}
                  disabled={regenNarration !== null}
                  className="bg-surface-light border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:border-white/20 transition-colors"
                >
                  {regenNarration === s.key ? "Generating..." : "Regenerate"}
                </button>
              </div>
            </div>
          ))}
          {!transcript && (
            <p className="text-amber-400 text-sm">
              Generate a transcript first — narration is based on it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
