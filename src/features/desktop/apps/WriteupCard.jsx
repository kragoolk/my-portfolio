import { Link } from "react-router-dom";
import writeups from "../../../content/writeups";

// Newest write-up by date, so this pane never goes stale when one is added.
const latest = [...writeups].sort((a, b) => b.date.localeCompare(a.date))[0];

export default function WriteupCard() {
  if (!latest) return <div className="wm-doc">No write-ups yet.</div>;

  return (
    <Link className="wm-card" to={`/writeups/${latest.slug}`}>
      <img className="wm-card-img" src={latest.heroImage} alt="" />
      <div className="wm-card-meta">
        <p className="wm-card-kicker">
          <span className="wm-card-dot" />
          latest write-up
          <span className="wm-card-date">{latest.date}</span>
        </p>
        <p className="wm-card-title">{latest.title}</p>
        <p className="wm-card-tags">{latest.tags.join(" · ")}</p>
        <p className="wm-card-cta">open →</p>
      </div>
    </Link>
  );
}
