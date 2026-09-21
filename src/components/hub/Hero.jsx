export default function Hero() {
  return (
    <header className="hub-hero">
      <div className="hub-hero-inner">
        <div className="hub-hero-text">
          <p className="hub-hero-prompt">
            visitor@oliverkrauss:~$ whoami<span className="hub-cursor" />
          </p>
          <h1>Oliver Krauss</h1>
          <p className="hub-hero-tagline">cybersecurity analyst</p>
          <p className="hub-hero-bio">
            BBA in Cybersecurity from UTSA with enterprise SOC experience
            across Microsoft Defender, Splunk, and ExtraHop. My focus is
            network forensics and incident response: finding the root
            cause behind a compromise, not just the symptoms.
          </p>
          <div className="hub-hero-ctas">
            <a
              className="hub-btn hub-btn--primary"
              href="/media/resume/OliverKraussResume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              View Resume
            </a>
            <a className="hub-btn hub-btn--ghost" href="#contact">
              Get in Touch
            </a>
          </div>
        </div>
        <img
          className="hub-hero-photo"
          src="/media/images/Profile.jpg"
          alt="Oliver Krauss"
        />
      </div>
    </header>
  );
}
