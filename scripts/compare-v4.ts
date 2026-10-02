import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join } from "path";
import { SPEAKERS, prepareForSpeech } from "./lib/generate-core";

const storyId = process.argv[2] ?? "david-and-goliath";
const speakerKey = (process.argv[3] ?? "elijah") as keyof typeof SPEAKERS;
const model = process.argv[4] ?? "eleven_v4";

const root = join(__dirname, "..");
const storyDir = join(root, "apps/bible-tea/content/stories", storyId);
const outDir = join(root, "tmp-mp3/v4-compare");
mkdirSync(outDir, { recursive: true });

async function main() {
  const speaker = SPEAKERS[speakerKey];
  const text = prepareForSpeech(readFileSync(join(storyDir, "transcript.md"), "utf8"));

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${speaker.voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: model, voice_settings: { ...speaker.voiceSettings } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS failed (${res.status}): ${await res.text()}`);

  const newPath = join(outDir, `${storyId}-${speakerKey}-${model}.mp3`);
  writeFileSync(newPath, Buffer.from(await res.arrayBuffer()));
  const oldPath = join(outDir, `${storyId}-${speakerKey}-current.mp3`);
  copyFileSync(join(storyDir, `narration-${speakerKey}.mp3`), oldPath);
  console.log(`current: ${oldPath}\n${model}: ${newPath}\nchars: ${text.length}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
