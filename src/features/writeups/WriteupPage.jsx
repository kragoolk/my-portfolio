import { Link, useParams, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import "../../styles/hub.css";
import "../../styles/writeup.css";
import NavBar from "../hub/NavBar";
import ContactFooter from "../hub/ContactFooter";
import { getWriteup } from "../../content/writeups";

export default function WriteupPage() {
  const { slug } = useParams();
  const writeup = getWriteup(slug);

  if (!writeup) return <Navigate to="/writeups" replace />;

  return (
    <div className="hub">
      <NavBar />
      <article className="hub-section">
        <Link to="/writeups" className="writeup-back">
          ← Back to write-ups
        </Link>

        <div className="writeup-header">
          <img className="writeup-hero" src={writeup.heroImage} alt="" />
          <div className="writeup-meta">
            <span>{writeup.date}</span>
            <span>·</span>
            <span>{writeup.tags.join(", ")}</span>
          </div>
          <h1 className="hub-heading">{writeup.title}</h1>
        </div>

        <div className="writeup-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {writeup.content}
          </ReactMarkdown>
        </div>

        <div className="writeup-download">
          <a
            className="hub-btn hub-btn--primary"
            href={writeup.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {writeup.sourceLabel || "Download Original"}
          </a>
        </div>
      </article>
      <ContactFooter />
    </div>
  );
}
