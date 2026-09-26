import { useState } from "react";
import Reveal from "./Reveal";

export default function RoleCard({ title, meta, dates, stack, bullets }) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal className="hub-timeline-item hub-timeline-item--role">
      <button
        type="button"
        className="hub-role-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="hub-role-header">
          <div>
            <p className="hub-timeline-title">{title}</p>
            <p className="hub-timeline-meta">{meta}</p>
          </div>
          <div className="hub-role-toggle-right">
            <p className="hub-role-dates">{dates}</p>
            <span className="hub-role-caret">{open ? "[ − ]" : "[ + ]"}</span>
          </div>
        </div>
      </button>

      <div className="hub-card-tags" style={{ margin: "10px 0" }}>
        {stack.map((tech) => (
          <span className="hub-card-tag" key={tech}>
            {tech}
          </span>
        ))}
      </div>

      <div className={`hub-role-bullets-wrap ${open ? "is-open" : ""}`}>
        <div className="hub-role-bullets-inner">
          <ul className="hub-role-bullets">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
