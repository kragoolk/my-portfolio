import Reveal from "./Reveal";

const projects = [
  {
    title: "Cyber Jedis: Red vs. Blue Training Platform",
    role: "Co-Lead & Club Administrator",
    dates: "Aug 2025 – May 2026",
    stack: ["Docker", "Debian", "Python", "Bash", "Redis", "Lua", "Unreal Engine 5"],
    bullets: [
      "Co-led development of a full-stack, gamified red-vs-blue cyber operations platform across 4+ iterations, owning technical direction, coordination of a 6-person team, and external outreach.",
      "Built containerized Debian environments with Redis centralized logging, hardened SSH access, real-time sudo approval workflows, and an Unreal Engine 5 SOC simulation layer; demoed to external audiences.",
      "Served as club administrator, co-leading technical sessions and contributing to post-quantum security research.",
    ],
  },
  {
    title: "Home Network & Segmented Security Lab",
    role: "Designer & Builder",
    dates: "2025 – Present",
    stack: ["EdgeRouter 4 / EdgeOS", "EdgeSwitch", "UniFi", "Pi-hole", "VLANs", "Cat6", "Go", "Docker"],
    bullets: [
      "Designed and built a whole-house Cat6 network from scratch, running home runs from every room to a central distribution point, terminated and tested with a toner/probe kit, on an EdgeRouter 4 core at full fiber throughput.",
      "Implemented end-to-end VLAN segmentation with a trusted zone and an isolated lab zone, enforcing default-deny firewall policy so the lab segment reaches neither the internet nor trusted hosts, which let me safely host an end-of-life Windows system as a contained target.",
      "Deployed network-wide DNS filtering (Pi-hole), a managed EdgeSwitch core with 802.1Q trunking, PoE-powered UniFi access points, and a dedicated hardware controller; added a secondary resolver after diagnosing a single-point-of-failure DNS outage.",
      "Root-caused failures hands-on: recovered a switch stranded on a fallback subnet via static-IP direct connect, and traced a resolver outage to a misconfigured packet-capture path blocking dnsmasq startup.",
      "Developed and published a network scanner in Go, documenting the build as an ongoing technical write-up series.",
    ],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="hub-section hub-section--tight">
      <Reveal>
        <p className="hub-eyebrow">
          <span className="hub-index">04</span> Projects
        </p>
        <h2 className="hub-heading">Things I've built</h2>
      </Reveal>
      <div className="hub-timeline">
        {projects.map((project) => (
          <Reveal key={project.title} className="hub-timeline-item hub-timeline-item--role">
            <div style={{ width: "100%" }}>
              <div className="hub-role-header">
                <div>
                  <p className="hub-timeline-title">{project.title}</p>
                  <p className="hub-timeline-meta">{project.role}</p>
                </div>
                <p className="hub-role-dates">{project.dates}</p>
              </div>
              <div className="hub-card-tags" style={{ margin: "10px 0" }}>
                {project.stack.map((tech) => (
                  <span className="hub-card-tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="hub-role-bullets">
                {project.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
