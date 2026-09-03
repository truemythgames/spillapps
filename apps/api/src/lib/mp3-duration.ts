/** MPEG-1 Layer III bitrate kbps, index 1–14. */
const BITRATE_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SAMPLE_RATE_V1 = [44100, 48000, 32000];

function id3v2Size(buf: Uint8Array): number {
  if (buf.length < 10) return 0;
  if (buf[0] !== 0x49 || buf[1] !== 0x44 || buf[2] !== 0x33) return 0;
  return (
    10 +
    (((buf[6] & 0x7f) << 21) |
      ((buf[7] & 0x7f) << 14) |
      ((buf[8] & 0x7f) << 7) |
      (buf[9] & 0x7f))
  );
}

function findFrame(buf: Uint8Array, from: number): number {
  for (let i = from; i + 4 < buf.length; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) return i;
  }
  return -1;
}

/**
 * Duration in seconds from an MP3 header peek + full file size.
 * Prefers Xing/Info frame count (VBR); otherwise CBR from bitrate × size.
 */
export function mp3DurationSeconds(header: Uint8Array, fileSize: number): number {
  if (!(fileSize > 0) || header.length < 16) return 0;
  const id3 = id3v2Size(header);
  const frameAt = findFrame(header, Math.min(id3, header.length - 4));
  if (frameAt < 0) return 0;

  const b1 = header[frameAt + 1];
  const b2 = header[frameAt + 2];
  const version = (b1 >> 3) & 3; // 3 = MPEG1
  const layer = (b1 >> 1) & 3; // 1 = Layer III
  const bitrateIdx = (b2 >> 4) & 0x0f;
  const srIdx = (b2 >> 2) & 3;
  if (version !== 3 || layer !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) {
    return 0;
  }

  const bitrate = BITRATE_V1_L3[bitrateIdx] * 1000;
  const sampleRate = SAMPLE_RATE_V1[srIdx];
  const channelMode = (header[frameAt + 3] >> 6) & 3;
  const sideInfo = channelMode === 3 ? 17 : 32;
  const xingAt = frameAt + 4 + sideInfo;

  if (xingAt + 12 <= header.length) {
    const tag = String.fromCharCode(
      header[xingAt],
      header[xingAt + 1],
      header[xingAt + 2],
      header[xingAt + 3],
    );
    if (tag === "Xing" || tag === "Info") {
      const flags = (header[xingAt + 4] << 24) | (header[xingAt + 5] << 16) | (header[xingAt + 6] << 8) | header[xingAt + 7];
      if (flags & 0x0001) {
        const frames =
          (header[xingAt + 8] << 24) |
          (header[xingAt + 9] << 16) |
          (header[xingAt + 10] << 8) |
          header[xingAt + 11];
        if (frames > 0 && sampleRate > 0) {
          return Math.max(1, Math.round((frames * 1152) / sampleRate));
        }
      }
    }
  }

  const audioBytes = Math.max(0, fileSize - (id3 > 0 ? id3 : frameAt));
  return Math.max(1, Math.round((audioBytes * 8) / bitrate));
}

export async function durationFromR2Mp3(
  bucket: R2Bucket,
  key: string,
  fileSize: number,
): Promise<number> {
  if (!(fileSize > 0)) return 0;
  try {
    const obj = await bucket.get(key, { range: { offset: 0, length: 16384 } });
    if (!obj) return 0;
    return mp3DurationSeconds(new Uint8Array(await obj.arrayBuffer()), fileSize);
  } catch {
    return 0;
  }
}
