// Generate the Open Graph card at public/media/og-card.jpg.
//
//   npm i -D @napi-rs/canvas   (not kept in package.json: it is a native
//                               module and the site build has no use for it)
//   node tools/make-og-card.mjs
//
// Link previews are usually rendered small, so the card is built around three
// things that survive being shrunk: the name, the role, and the photo. The
// name is stacked on two lines because a single line of monospace at this
// width can only be about 88px tall, which is what made the previous card
// read as small text floating in a black rectangle.

let createCanvas, loadImage, GlobalFonts;
try {
  ({ createCanvas, loadImage, GlobalFonts } = await import("@napi-rs/canvas"));
} catch {
  console.error("Missing @napi-rs/canvas. Install it first:\n\n  npm i -D @napi-rs/canvas\n");
  process.exit(1);
}

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const FONTS = {
  "tools/.fonts/JetBrainsMono-Regular.ttf":
    "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf",
  "tools/.fonts/JetBrainsMono-Bold.ttf":
    "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8L6tjPQ.ttf",
};

// --- content -------------------------------------------------------------

const NAME_TOP = "Oliver";
const NAME_BOTTOM = "Krauss";
const ROLE = "// security analyst";
const DETAIL = "Network Forensics · Incident Response · Detection Engineering";
const PROMPT = "visitor@oliverkrauss:~$ whoami";
const DOMAIN = "oliverkrauss.space";

const W = 1200;
const H = 630;
const LEFT = 72;
const INK = "#f2f1ec";
const ACCENT = "#ffb454";
const DIM = "#97948a";
const FAINT = "#5a5a5a";

mkdirSync("tools/.fonts", { recursive: true });
for (const [path, url] of Object.entries(FONTS)) {
  if (!existsSync(path)) {
    process.stdout.write(`fetching ${path}\n`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`font download failed: ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  GlobalFonts.registerFromPath(
    resolve(path),
    path.includes("Bold") ? "JBMBold" : "JBMRegular"
  );
}

const canvas = createCanvas(W, H);
const c = canvas.getContext("2d");

c.fillStyle = "#0a0a0a";
c.fillRect(0, 0, W, H);

// Faint dot grid, carried over from the previous card.
c.fillStyle = "rgba(255,255,255,0.028)";
for (let y = 24; y < H; y += 24)
  for (let x = 24; x < W; x += 24) c.fillRect(x, y, 1.5, 1.5);

c.strokeStyle = "#262626";
c.lineWidth = 1;
c.strokeRect(24.5, 24.5, W - 49, H - 49);

c.textBaseline = "top";

c.font = '20px JBMRegular';
c.fillStyle = FAINT;
c.fillText(PROMPT, LEFT, 104);
c.fillStyle = ACCENT;
c.fillRect(LEFT + c.measureText(PROMPT).width + 6, 102, 11, 24);

c.font = '132px JBMBold';
c.fillStyle = INK;
c.fillText(NAME_TOP, LEFT, 148);
c.fillText(NAME_BOTTOM, LEFT, 276);

c.font = '42px JBMBold';
c.fillStyle = ACCENT;
c.fillText(ROLE, LEFT, 438);

c.font = '18px JBMRegular';
c.fillStyle = DIM;
c.fillText(DETAIL, LEFT, 506);

c.fillStyle = FAINT;
c.fillText(DOMAIN, LEFT, 556);

// Portrait, cover-cropped square with an accent edge.
const img = await loadImage("public/media/images/Profile.jpg");
const PS = 304;
const PX = 824;
const PY = Math.round((H - PS) / 2);
const scale = Math.max(PS / img.width, PS / img.height);
const sw = PS / scale;
const sh = PS / scale;
c.save();
c.beginPath();
c.rect(PX, PY, PS, PS);
c.clip();
c.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, PX, PY, PS, PS);
c.restore();
c.strokeStyle = ACCENT;
c.lineWidth = 2;
c.strokeRect(PX - 1, PY - 1, PS + 2, PS + 2);

const out = "public/media/og-card.jpg";
const buf = canvas.toBuffer("image/jpeg", 90);
writeFileSync(out, buf);
console.log(`wrote ${out} ${W}x${H} ${(buf.length / 1024).toFixed(0)}KB`);
