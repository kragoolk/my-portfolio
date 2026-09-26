import { useMemo, useState } from "react";
import { run, PROMPT } from "../shell";
import { ansiToNodes } from "../ansi";
import Terminal from "./Terminal";

// A terminal pane showing one command's output, rendered as plain markup.
//
// Booting the desktop with several xterm instances just to display frozen text
// is expensive: each one builds a renderer, a hidden textarea and its own
// accessibility tree. These panes are displays, so they stay cheap until the
// visitor actually clicks one, at which point they become a real terminal with
// the same command already run.
export default function StaticTerm({ winId, focused, command }) {
  const [live, setLive] = useState(false);
  const lines = useMemo(() => run(command, "").lines, [command]);

  if (live) {
    return <Terminal winId={winId} focused={focused} initialCommand={command} />;
  }

  return (
    <div className="wm-static">
      <pre className="wm-static-out" aria-label={`Output of ${command}`}>
        <span className="wm-static-line">
          {ansiToNodes(PROMPT(""), "p")}
          {command}
        </span>
        {lines.map((l, i) => (
          <span className="wm-static-line" key={i}>
            {ansiToNodes(l, `l${i}`)}
          </span>
        ))}
        <span className="wm-static-line">
          {ansiToNodes(PROMPT(""), "p2")}
          <span className="wm-static-cursor" />
        </span>
      </pre>
      <button
        type="button"
        className="wm-static-hit"
        onClick={() => setLive(true)}
      >
        <span className="wm-static-hint">click to type</span>
      </button>
    </div>
  );
}
