// A web port of Kirk Baucom's asciiquarium.
//
// The sprite art in sprites.json is the original, extracted mechanically from
// the Perl source (see tools/extract-asciiquarium.mjs). This file reimplements
// enough of Term::Animation to draw it: colour masks, transparency, depth
// ordering, and the entity lifecycle.
//
// asciiquarium is Copyright (C) 2003 Kirk Baucom, GPL-2.0-or-later.
// Most ASCII art by Joan Stark. See CREDITS.md.

import sprites from "./sprites.json";
import { tintPalette, tint } from "../phosphor";

// Term::Animation colour codes. Lower case is the normal intensity, upper
// case the bright variant.
const PALETTE = {
  c: "#00aaaa", C: "#55ffff",
  r: "#aa0000", R: "#ff5555",
  y: "#aaaa00", Y: "#ffff55",
  b: "#2222bb", B: "#5555ff",
  g: "#00aa00", G: "#55ff55",
  m: "#aa00aa", M: "#ff55ff",
  w: "#aaaaaa", W: "#ffffff",
  k: "#222222", K: "#666666",
};

const RANDOM_CODES = ["c", "C", "r", "R", "y", "Y", "b", "B", "g", "G", "m", "M"];

// Term::Animation treats '?' as transparent unless an entity says otherwise.
const TRANSPARENT = "?";

// Lower depth sits nearer the viewer, so entities are drawn deepest first.
const DEPTH = {
  shark: 2,
  fishStart: 3,
  fishEnd: 20,
  seaweed: 21,
  castle: 22,
  waterline: 10,
  bubble: 4,
};

function splitLines(block) {
  return block.replace(/\n+$/, "").split("\n");
}

// Replace the digits 1-9 in a mask with one random colour each, the way
// asciiquarium's rand_color does, so every fish comes out differently.
function randomiseMask(mask) {
  let out = mask;
  for (let i = 1; i <= 9; i += 1) {
    const c = RANDOM_CODES[Math.floor(Math.random() * (RANDOM_CODES.length - 1))];
    out = out.split(String(i)).join(c);
  }
  return out;
}

export function makeSprite(
  { art, mask },
  defaultColor = "#7fdfff",
  transparent = TRANSPARENT,
  palette = PALETTE
) {
  const lines = splitLines(art);
  const maskLines = mask ? splitLines(randomiseMask(mask)) : [];
  return {
    lines,
    maskLines,
    defaultColor,
    transparent,
    palette,
    w: Math.max(0, ...lines.map((l) => l.length)),
    h: lines.length,
  };
}

// Draw one sprite at a character cell position.
function drawSprite(ctx, sprite, col, row, cw, ch) {
  const { lines, maskLines, defaultColor, transparent, palette } = sprite;
  const pal = palette ?? PALETTE;
  for (let y = 0; y < lines.length; y += 1) {
    const line = lines[y];
    const maskLine = maskLines[y] ?? "";
    for (let x = 0; x < line.length; x += 1) {
      const chr = line[x];
      if (chr === transparent) continue;
      if (chr === " " && transparent === " ") continue;
      const code = maskLine[x];
      ctx.fillStyle = (code && pal[code]) || defaultColor;
      ctx.fillText(chr, (col + x) * cw, (row + y) * ch);
    }
  }
}

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

