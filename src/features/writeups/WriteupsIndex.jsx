import { Link } from "react-router-dom";
import "../../styles/hub.css";
import NavBar from "../hub/NavBar";
import ContactFooter from "../hub/ContactFooter";
import writeups from "../../content/writeups";

export default function WriteupsIndex() {
  return (
    <div className="hub">
      <NavBar />
      <section className="hub-section">
        <p className="hub-eyebrow">Write-ups</p>
        <h1 className="hub-heading">Investigations & analysis</h1>
        <p className="hub-lede" style={{ marginBottom: 40 }}>
          Forensic write-ups from my cybersecurity coursework and personal
          projects — packet captures, compromised hosts, and the reasoning
          behind each conclusion.
        </p>
        <div className="hub-index-list">
          {writeups.map((w, i) => (
            <Link to={`/writeups/${w.slug}`} key={w.slug} className="hub-index-row">
              <span className="hub-index-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="hub-index-title">{w.title}</span>
              <span className="hub-index-tags">
                {w.tags.map((tag) => (
                  <span className="hub-index-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
              <p className="hub-index-summary">{w.summary}</p>
              <span className="hub-index-date">{w.date}</span>
            </Link>
          ))}
        </div>
      </section>
      <ContactFooter />
    </div>
  );
}
