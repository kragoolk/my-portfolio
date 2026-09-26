import { create } from "zustand";

export const WORKSPACES = [1, 2, 3, 4, 5];

// Registry of what can live in a window. `initial` is the geometry used when
// a window is floating; tiled windows get their rect from layout.js.
export const APPS = {
  terminal: { title: "~", chrome: "kitty", initial: { w: 720, h: 420 } },
  about: { title: "about.md", chrome: "nvim", initial: { w: 620, h: 480 } },
  experience: { title: "experience.log", chrome: "nvim", initial: { w: 680, h: 520 } },
};

let seq = 0;
const nextId = () => `win-${++seq}`;

export const useWM = create((set, get) => ({
  windows: {},
  order: [], // stack order, oldest first; last = most recently raised
  workspace: 1,
  focused: null,
  viewport: { w: 1280, h: 720 },
  helpOpen: false,

  setViewport: (viewport) => set({ viewport }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),

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
      return { windows, order, focused };
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
