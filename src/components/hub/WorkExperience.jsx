import Reveal from "./Reveal";

const roles = [
  {
    title: "Installation Technician",
    company: "Dominion TX Design & Integration",
    dates: "Jun 2026 – Present",
    stack: ["Control4", "Lutron", "DSC PowerSeries Neo", "UniFi", "Structured Cabling"],
    bullets: [
      "Build and commission integrated low-voltage systems (security, lighting, shades, AV, and network) for high-profile residential clients, with all subsystems centralized through Control4 over client network infrastructure.",
      "Provision, enroll, and troubleshoot hardwired and wireless device fleets; run, terminate, and label keypad and device loops; configure scheduled and trigger-based automation logic across whole-home deployments.",
      "Trace, test, and commission smoke and CO life-safety loops to specification, including end-of-line supervision and head-end verification.",
      "Completed a full security system installation solo on a residence lacking keypad prewire — traced a spare 4-conductor run from the smoke loop, located and rejoined mid-run splices, and repurposed it to establish supervision to the head-end without opening finished drywall.",
    ],
  },
  {
    title: "SOC Analyst Intern",
    company: "University of Texas at San Antonio",
    dates: "Jan – Mar 2026",
    stack: ["MS Defender", "ExtraHop", "Abnormal AI", "Duo", "ServiceNow"],
    bullets: [
      "Triaged 40+ security alerts over 8 weeks, performing log analysis, root cause analysis, and containment actions including service deprovisioning and MAC address blocking.",
      "Escalated one alert that resulted in a confirmed incident; documented all findings in ServiceNow tickets written for both technical staff and management audiences.",
    ],
  },
  {
    title: "Junior Cybersecurity Analyst",
    company: "BEAT LLC",
    dates: "Oct 2025 – Jan 2026",
    stack: ["Nessus", "Kali", "STIGs", "POAMs", "KnowBe4"],
    bullets: [
      "Performed STIG compliance reviews and POAM documentation workflows in a federal contractor environment under direct mentorship of a cybersecurity director.",
      "Ran Nessus-based external attack surface assessment and vulnerability enumeration against DoD-adjacent infrastructure.",
    ],
  },
];

export default function WorkExperience() {
  return (
    <section id="experience" className="hub-section hub-section--tight">
      <Reveal>
        <p className="hub-eyebrow">
          <span className="hub-index">02</span> Experience
        </p>
        <h2 className="hub-heading">Where I've worked</h2>
      </Reveal>
      <div className="hub-timeline">
        {roles.map((role) => (
          <Reveal key={role.title} className="hub-timeline-item hub-timeline-item--role">
            <div style={{ width: "100%" }}>
              <div className="hub-role-header">
                <div>
                  <p className="hub-timeline-title">{role.title}</p>
                  <p className="hub-timeline-meta">{role.company}</p>
                </div>
                <p className="hub-role-dates">{role.dates}</p>
              </div>
              <div className="hub-card-tags" style={{ margin: "10px 0" }}>
                {role.stack.map((tech) => (
                  <span className="hub-card-tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="hub-role-bullets">
                {role.bullets.map((b, i) => (
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
