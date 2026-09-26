import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWM, WORKSPACES } from "./wmStore";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="wm-clock">
      {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      <span className="wm-clock-time">
        {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}
      </span>
    </span>
  );
}

export default function StatusBar() {
  const workspace = useWM((s) => s.workspace);
  const setWorkspace = useWM((s) => s.setWorkspace);
  const toggleHelp = useWM((s) => s.toggleHelp);
  const windows = useWM((s) => s.windows);
  const focused = useWM((s) => s.focused);

  const quality = useWM((s) => s.quality);
  const setQuality = useWM((s) => s.setQuality);
  const fps = useWM((s) => s.fps);
  const crt = useWM((s) => s.crt);
  const toggleCrt = useWM((s) => s.toggleCrt);
  const phosphor = useWM((s) => s.phosphor);
  const cyclePhosphor = useWM((s) => s.cyclePhosphor);

  const occupied = new Set(Object.values(windows).map((w) => w.workspace));
  const title = focused ? windows[focused]?.title : null;
  const nextQuality = quality === "high" ? "low" : quality === "low" ? "off" : "high";

  return (
    <header className="wm-bar">
      <div className="wm-bar-left">
        <span className="wm-bar-host">
          <span className="wm-dot" />
          oliver-krauss
        </span>
        <nav className="wm-ws" aria-label="Workspaces">
          {WORKSPACES.map((n) => {
            const active = n === workspace;
            return (
              <button
                key={n}
                type="button"
                className={`wm-ws-pill${active ? " is-active" : ""}${occupied.has(n) ? " has-windows" : ""}`}
                aria-current={active ? "true" : undefined}
                aria-label={`Workspace ${n}`}
                onClick={() => setWorkspace(n)}
              >
                {n}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="wm-bar-center">
        {title ? <span className="wm-bar-title">{title}</span> : <span className="wm-bar-idle">no windows</span>}
      </div>

      <div className="wm-bar-right">
        <span
          className={`wm-fps${fps < 38 ? " is-low" : ""}`}
          title="Frames per second of the shared animation loop"
        >
          {fps} fps
        </span>
        <button
          type="button"
          className="wm-tray-btn"
          onClick={() => setQuality(nextQuality)}
          title="Cycle animation quality for the cmatrix and aquarium panes"
        >
          fx:{quality}
        </button>
        <button
          type="button"
          className="wm-tray-btn"
          onClick={cyclePhosphor}
          title="Cycle the phosphor colour of the whole screen"
        >
          {phosphor}
        </button>
        <button
          type="button"
          className={`wm-tray-btn${crt ? " is-on" : ""}`}
          onClick={toggleCrt}
          title="Toggle the CRT treatment"
        >
          crt:{crt ? "on" : "off"}
        </button>
        <button type="button" className="wm-tray-btn" onClick={toggleHelp}>
          Alt+/ keys
        </button>
        <a
          className="wm-tray-btn"
          href="/media/resume/OliverKraussResume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          resume
        </a>
        <Link className="wm-tray-btn" to="/gallery">
          gallery
        </Link>
        <Link className="wm-tray-btn wm-tray-exit" to="/">
          exit to site
        </Link>
        <Clock />
      </div>
    </header>
  );
}
