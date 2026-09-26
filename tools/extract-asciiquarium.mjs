// Extract the sprite art and colour masks from Kirk Baucom's asciiquarium
// (GPL-2.0-or-later) into JSON the web port consumes.
//
// The art is transcribed mechanically rather than by hand so it stays a
// faithful copy of the original. See CREDITS.md for attribution.
//
//   node tools/extract-asciiquarium.mjs <path-to-asciiquarium-perl-script>
//
// Writes src/features/desktop/aquarium/sprites.json

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node tools/extract-asciiquarium.mjs <asciiquarium>");
  process.exit(1);
}

const text = readFileSync(src, "utf8");

// The script uses two quoting styles: q{...}, where braces nest, and q#...#,
// which runs to the next unescaped #. In both, a backslash only escapes the
// delimiters and itself; anywhere else it is a literal backslash.
function readQBlock(body, start) {
  const open = body[start + 1];
  const close = open === "{" ? "}" : open;
  const nests = open === "{";
  let depth = 1;
  let out = "";
  let i = start + 2;

  for (; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === "\\") {
      const next = body[i + 1];
      out += next === "\\" || next === open || next === close ? next : ch + next;
      i += 1;
      continue;
    }
    if (nests && ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) break;
    }
    out += ch;
  }
  return { text: out, end: i };
}

function blocksIn(body) {
  const out = [];
  for (let i = 0; i < body.length - 1; i += 1) {
    if (body[i] !== "q") continue;
    if (!"{#".includes(body[i + 1])) continue;
    if (i > 0 && /[A-Za-z0-9_$]/.test(body[i - 1])) continue;
    const { text: block, end } = readQBlock(body, i);
    out.push(block.replace(/^\n/, ""));
    i = end;
  }
  return out;
}

// Collect every `my @name = ( ... );` in source order, keyed by name.
const arrays = {};
const arrayRe = /my\s+@(\w+)\s*=\s*\(/g;
let m;
while ((m = arrayRe.exec(text)) !== null) {
  let depth = 1;
  let i = m.index + m[0].length;
  for (; i < text.length && depth > 0; i += 1) {
    if (text[i] === "q" && "{#".includes(text[i + 1])) {
      i = readQBlock(text, i).end;
      continue;
    }
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") depth -= 1;
  }
  (arrays[m[1]] ??= []).push(blocksIn(text.slice(m.index, i)));
}

// And the scalar sprites (the castle).
const scalars = {};
const scalarRe = /my\s+\$(\w+)\s*=\s*q[{#]/g;
while ((m = scalarRe.exec(text)) !== null) {
  const at = m.index + m[0].length - 2;
  scalars[m[1]] = readQBlock(text, at).text.replace(/^\n/, "");
}

const zip = (imgs = [], masks = []) =>
  imgs.map((art, i) => ({ art, mask: masks[i] ?? "" }));

// The two fish sets and the two monster/big-fish variants reuse the same
// variable name, so they are distinguished by declaration order.
const sprites = {
  _license: "GPL-2.0-or-later",
  _copyright: "Copyright (C) 2003 Kirk Baucom <kbaucom@schizoid.com>",
  _art: "Most ASCII art by Joan Stark; additional marine life by Claudio Matsuoka",
  _source: "http://robobunny.com/projects/asciiquarium",
  _note: "Extracted by tools/extract-asciiquarium.mjs - do not edit by hand.",

  waterline: arrays.water_line_segment?.[0] ?? [],
  castle: { art: scalars.castle_image ?? "", mask: scalars.castle_mask ?? "" },

  // These two arrays interleave image, mask, image, mask...
  newFish: (arrays.fish_image?.[0] ?? []).reduce((acc, b, i, a) => {
    if (i % 2 === 0) acc.push({ art: b, mask: a[i + 1] ?? "" });
    return acc;
  }, []),
  oldFish: (arrays.fish_image?.[1] ?? []).reduce((acc, b, i, a) => {
    if (i % 2 === 0) acc.push({ art: b, mask: a[i + 1] ?? "" });
    return acc;
  }, []),

  shark: zip(arrays.shark_image?.[0], arrays.shark_mask?.[0]),
  ship: zip(arrays.ship_image?.[0], arrays.ship_mask?.[0]),
  whale: zip(arrays.whale_image?.[0], arrays.whale_mask?.[0]),
  waterSpout: arrays.water_spout?.[0] ?? [],
  monsterNew: zip(arrays.monster_image?.[0], arrays.monster_mask?.[0]),
  monsterOld: zip(arrays.monster_image?.[1], arrays.monster_mask?.[1]),
  bigFish1: zip(arrays.big_fish_image?.[0], arrays.big_fish_mask?.[0]),
  bigFish2: zip(arrays.big_fish_image?.[1], arrays.big_fish_mask?.[1]),
  splat: arrays.splat_image?.[0] ?? [],
};

const outPath = resolve("src/features/desktop/aquarium/sprites.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(sprites, null, 1));

for (const [k, v] of Object.entries(sprites)) {
  if (k.startsWith("_")) continue;
  const n = Array.isArray(v) ? v.length : 1;
  const widest = Array.isArray(v)
    ? Math.max(0, ...v.map((e) => (typeof e === "string" ? e : e.art).split("\n").length))
    : v.art.split("\n").length;
  console.log(`${k.padEnd(12)} count=${String(n).padEnd(3)} tallest=${widest}`);
}
console.log(`\nwrote ${outPath}`);
