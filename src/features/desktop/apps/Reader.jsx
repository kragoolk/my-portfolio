import { listDir, resolve } from "../fs";

// Minimal renderer for the virtual filesystem's markdown-ish files. Not a full
// markdown parser: these files only use headings, bullets and paragraphs.
function renderFile(text, key) {
  return text.split("\n").map((line, i) => {
    const k = `${key}-${i}`;
    if (line.startsWith("# ")) return <h2 key={k} className="wm-doc-h1">{line.slice(2)}</h2>;
    if (line.startsWith("## ")) return <h3 key={k} className="wm-doc-h2">{line.slice(3)}</h3>;
    if (line.startsWith("- ")) return <li key={k} className="wm-doc-li">{line.slice(2)}</li>;
    if (line.startsWith("Stack: ")) return <p key={k} className="wm-doc-stack">{line.slice(7)}</p>;
    if (line === "---") return <hr key={k} className="wm-doc-rule" />;
    if (!line.trim()) return <div key={k} className="wm-doc-gap" />;
    return <p key={k} className="wm-doc-p">{line}</p>;
  });
}

const SOURCES = {
  about: { kind: "file", path: "/about.md" },
  experience: { kind: "dir", path: "/experience" },
};

export default function Reader({ app }) {
  const src = SOURCES[app];
  if (!src) return <div className="wm-doc">Nothing here.</div>;

  if (src.kind === "file") {
    const node = resolve(src.path);
    return <div className="wm-doc">{node ? renderFile(node.content, app) : "Not found."}</div>;
  }

  const entries = listDir(src.path) ?? [];
  return (
    <div className="wm-doc">
      {entries.map(({ name, node }) => (
        <section key={name} className="wm-doc-entry">
          <p className="wm-doc-file">{name}</p>
          {renderFile(node.content, name)}
        </section>
      ))}
    </div>
  );
}
