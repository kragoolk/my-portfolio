import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useActiveSection from "../../lib/useActiveSection";

const WORKSPACES = [
  { id: "about", num: 1, label: "about", href: "/#about" },
  { id: "experience", num: 2, label: "exp", href: "/#experience" },
  { id: "education", num: 3, label: "edu", href: "/#education" },
  { id: "projects", num: 4, label: "proj", href: "/#projects" },
  { id: "writeups", num: 5, label: "docs", href: "/writeups" },
  { id: "contact", num: 6, label: "mail", href: "/#contact" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function StatusBar() {
  const active = useActiveSection(WORKSPACES.map((w) => w.id));
  const clock = useClock();

  return (
    <nav className="wm-bar">
      <div className="wm-bar-inner">
        <Link to="/" className="wm-bar-brand">
          oliver-krauss
        </Link>

        <ul className="wm-bar-workspaces">
          {WORKSPACES.map((w) => (
            <li key={w.id}>
              <a
                href={w.href}
                className={active === w.id ? "is-active" : ""}
                aria-label={w.label}
              >
                <span className="wm-ws-num">{w.num}</span>
                <span className="wm-ws-label">{w.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="wm-bar-tray">
          <span className="wm-bar-clock">{clock}</span>
          <a
            href="/media/resume/OliverKraussResume.pdf"
            target="_blank"
            rel="noreferrer"
          >
            resume
          </a>
          <Link to="/gallery" className="wm-bar-cta">
            3d-gallery
          </Link>
        </div>
      </div>
    </nav>
  );
}
