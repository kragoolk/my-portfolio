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
