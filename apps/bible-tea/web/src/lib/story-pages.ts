import type { Locale } from "./i18n";

/**
 * Long-form, written-for-the-web content for story pages.
 *
 * Why this exists: story pages rank at position 20–30 for KD 0–14 queries
 * ("witch of endor", "jacob's ladder bible") because the template only showed
 * a ~150-word teaser above an app gate. The SERP wants the story answered.
 * These files answer it — passage text, a retelling, what it means, and the
 * People-Also-Ask questions — while the narrated episode stays in the app.
 *
 * Files live in src/content/story-pages/<story-id>.<locale>.md so they are
 * tracked by git (apps/*\/content/stories/ is gitignored) and reach CI builds.
 *
 * File format:
 *
 *   ---
 *   passageRef: 1 Samuel 28:3-25
 *   translation: World English Bible
 *   ---
 *   ## Passage
 *   > markdown blockquote of the scripture
 *   ## The Story
 *   markdown
 *   ## What It Means
 *   markdown
 *   ## Questions
 *   ### A question people search?
 *   answer paragraph(s)
 */

export interface StoryPageFaq {
  q: string;
  /** Markdown answer (may contain multiple paragraphs). */
  a: string;
  /** First paragraph, plain text — used in FAQPage JSON-LD. */
  aPlain: string;
}

export interface StoryPage {
  passageRef: string;
  translation: string;
  /** Markdown */
  passage: string;
  /** Markdown */
  story: string;
  /** Markdown */
  meaning: string;
  faqs: StoryPageFaq[];
  wordCount: number;
}

const files = import.meta.glob<string>("../content/story-pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function stripMarkdown(md: string): string {
  return md
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parse(raw: string): StoryPage {
  let body = raw.replace(/\r\n/g, "\n");
  const meta: Record<string, string> = {};
  const fm = body.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    body = body.slice(fm[0].length);
  }

  const sections: Record<string, string> = {};
  const parts = body.split(/^## (.+)$/m);
  // parts = [preamble, heading1, content1, heading2, content2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i].trim().toLowerCase()] = (parts[i + 1] ?? "").trim();
  }

  const faqs: StoryPageFaq[] = [];
  const questionsBlock = sections["questions"] ?? "";
  const qParts = questionsBlock.split(/^### (.+)$/m);
  for (let i = 1; i < qParts.length; i += 2) {
    const a = (qParts[i + 1] ?? "").trim();
    const firstPara = a.split(/\n\s*\n/)[0] ?? "";
    faqs.push({ q: qParts[i].trim(), a, aPlain: stripMarkdown(firstPara) });
  }

  const page: StoryPage = {
    passageRef: meta.passageRef ?? "",
    translation: meta.translation ?? "",
    passage: sections["passage"] ?? "",
    story: sections["the story"] ?? "",
    meaning: sections["what it means"] ?? "",
    faqs,
    wordCount: 0,
  };
  page.wordCount = stripMarkdown(
    [page.passage, page.story, page.meaning, ...faqs.map((f) => `${f.q} ${f.a}`)].join(" "),
  ).split(" ").length;
  return page;
}

const cache = new Map<string, StoryPage | null>();

export function getStoryPage(storyId: string, locale: Locale): StoryPage | null {
  const key = `${storyId}.${locale}`;
  if (cache.has(key)) return cache.get(key)!;
  const path = `../content/story-pages/${storyId}.${locale}.md`;
  const raw = files[path];
  const page = raw ? parse(raw) : null;
  cache.set(key, page);
  return page;
}
