// Monochrome phosphor emulation, the way cool-retro-term does it.
//
// A real amber or green CRT has one phosphor: the picture varies in
// brightness, never in hue. So rather than filtering the finished screen --
// which would mean a full-surface GPU pass on every frame, over animating
// canvases -- each renderer maps its own colours onto the phosphor ramp as it
// draws. That costs nothing at runtime.

export const PHOSPHORS = {
  amber: {
    label: "amber",
    bg: "#0e0702",
    dark: "#3d1f00",
    mid: "#c86a06",
    base: "#ffab21",
    bright: "#ffe0a8",
    glow: "rgba(255, 150, 20, 0.55)",
  },
  green: {
    label: "green",
    bg: "#020a05",
    dark: "#04351c",
    mid: "#17a355",
    base: "#3bf07f",
    bright: "#c6ffd9",
    glow: "rgba(40, 240, 120, 0.5)",
  },
  ice: {
    label: "ice",
    bg: "#04080e",
    dark: "#0b2a44",
    mid: "#2f83bd",
    base: "#69c6f5",
    bright: "#d6f1ff",
    glow: "rgba(90, 190, 255, 0.5)",
  },
  // No phosphor: every renderer keeps its own colours.
  color: null,
};

export const PHOSPHOR_ORDER = ["amber", "green", "ice", "color"];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// Perceived brightness of a colour, which is what survives on a one-phosphor
// tube. A bright cyan and a bright yellow both read as "bright".
function luminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// Map an arbitrary colour onto the phosphor's dark -> bright ramp.
export function tint(hex, phosphor) {
  if (!phosphor) return hex;
  const l = luminance(hexToRgb(hex));
  // Lift the low end so dim mask colours stay legible, the way a real tube's
  // glow keeps faint strokes visible.
  const t = Math.pow(l, 0.75);
  const stops = [hexToRgb(phosphor.dark), hexToRgb(phosphor.mid), hexToRgb(phosphor.base), hexToRgb(phosphor.bright)];
  const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const local = t * (stops.length - 1) - seg;
  const [r, g, b] = mix(stops[seg], stops[seg + 1], local);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Pre-tint a whole palette once, so draw loops never recompute.
export function tintPalette(palette, phosphor) {
  if (!phosphor) return palette;
  const out = {};
  for (const [k, v] of Object.entries(palette)) out[k] = tint(v, phosphor);
  return out;
}

export function phosphorOf(name) {
  return PHOSPHORS[name] ?? null;
}