export function createAquarium({ cols, rows, density = 1, phosphor = null }) {
  // One palette per tank: every mask colour is mapped onto the phosphor
  // ramp up front so the draw loop never recomputes a colour.
  const P = tintPalette(PALETTE, phosphor);
  const sprite = (art, color, transparent) =>
    makeSprite(art, tint(color, phosphor), transparent, P);

  const entities = [];
  let tick = 0;

  const add = (e) => {
    entities.push(e);
    return e;
  };

  // --- environment -------------------------------------------------------

  const waterlineRows = sprites.waterline.map((seg) => {
    const repeat = Math.ceil(cols / Math.max(1, seg.length)) + 1;
    return sprite({ art: seg.repeat(repeat), mask: "" }, PALETTE.c);
  });
  waterlineRows.forEach((s, i) =>
    add({ kind: "waterline", sprite: s, col: 0, row: 5 + i, depth: DEPTH.waterline })
  );

  const castle = sprite(sprites.castle, PALETTE.K);
  add({
    kind: "castle",
    sprite: castle,
    col: Math.max(0, cols - 32),
    row: Math.max(0, rows - 13),
    depth: DEPTH.castle,
  });

  function addSeaweed() {
    const height = rand(4) + 3;
    const frames = ["", ""];
    for (let i = 1; i <= height; i += 1) {
      const left = i % 2;
      frames[left] += "(\n";
      frames[1 - left] += " )\n";
    }
    return add({
      kind: "seaweed",
      frames: frames.map((f) => sprite({ art: f, mask: "" }, PALETTE.g)),
      col: rand(Math.max(1, cols - 2)) + 1,
      row: rows - height,
      depth: DEPTH.seaweed,
      period: 12 + rand(10),
      get sprite() {
        return this.frames[Math.floor(tick / this.period) % 2];
      },
    });
  }
  const weedCount = Math.max(1, Math.round((cols / 15) * density));
  for (let i = 0; i < weedCount; i += 1) addSeaweed();

  // --- fish --------------------------------------------------------------

  const FISH = [...sprites.newFish, ...sprites.oldFish];

  function addFish() {
    // Sprites come in direction pairs: even index swims right, odd left.
    const idx = rand(FISH.length >> 1) * 2;
    const dir = rand(2); // 0 right, 1 left
    const body = sprite(FISH[idx + dir], PALETTE.C);
    const speed = (0.25 + Math.random() * 1.75) * (dir === 0 ? 1 : -1);
    return add({
      kind: "fish",
      sprite: body,
      col: dir === 0 ? -body.w : cols,
      row: 9 + rand(Math.max(1, rows - body.h - 10)),
      depth: DEPTH.fishStart + rand(DEPTH.fishEnd - DEPTH.fishStart),
      speed,
      bubbleAt: rand(200) + 100,
      step() {
        this.col += this.speed;
        if (--this.bubbleAt <= 0) {
          this.bubbleAt = rand(300) + 120;
          addBubble(this);
        }
        if (this.speed > 0 && this.col > cols) return false;
        if (this.speed < 0 && this.col + this.sprite.w < 0) return false;
        return true;
      },
    });
  }

  function addBubble(fish) {
    const mouth = fish.speed > 0 ? fish.col + fish.sprite.w : fish.col;
    add({
      kind: "bubble",
      frames: [".", "o", "O", "O", "O"].map((c) =>
        sprite({ art: c, mask: "" }, PALETTE.C)
      ),
      col: mouth,
      row: fish.row + (fish.sprite.h >> 1),
      depth: DEPTH.bubble,
      age: 0,
      get sprite() {
        return this.frames[Math.min(this.frames.length - 1, this.age >> 2)];
      },
      step() {
        this.age += 1;
        this.row -= 0.4;
        return this.row > 5;
      },
    });
  }

  const fishCount = Math.max(3, Math.round((cols * rows) / 350 * density));
  for (let i = 0; i < fishCount; i += 1) {
    const f = addFish();
    f.col = rand(cols); // seed mid-screen so the tank starts full
  }

  // --- the roaming specials ----------------------------------------------

  const SPECIALS = [
    { name: "ship", frames: sprites.ship, row: 0, depth: DEPTH.waterline - 1, speed: 1, color: PALETTE.W },
    { name: "whale", frames: sprites.whale, row: 0, depth: DEPTH.waterline - 1, speed: 0.8, color: PALETTE.B },
    { name: "monster", frames: sprites.monsterOld, row: 2, depth: DEPTH.waterline - 2, speed: 1.2, color: PALETTE.G, animated: true },
    { name: "bigFish", frames: sprites.bigFish1, row: 9, depth: DEPTH.fishStart - 1, speed: 1.5, color: PALETTE.Y },
    { name: "bigFish2", frames: sprites.bigFish2, row: 9, depth: DEPTH.fishStart - 1, speed: 1.5, color: PALETTE.Y },
    { name: "shark", frames: sprites.shark, row: 9, depth: DEPTH.shark, speed: 2, color: PALETTE.W },
  ];

  let specialCooldown = 200 + rand(400);
  let special = null;

  function addSpecial() {
    const spec = pick(SPECIALS.filter((s) => s.frames && s.frames.length >= 2));
    if (!spec) return;
    const dir = rand(2);
    // Animated creatures hold several frames per direction; the rest hold one.
    const perDir = spec.frames.length / 2;
    const frameFor = (i) =>
      sprite(spec.frames[dir * perDir + (i % perDir)], spec.color);
    const frames = Array.from({ length: perDir }, (_, i) => frameFor(i));
    const w = Math.max(...frames.map((f) => f.w));
    const speed = spec.speed * (dir === 0 ? 1 : -1);

    special = add({
      kind: "special",
      frames,
      col: dir === 0 ? -w : cols,
      row: spec.row,
      depth: spec.depth,
      speed,
      age: 0,
      get sprite() {
        return this.frames[
          spec.animated ? Math.floor(this.age / 6) % this.frames.length : 0
        ];
      },
      step() {
        this.age += 1;
        this.col += this.speed;
        if (this.speed > 0 && this.col > cols) return false;
        if (this.speed < 0 && this.col + w < 0) return false;
        return true;
      },
    });
  }

  // --- frame -------------------------------------------------------------

  function step() {
    tick += 1;

    for (let i = entities.length - 1; i >= 0; i -= 1) {
      const e = entities[i];
      if (e.step && e.step() === false) {
        entities.splice(i, 1);
        if (e === special) {
          special = null;
          specialCooldown = 300 + rand(600);
        }
        if (e.kind === "fish") addFish();
      }
    }

    if (!special && --specialCooldown <= 0) addSpecial();
  }

  function draw(ctx, cw, ch) {
    // Deepest first so nearer entities paint over them.
    const ordered = [...entities].sort((a, b) => b.depth - a.depth);
    for (const e of ordered) {
      const s = e.sprite;
      if (s) drawSprite(ctx, s, Math.round(e.col), Math.round(e.row), cw, ch);
    }
  }

  return { step, draw, get count() { return entities.length; } };
}

export { PALETTE };
