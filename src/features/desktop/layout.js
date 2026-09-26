// Dwindle tiling, the same idea Hyprland uses by default: the first window
// takes half the space, the remainder recursively splits among the rest.
// Each split runs along the longer axis, so the layout stays roughly square
// instead of degenerating into slivers.

export const GAP = 10; // between windows
export const OUTER = 12; // around the edge of the tiling area

function split(rect, horizontal) {
  if (horizontal) {
    const w = (rect.w - GAP) / 2;
    return [
      { x: rect.x, y: rect.y, w, h: rect.h },
      { x: rect.x + w + GAP, y: rect.y, w, h: rect.h },
    ];
  }
  const h = (rect.h - GAP) / 2;
  return [
    { x: rect.x, y: rect.y, w: rect.w, h },
    { x: rect.x, y: rect.y + h + GAP, w: rect.w, h },
  ];
}

function dwindle(rect, ids, out) {
  if (ids.length === 0) return out;
  if (ids.length === 1) {
    out[ids[0]] = rect;
    return out;
  }
  const [first, rest] = split(rect, rect.w >= rect.h);
  out[ids[0]] = first;
  return dwindle(rest, ids.slice(1), out);
}

// The opening arrangement, chosen rather than derived.
//
// Pure dwindle would work, but with five panes it only yields two wide slots,
// and both neofetch and help need roughly 60 columns to render without
// wrapping. So the boot screen gets fixed proportions: a tall text column on
// the left, the animated panes and the write-up on the right. Any window the
// visitor opens, closes or floats hands the workspace back to dwindle.
export function bootTiles(viewport) {
  const W = Math.max(0, viewport.w - OUTER * 2);
  const H = Math.max(0, viewport.h - OUTER * 2);
  const x0 = OUTER;
  const y0 = OUTER;

  const leftW = Math.round(W * 0.42);
  const rightW = W - leftW - GAP;
  const rightX = x0 + leftW + GAP;

  const nfH = Math.round(H * 0.48);
  const topH = Math.round(H * 0.56);
  const matrixW = Math.round(rightW * 0.5);

  return {
    nf: { x: x0, y: y0, w: leftW, h: nfH },
    help: { x: x0, y: y0 + nfH + GAP, w: leftW, h: H - nfH - GAP },
    matrix: { x: rightX, y: y0, w: matrixW, h: topH },
    writeup: {
      x: rightX + matrixW + GAP,
      y: y0,
      w: rightW - matrixW - GAP,
      h: topH,
    },
    aquarium: { x: rightX, y: y0 + topH + GAP, w: rightW, h: H - topH - GAP },
  };
}

// ids: the tiled windows of the active workspace, in stack order.
export function computeTiles(viewport, ids) {
  if (!ids.length) return {};
  const rect = {
    x: OUTER,
    y: OUTER,
    w: Math.max(0, viewport.w - OUTER * 2),
    h: Math.max(0, viewport.h - OUTER * 2),
  };
  return dwindle(rect, ids, {});
}
