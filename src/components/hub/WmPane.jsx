import useInView from "../../lib/useInView";

// A single "window" in the tiling layout: a titlebar (like a WM window
// class name) plus a body, with the border lighting up once it scrolls
// into view — a nod to a WM's active-window highlight.
export default function WmPane({
  id,
  title,
  workspace,
  className = "",
  defaultFocused = false,
  children,
}) {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const focused = inView || defaultFocused;

  return (
    <section
      id={id}
      ref={ref}
      className={`wm-pane ${focused ? "is-focused" : ""} ${className}`}
    >
      <div className="wm-pane-titlebar">
        <span className="wm-pane-dot" />
        <span className="wm-pane-title">{title}</span>
        {workspace && <span className="wm-pane-workspace">{workspace}</span>}
      </div>
      <div className="wm-pane-body">{children}</div>
    </section>
  );
}
