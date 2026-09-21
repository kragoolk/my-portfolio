import { Link } from "react-router-dom";
import writeups from "../../content/writeups";
import Reveal from "./Reveal";

export default function WriteupsShowcase() {
  return (
    <section id="writeups" className="hub-section hub-section--tight">
      <Reveal>
        <p className="hub-eyebrow">
          <span className="hub-index">05</span> Write-ups
        </p>
        <h2 className="hub-heading">Investigations & analysis</h2>
      </Reveal>
      <div className="hub-index-list">
        {writeups.map((w, i) => (
          <Reveal
            as={Link}
            to={`/writeups/${w.slug}`}
            key={w.slug}
            className="hub-index-row"
          >
            <span className="hub-index-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="hub-index-title">{w.title}</span>
            <span className="hub-index-tags">
              {w.tags.slice(0, 2).map((tag) => (
                <span className="hub-index-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </span>
            <p className="hub-index-summary">{w.summary}</p>
            <span className="hub-index-date">{w.date}</span>
          </Reveal>
        ))}
      </div>

      <Reveal as={Link} to="/gallery" className="hub-callout">
        <p className="hub-callout-title">Prefer exploring in 3D? →</p>
        <p className="hub-callout-desc">
          Step into my interactive 3D gallery — photography, a live
          performance clip, and a more experimental way to browse.
        </p>
      </Reveal>
    </section>
  );
}
