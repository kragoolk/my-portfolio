import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useWM } from "../wmStore";
import { run, complete, PROMPT, C } from "../shell";

const THEME = {
  background: "#0d0f11",
  foreground: "#e6e9ea",
  cursor: "#e8b04b",
  cursorAccent: "#0d0f11",
  selectionBackground: "rgba(232,176,75,0.25)",
  black: "#0d0f11",
  red: "#e8685b",
  green: "#57d98a",
  yellow: "#e8b04b",
  blue: "#7aa2f7",
  magenta: "#bb9af7",
  cyan: "#7dcfff",
  white: "#e6e9ea",
};

const BANNER = [
  `${C.amber}oliverkrauss.space${C.reset} ${C.dim}- interactive shell${C.reset}`,
  `${C.dim}Type ${C.reset}${C.amber}help${C.reset}${C.dim} for commands, or ${C.reset}${C.amber}neofetch${C.reset}${C.dim} to start.${C.reset}`,
  "",
];

export default function Terminal({ winId, focused }) {
  const hostRef = useRef(null);
  const termRef = useRef(null);
  const navigate = useNavigate();

  // Read actions off the store imperatively so the effect never re-runs.
  const openApp = useWM((s) => s.open);
  const closeWin = useWM((s) => s.close);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const term = new Xterm({
      convertEol: true,
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
      fontSize: 12.5,
      lineHeight: 1.35,
      letterSpacing: 0,
      theme: THEME,
      allowProposedApi: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    termRef.current = term;

    // State lives in closures, not React, so keystrokes never re-render.
    let cwd = "";
    let line = "";
    let cursor = 0;
    const history = [];
    let histIdx = -1;

    const prompt = () => term.write("\r\n" + PROMPT(cwd));
    const redraw = () => {
      // \x1b[2K clears the row, \r returns to column 0.
      term.write("\x1b[2K\r" + PROMPT(cwd) + line);
      const back = line.length - cursor;
      if (back > 0) term.write(`\x1b[${back}D`);
    };

    BANNER.forEach((l) => term.writeln(l));
    term.write(PROMPT(cwd));

    const submit = () => {
      const input = line;
      term.write("\r\n");
      if (input.trim()) {
        history.unshift(input);
        const res = run(input, cwd);
        cwd = res.cwd;
        res.lines.forEach((l) => term.writeln(l));

        const a = res.action;
        if (a?.type === "clear") term.write("\x1b[2J\x1b[H");
        else if (a?.type === "close") {
          closeWin(winId);
          return;
        } else if (a?.type === "app") openApp(a.app);
        else if (a?.type === "route") navigate(a.to);
        else if (a?.type === "link") window.open(a.href, "_blank", "noopener,noreferrer");
      }
      line = "";
      cursor = 0;
      histIdx = -1;
      term.write(PROMPT(cwd));
    };

    const disposable = term.onData((data) => {
      switch (data) {
        case "\r": // Enter
          submit();
          return;
        case "\x7f": // Backspace
          if (cursor > 0) {
            line = line.slice(0, cursor - 1) + line.slice(cursor);
            cursor--;
            redraw();
          }
          return;
        case "\x03": // Ctrl-C
          term.write("^C");
          line = "";
          cursor = 0;
          histIdx = -1;
          prompt();
          return;
        case "\x0c": // Ctrl-L
          term.write("\x1b[2J\x1b[H" + PROMPT(cwd) + line);
          return;
        case "\t": {
          const next = complete(line, cwd);
          if (next !== line) {
            line = next;
            cursor = line.length;
            redraw();
          }
          return;
        }
        case "\x1b[A": // Up
          if (histIdx < history.length - 1) {
            histIdx++;
            line = history[histIdx];
            cursor = line.length;
            redraw();
          }
          return;
        case "\x1b[B": // Down
          if (histIdx > 0) {
            histIdx--;
            line = history[histIdx];
          } else {
            histIdx = -1;
            line = "";
          }
          cursor = line.length;
          redraw();
          return;
        case "\x1b[C": // Right
          if (cursor < line.length) {
            cursor++;
            term.write("\x1b[C");
          }
          return;
        case "\x1b[D": // Left
          if (cursor > 0) {
            cursor--;
            term.write("\x1b[D");
          }
          return;
        default:
          // Ignore remaining control/escape sequences; insert printable text.
          if (data < " " || data === "\x1b") return;
          line = line.slice(0, cursor) + data + line.slice(cursor);
          cursor += data.length;
          redraw();
      }
    });

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* container mid-transition; next observation will land */
      }
    });
    ro.observe(host);
    fit.fit();

    return () => {
      ro.disconnect();
      disposable.dispose();
      term.dispose();
      termRef.current = null;
    };
  }, [winId, openApp, closeWin, navigate]);

  useEffect(() => {
    if (focused) termRef.current?.focus();
  }, [focused]);

  return <div className="wm-term" ref={hostRef} />;
}
