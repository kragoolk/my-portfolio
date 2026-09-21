import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="hub-nav">
      <div className="hub-nav-inner">
        <Link to="/" className="hub-nav-brand">
          oliver-krauss
        </Link>
        <ul className="hub-nav-links">
          <li>
            <a href="/#about">About</a>
          </li>
          <li>
            <a href="/#experience">Experience</a>
          </li>
          <li>
            <Link to="/writeups">Write-ups</Link>
          </li>
          <li>
            <a
              href="/media/resume/OliverKraussResume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Resume
            </a>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>
          <li>
            <Link to="/gallery" className="hub-nav-cta">
              3D Gallery
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
