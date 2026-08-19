/** Pull the chapter line from a transcript (`# Title` then `*Genesis 6-9*`). */
export function bibleRefFromTranscript(transcript?: string | null): string {
  if (!transcript) return "";
  const match = transcript.match(/^#\s+.+\n+\*\s*(.+?)\s*\*/m);
  return match?.[1]?.trim() ?? "";
}

export function bibleRefFromStory(story: {
  bible_ref?: string | null;
  bibleRef?: string | null;
  transcript?: string | null;
} | null | undefined): string {
  return (
    story?.bible_ref?.trim() ||
    story?.bibleRef?.trim() ||
    bibleRefFromTranscript(story?.transcript) ||
    ""
  );
}
