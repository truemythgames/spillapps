import { useState, useRef } from "react";
import { adminApi } from "../lib/api";

export function Upload() {
  const [key, setKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ key: string; url: string } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file || !key) return;

    setUploading(true);
    try {
      const res = await adminApi.upload(file, key);
      setResult(res);
      setFile(null);
      setKey("");
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Upload Media</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Storage Key (path)
          </label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g. audio/the-creation/grace.mp3"
            className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">File</label>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:bg-primary file:text-black file:border-0 file:text-sm"
          />
        </div>

        {file && (
          <p className="text-sm text-gray-500">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !key || uploading}
          className="bg-primary text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm font-medium">
              Uploaded successfully!
            </p>
            <p className="text-gray-400 text-sm mt-1">Key: {result.key}</p>
            <p className="text-gray-400 text-sm">URL: {result.url}</p>
          </div>
        )}
      </div>
    </div>
  );
}
