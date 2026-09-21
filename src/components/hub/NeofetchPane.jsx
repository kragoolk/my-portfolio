const INFO = [
  ["OS", "Oliver Krauss"],
  ["Host", "Cybersecurity Analyst"],
  ["Kernel", "BBA, Cyber Security (UTSA)"],
  ["Uptime", "since 2023, still building"],
  ["Shell", "/bin/zsh --focus=blue-team"],
  ["DE", "hyprland + waybar"],
  ["CPU", "Network Forensics (6 threads)"],
  ["Memory", "Incident Response / Detection Eng."],
  ["Theme", "Amber-on-Black [Flat]"],
];

const SWATCHES = [
  "#0a0a0a",
  "#2a2a2a",
  "#97948a",
  "#f2f1ec",
  "#ffb454",
  "#e0a04c",
  "#7a5c2e",
  "#5c4522",
];

export default function NeofetchPane() {
  return (
    <div className="neofetch">
      <p className="hub-hero-prompt">
        visitor@oliverkrauss:~$ neofetch<span className="hub-cursor" />
      </p>
      <div className="neofetch-body">
        <img
          className="neofetch-mark"
          src="/media/images/Profile.jpg"
          alt="Oliver Krauss"
        />
        <div className="neofetch-info">
          <p className="neofetch-title">visitor@oliverkrauss</p>
          <p className="neofetch-rule">──────────────────────</p>
          {INFO.map(([label, value]) => (
            <p key={label} className="neofetch-row">
              <span className="neofetch-label">{label}</span>
              <span className="neofetch-value">{value}</span>
            </p>
          ))}
          <div className="neofetch-swatches">
            {SWATCHES.map((c, i) => (
              <span key={i} className="neofetch-swatch" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <p className="hub-hero-bio">
        BBA in Cybersecurity from UTSA with enterprise SOC experience
        across Microsoft Defender, Splunk, and ExtraHop. My focus is
        network forensics and incident response: finding the root cause
        behind a compromise, not just the symptoms.
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
  );
}
