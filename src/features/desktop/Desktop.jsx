import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useWM, WORKSPACES, APPS } from "./wmStore";
import { computeTiles, bootTiles, OUTER } from "./layout";
import { onFps } from "./raf";
import StatusBar from "./StatusBar";
import Window from "./Window";
import Terminal from "./apps/Terminal";
import Reader from "./apps/Reader";
import StaticTerm from "./apps/StaticTerm";
import MatrixRain from "./apps/MatrixRain";
import Asciiquarium from "./apps/Asciiquarium";
import WriteupCard from "./apps/WriteupCard";
import "../../styles/desktop.css";

const MIN_WIDTH = 860;

const KEYS = [
  ["Alt + Enter", "new terminal"],
  ["Alt + Q", "close focused window"],
  ["Alt + 1..5", "switch workspace"],
  ["Alt + Shift + 1..5", "move window to workspace"],
  ["Alt + H / L", "focus previous / next"],
  ["Alt + F", "maximize focused window"],
  ["Alt + V", "toggle floating"],
  ["Alt + /", "this overlay"],
];

function AppBody({ win, focused }) {
  switch (win.app) {
    case "terminal":
      return <Terminal winId={win.id} focused={focused} />;
    case "matrix":
      return <MatrixRain />;
    case "aquarium":
      return <Asciiquarium />;
    case "writeup":
      return <WriteupCard />;
    default: {
      const command = APPS[win.app]?.command;
      if (command) return <StaticTerm winId={win.id} focused={focused} command={command} />;
      return <Reader app={win.app} />;
    }
  }
}

export default function Desktop() {
  const stageRef = useRef(null);
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MIN_WIDTH : false
  );

  const windows = useWM((s) => s.windows);
  const order = useWM((s) => s.order);
  const workspace = useWM((s) => s.workspace);
  const focused = useWM((s) => s.focused);
  const viewport = useWM((s) => s.viewport);
  const helpOpen = useWM((s) => s.helpOpen);
  const crt = useWM((s) => s.crt);
  const setViewport = useWM((s) => s.setViewport);

  // Lay out the opening screen once per mount.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    useWM.getState().boot();
  }, []);

  // Watch the shared animation loop and step quality down if the machine
  // can't hold a reasonable frame rate. Only ever downgrades, only once, and
  // never overrides a choice the visitor made in the status bar.
  useEffect(() => {
    let slow = 0;
    return onFps((measured) => {
      useWM.getState().setFps(measured);
      const wm = useWM.getState();
      if (wm.qualityPinned || wm.quality === "off") return;
      if (measured < 38) {
        slow += 1;
        if (slow >= 3) wm.setQuality(wm.quality === "high" ? "low" : "off", false);
      } else {
        slow = 0;
      }
    });
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setViewport]);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < MIN_WIDTH);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Capture phase: the terminal has keyboard focus most of the time, so the
  // WM has to claim its chords before xterm turns them into escape sequences.
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const wm = useWM.getState();
      const id = wm.focused;
      const digit = /^Digit([1-9])$/.exec(e.code);

      let handled = true;
      if (digit) {
        const n = Number(digit[1]);
        if (!WORKSPACES.includes(n)) handled = false;
        else if (e.shiftKey) {
          if (id) wm.moveToWorkspace(id, n);
        } else wm.setWorkspace(n);
      } else {
        switch (e.code) {
          case "Enter": wm.open("terminal"); break;
          case "KeyQ": if (id) wm.close(id); break;
          case "KeyH": case "ArrowLeft": wm.cycle(-1); break;
          case "KeyL": case "ArrowRight": wm.cycle(1); break;
          case "KeyK": case "ArrowUp": wm.cycle(-1); break;
          case "KeyJ": case "ArrowDown": wm.cycle(1); break;
          case "KeyF": if (id) wm.toggleMax(id); break;
          case "KeyV": if (id) wm.toggleFloat(id); break;
          case "Slash": wm.toggleHelp(); break;
          default: handled = false;
        }
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const onWs = useMemo(
    () => order.map((id) => windows[id]).filter((w) => w && w.workspace === workspace),
    [order, windows, workspace]
  );

  const layoutMode = useWM((s) => s.layoutMode);
  const useBoot = layoutMode === "boot" && onWs.length > 0 && onWs.every((w) => w.slot);
  const bootRects = useMemo(() => bootTiles(viewport), [viewport]);

  const tiles = useMemo(() => {
    if (useBoot) return {};
    const tiled = onWs.filter((w) => !w.floating && !w.maximized).map((w) => w.id);
    return computeTiles(viewport, tiled);
  }, [onWs, viewport, useBoot]);

  const maxRect = {
    x: OUTER,
    y: OUTER,
    w: Math.max(0, viewport.w - OUTER * 2),
    h: Math.max(0, viewport.h - OUTER * 2),
  };

  if (narrow) {
    return (
      <div className="wm-narrow">
        <p className="wm-narrow-title">This one needs a keyboard.</p>
        <p className="wm-narrow-body">
          The desktop is a tiling window manager driven by <code>Alt</code> chords, so it only
          makes sense on a larger screen. Everything in it is on the main site too.
        </p>
        <Link className="wm-narrow-link" to="/">
          Go to the site
        </Link>
      </div>
    );
  }

  return (
    <div className={`wm-root${crt ? " is-crt" : ""}`}>
      <StatusBar />
      <div className="wm-stage" ref={stageRef}>
        <AnimatePresence>
          {onWs.map((win) => {
            const rect = win.maximized
              ? maxRect
              : win.floating
                ? win.geom
                : ((useBoot ? bootRects[win.slot] : tiles[win.id]) ?? maxRect);
            return (
              <Window key={win.id} win={win} rect={rect} focused={win.id === focused}>
                <AppBody win={win} focused={win.id === focused} />
              </Window>
            );
          })}
        </AnimatePresence>

        {crt && (
          <div className="wm-crt" aria-hidden="true">
            <div className="wm-crt-lines" />
            <div className="wm-crt-roll" />
            <div className="wm-crt-glass" />
          </div>
        )}

        {!onWs.length && (
          <div className="wm-empty">
            <p className="wm-empty-key">Alt + Enter</p>
            <p className="wm-empty-sub">to open a terminal on workspace {workspace}</p>
          </div>
        )}
      </div>

      {helpOpen && (
        <div
          className="wm-help"
          role="dialog"
          aria-label="Keybindings"
          onClick={() => useWM.getState().toggleHelp()}
        >
          <div className="wm-help-card" onClick={(e) => e.stopPropagation()}>
            <p className="wm-help-title">Keybindings</p>
            <dl className="wm-help-list">
              {KEYS.map(([k, v]) => (
                <div className="wm-help-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="wm-help-foot">
              In the terminal: <code>help</code>, <code>ls</code>, <code>cat</code>,{" "}
              <code>tree</code>, <code>open</code>. Tab completes, Up/Down walks history.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
