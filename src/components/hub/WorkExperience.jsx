import RoleCard from "./RoleCard";

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
      "Completed a full security system installation solo on a residence lacking keypad prewire: traced a spare 4-conductor run from the smoke loop, located and rejoined mid-run splices, and repurposed it to establish supervision to the head-end without opening finished drywall.",
    ],
  },
  {
    title: "SOC Analyst Intern",
    company: "University of Texas at San Antonio",
    dates: "Jan – Mar 2026",
    stack: ["MS Defender", "ExtraHop", "Abnormal AI", "Duo", "ServiceNow", "Infoblox/BloxOne"],
    bullets: [
      "Triaged 40+ security alerts over 8 weeks, performing log analysis, root cause analysis, and containment actions including service deprovisioning and MAC address blocking.",
      "Escalated one alert that resulted in a confirmed incident; documented all findings in ServiceNow tickets written for both technical staff and management audiences.",
    ],
  },
  {
    title: "Junior Cybersecurity Analyst",
    company: "BEAT LLC",
    dates: "Oct 2025 – Jan 2026",
    stack: ["Nessus", "Kali", "STIGs", "POAMs", "KnowBe4", "Snort", "PfSense"],
    bullets: [
      "Performed STIG compliance reviews and POAM documentation workflows in a federal contractor environment under direct mentorship of a cybersecurity director.",
      "Ran Nessus-based external attack surface assessment and vulnerability enumeration against DoD-adjacent infrastructure.",
    ],
  },
  {
    title: "Quantum Research Team Member",
    company: "UTSA · Post-Quantum Security Forensics",
    dates: "Aug 2025 – Feb 2026",
    stack: ["Post-Quantum Cryptography", "Cost-Benefit Analysis", "Grant Research", "Financial Modeling"],
    bullets: [
      "Conducted post-quantum cryptographic migration research and cost-benefit analysis in support of the Texas Quantum Initiative funding proposal, a $500M state pool.",
      "Developed financial models and technical feasibility assessments supporting UTSA's quantum infrastructure grant application under Texas House Bill 4751.",
    ],
  },
];

export default function WorkExperience() {
  return (
    <>
      <h2 className="hub-heading">Where I've worked</h2>
      <div className="hub-timeline">
        {roles.map((role) => (
          <RoleCard
            key={role.title}
            title={role.title}
            meta={role.company}
            dates={role.dates}
            stack={role.stack}
            bullets={role.bullets}
          />
        ))}
      </div>
    </>
  );
}
