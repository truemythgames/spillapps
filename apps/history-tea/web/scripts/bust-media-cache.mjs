#!/usr/bin/env node
// Postbuild: append ?v=<timestamp> to every media.spillapps.com/history-tea/ URL in
// the built dist/ output. This forces browsers to re-fetch covers/portraits whenever
// the site is rebuilt, even though the underlying R2 keys never change.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist", import.meta.url).pathname;
const VERSION = Date.now().toString(36);

const PATTERN = /https:\/\/media\.spillapps\.com\/history-tea\/[^"'\s)<>]+/g;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(html|xml|json|txt)$/i.test(name)) bust(p);
  }
}

let edited = 0;
let urls = 0;

function bust(file) {
  const src = readFileSync(file, "utf8");
  if (!PATTERN.test(src)) return;
  PATTERN.lastIndex = 0;
  const out = src.replace(PATTERN, (m) => {
    urls++;
    return m.includes("?") ? `${m}&v=${VERSION}` : `${m}?v=${VERSION}`;
  });
  if (out !== src) {
    writeFileSync(file, out, "utf8");
    edited++;
  }
}

walk(DIST);
console.log(`[cache-bust] v=${VERSION} — appended to ${urls} URLs across ${edited} files`);
