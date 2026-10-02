import { Link } from "react-router-dom";

// Slim quick-links bar at the very bottom of every page. The Contact section
// on the hub is a call to action; this is navigation, so it stays compact and
// repeats on the write-up pages where there is no Contact section above it.
const LINKS = [
  { label: "GitHub", href: "https://github.com/kragoolk" },
  { label: "LinkedIn", href: "https://linkedin.com/in/oliverkrauss" },
  { label: "Email", href: "mailto:olkraussgo@gmail.com", internal: true },
  { label: "Resume", href: "/media/resume/OliverKraussResume.pdf" },
];

export default function SiteFooter() {
  return (
    <div className="hub-quicklinks">
      <div className="hub-quicklinks-inner">
        <nav className="hub-quicklinks-nav" aria-label="Quick links">
          {LINKS.map(({ label, href, internal }) => (
            <a
              key={label}
              href={href}
              {...(internal ? {} : { target: "_blank", rel: "noreferrer" })}
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="hub-quicklinks-meta">
          <Link to="/privacy">Privacy</Link>
          <span className="hub-quicklinks-sep">/</span>
          <span>&copy; {new Date().getFullYear()} Oliver Krauss</span>
        </p>
      </div>
    </div>
  );
}
