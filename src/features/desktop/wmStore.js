import { create } from "zustand";
import { PHOSPHOR_ORDER } from "./phosphor";

export const WORKSPACES = [1, 2, 3, 4, 5];

// Registry of what can live in a window. `initial` is the geometry used when
// a window is floating; tiled windows get their rect from layout.js.
// `command` marks a pane that shows one command's frozen output until clicked.
export const APPS = {
  terminal: { title: "~", chrome: "kitty", initial: { w: 720, h: 420 } },
  about: { title: "about.md", chrome: "nvim", initial: { w: 620, h: 480 } },
  experience: { title: "experience.log", chrome: "nvim", initial: { w: 680, h: 520 } },
  neofetch: { title: "~", chrome: "kitty", command: "neofetch", initial: { w: 640, h: 400 } },
  help: { title: "~", chrome: "kitty", command: "help", initial: { w: 640, h: 470 } },
  matrix: { title: "cmatrix", chrome: "kitty", initial: { w: 420, h: 470 } },
  aquarium: { title: "asciiquarium", chrome: "kitty", initial: { w: 820, h: 360 } },
  writeup: { title: "latest.jpg", chrome: "imv", initial: { w: 420, h: 470 } },
};

// The panes the desktop opens with, and which boot slot each one fills.
const BOOT = [
  ["neofetch", "nf"],
  ["help", "help"],
  ["matrix", "matrix"],
  ["writeup", "writeup"],
  ["aquarium", "aquarium"],
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let seq = 0;
const nextId = () => `win-${++seq}`;

export const useWM = create((set, get) => ({
  windows: {},
  order: [], // stack order, oldest first; last = most recently raised
  workspace: 1,
  focused: null,
  viewport: { w: 1280, h: 720 },
  helpOpen: false,

  // "boot" uses the curated opening arrangement; the first time the visitor
  // opens, closes or floats anything we hand the workspace back to dwindle.
  layoutMode: "boot",

  // high | low | off. Reduced-motion visitors start with the canvas panes
  // frozen. `qualityPinned` records that a human chose, so the automatic
  // downgrade never overrides them.
  quality: prefersReducedMotion() ? "off" : "high",
  qualityPinned: false,
  fps: 60,

  // The CRT treatment is pure CSS paint, so it stays on even at low quality.
  crt: true,

  // Which phosphor the whole desktop is drawn in. "color" keeps each pane's
  // own palette; the others make the screen monochrome, the way a real amber
  // or green tube is.
  phosphor: "amber",

  setViewport: (viewport) => set({ viewport }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  setFps: (fps) => set({ fps }),
  toggleCrt: () => set((s) => ({ crt: !s.crt })),
  cyclePhosphor: () =>
    set((s) => ({
      phosphor: PHOSPHOR_ORDER[(PHOSPHOR_ORDER.indexOf(s.phosphor) + 1) % PHOSPHOR_ORDER.length],
    })),
  setQuality: (quality, byUser = true) =>
    set((s) => (s.qualityPinned && !byUser ? s : { quality, qualityPinned: s.qualityPinned || byUser })),

  boot: () => {
    if (get().order.length) return;
    BOOT.forEach(([app, slot]) => get().open(app, { slot, boot: true }));
    set({ layoutMode: "boot", focused: null });
  },

  open: (app, opts = {}) => {
    const spec = APPS[app];
    if (!spec) return null;
    const id = nextId();
    const { viewport, workspace, order } = get();
    // Cascade floating windows so they don't stack perfectly on top of
    // each other when several are opened in a row.
    const n = order.length;
    const win = {
      id,
      app,
      slot: opts.slot ?? null,
      title: opts.title ?? spec.title,
      workspace: opts.workspace ?? workspace,
      floating: opts.floating ?? false,
      maximized: false,
      geom: {
        x: Math.min(80 + n * 28, Math.max(40, viewport.w - spec.initial.w - 40)),
        y: Math.min(70 + n * 24, Math.max(40, viewport.h - spec.initial.h - 40)),
        w: spec.initial.w,
        h: spec.initial.h,
      },
    };
    set((s) => ({
      windows: { ...s.windows, [id]: win },
      order: [...s.order, id],
      focused: id,
      layoutMode: opts.boot ? s.layoutMode : "dwindle",
    }));
    return id;
  },

  close: (id) =>
    set((s) => {
      if (!s.windows[id]) return s;
      const windows = { ...s.windows };
      delete windows[id];
      const order = s.order.filter((w) => w !== id);
      let focused = s.focused;
      if (focused === id) {
        const sameWs = order.filter((w) => windows[w].workspace === s.workspace);
        focused = sameWs.length ? sameWs[sameWs.length - 1] : null;
      }
      return { windows, order, focused, layoutMode: "dwindle" };
    }),

  focus: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      // `order` doubles as the tiling order, so only raise floating windows.
      // Reordering a tiled window would re-tile the whole workspace every
      // time focus moved, making windows jump around under the cursor.
      if (!win.floating) return { focused: id };
      return { focused: id, order: [...s.order.filter((w) => w !== id), id] };
    }),

  setWorkspace: (n) =>
    set((s) => {
      const onWs = s.order.filter((id) => s.windows[id].workspace === n);
      return { workspace: n, focused: onWs.length ? onWs[onWs.length - 1] : null };
    }),

  moveToWorkspace: (id, n) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return { windows: { ...s.windows, [id]: { ...win, workspace: n } } };
    }),

  toggleFloat: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return {
        windows: { ...s.windows, [id]: { ...win, floating: !win.floating } },
        order: [...s.order.filter((w) => w !== id), id],
        layoutMode: "dwindle",
      };
    }),

  toggleMax: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return { windows: { ...s.windows, [id]: { ...win, maximized: !win.maximized } } };
    }),

  setGeom: (id, geom) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return { windows: { ...s.windows, [id]: { ...win, geom: { ...win.geom, ...geom } } } };
    }),

  // dir: -1 previous, +1 next, wrapping, within the active workspace.
  cycle: (dir) => {
    const { order, windows, workspace, focused } = get();
    const onWs = order.filter((id) => windows[id].workspace === workspace);
    if (!onWs.length) return;
    const i = onWs.indexOf(focused);
    const next = onWs[(i + dir + onWs.length) % onWs.length];
    get().focus(next);
  },
}));

// Selectors kept outside the store so components subscribe narrowly.
export const windowsOn = (s, ws) =>
  s.order.map((id) => s.windows[id]).filter((w) => w && w.workspace === ws);
