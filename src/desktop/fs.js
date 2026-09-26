import writeups from "../content/writeups";

// A read-only virtual filesystem. Nothing here is fake filler: every file is
// the same content the hub renders, so the terminal and the site can't drift.

const dir = (children) => ({ type: "dir", children });
const file = (content) => ({ type: "file", content: content.trim() + "\n" });
const link = (href, label) => ({ type: "link", href, label });

const role = ({ title, org, dates, stack, bullets }) =>
  file(
    [
      `# ${title}`,
      `${org}`,
      `${dates}`,
      "",
      `Stack: ${stack.join(", ")}`,
      "",
      ...bullets.map((b) => `- ${b}`),
    ].join("\n")
  );

export const tree = dir({
  "about.md": file(`
# Oliver Krauss

Cybersecurity analyst. BBA in Cyber Security, University of Texas at San
Antonio (Major GPA 3.66, graduated May 2026).

Enterprise SOC experience in alert triage, log analysis and incident
documentation across Microsoft Defender, Splunk and ExtraHop. My focus is
network forensics and incident response: reconstructing what happened in a
compromise from packet captures and system artifacts, then writing it up
clearly enough that someone without a security background can act on it.

Comfortable at both ends of the stack, from cable termination and network
provisioning through to MITRE ATT&CK mapping and containment. Currently
targeting security operations and detection engineering roles.

Outside of work I play keyboard in a band and spend a lot of time outdoors
with a camera. Both show up in the 3D gallery.
`),

  "contact.md": file(`
# Contact

GitHub   github.com/oliverkrauss
Site     oliverkrauss.space
Location San Antonio, Texas

Open to security operations and detection engineering roles.
Run \`open resume\` to pull up the PDF.
`),

  "resume.pdf": link("/media/resume/OliverKraussResume.pdf", "Resume (PDF)"),

  experience: dir({
    "dominion-tx.md": role({
      title: "Installation Technician",
      org: "Dominion TX Design & Integration",
      dates: "Jun 2026 - Present",
      stack: ["Control4", "Lutron", "DSC PowerSeries Neo", "UniFi", "Structured Cabling"],
      bullets: [
        "Build and commission integrated low-voltage systems (security, lighting, shades, AV, network) for high-profile residential clients, centralized through Control4 over client network infrastructure.",
        "Provision, enroll and troubleshoot hardwired and wireless device fleets; run, terminate and label keypad and device loops; configure scheduled and trigger-based automation across whole-home deployments.",
        "Trace, test and commission smoke and CO life-safety loops to specification, including end-of-line supervision and head-end verification.",
        "Completed a full security system installation solo on a residence lacking keypad prewire: traced a spare 4-conductor run from the smoke loop, located and rejoined mid-run splices, and repurposed it to establish supervision to the head-end without opening finished drywall.",
      ],
    }),
    "utsa-soc.md": role({
      title: "SOC Analyst Intern",
      org: "University of Texas at San Antonio",
      dates: "Jan - Mar 2026",
      stack: ["MS Defender", "ExtraHop", "Abnormal AI", "Duo", "ServiceNow", "Infoblox/BloxOne"],
      bullets: [
        "Triaged 40+ security alerts over 8 weeks, performing log analysis, root cause analysis and containment actions including service deprovisioning and MAC address blocking.",
        "Escalated one alert that resulted in a confirmed incident; documented findings in ServiceNow tickets written for both technical staff and management audiences.",
      ],
    }),
    "beat-llc.md": role({
      title: "Junior Cybersecurity Analyst",
      org: "BEAT LLC",
      dates: "Oct 2025 - Jan 2026",
      stack: ["Nessus", "Kali", "STIGs", "POAMs", "KnowBe4", "Snort", "PfSense"],
      bullets: [
        "Performed STIG compliance reviews and POAM documentation workflows in a federal contractor environment under direct mentorship of a cybersecurity director.",
        "Ran Nessus-based external attack surface assessment and vulnerability enumeration against DoD-adjacent infrastructure.",
      ],
    }),
    "utsa-quantum.md": role({
      title: "Quantum Research Team Member",
      org: "UTSA - Post-Quantum Security Forensics",
      dates: "Aug 2025 - Feb 2026",
      stack: ["Post-Quantum Cryptography", "Cost-Benefit Analysis", "Grant Research"],
      bullets: [
        "Conducted post-quantum cryptographic migration research and cost-benefit analysis in support of the Texas Quantum Initiative funding proposal, a $500M state pool.",
        "Developed financial models and technical feasibility assessments supporting UTSA's quantum infrastructure grant application under Texas House Bill 4751.",
      ],
    }),
  }),

  projects: dir({
    "cyber-jedis.md": role({
      title: "Cyber Jedis: Red vs. Blue Training Platform",
      org: "Co-Lead & Club Administrator",
      dates: "Aug 2025 - May 2026",
      stack: ["Docker", "Debian", "Python", "Bash", "Redis", "Lua", "Unreal Engine 5"],
      bullets: [
        "Co-led development of a full-stack, gamified red-vs-blue cyber operations platform across 4+ iterations, owning technical direction, coordination of a 6-person team and external outreach.",
        "Built containerized Debian environments with Redis centralized logging, hardened SSH access, real-time sudo approval workflows and an Unreal Engine 5 SOC simulation layer.",
        "Served as club administrator, co-leading technical sessions and contributing to post-quantum security research.",
      ],
    }),
    "home-network-lab.md": role({
      title: "Home Network & Segmented Security Lab",
      org: "Designer & Builder",
      dates: "2025 - Present",
      stack: ["EdgeRouter 4", "EdgeSwitch", "UniFi", "Pi-hole", "VLANs", "Cat6", "Go", "Docker"],
      bullets: [
        "Designed and built a whole-house Cat6 network from scratch, home runs from every room to a central distribution point, terminated and tested with a toner/probe kit, on an EdgeRouter 4 core at full fiber throughput.",
        "Implemented end-to-end VLAN segmentation with a trusted zone and an isolated lab zone, default-deny firewall policy so the lab segment reaches neither the internet nor trusted hosts, which let me safely host an end-of-life Windows system as a contained target.",
        "Deployed network-wide DNS filtering (Pi-hole), a managed EdgeSwitch core with 802.1Q trunking, PoE-powered UniFi access points and a dedicated hardware controller; added a secondary resolver after diagnosing a single-point-of-failure DNS outage.",
        "Root-caused failures hands-on: recovered a switch stranded on a fallback subnet via static-IP direct connect, and traced a resolver outage to a misconfigured packet-capture path blocking dnsmasq startup.",
        "Developed and published a network scanner in Go, documenting the build as an ongoing technical write-up series.",
      ],
    }),
    "arch-workstation.md": role({
      title: "Arch Linux Cyber Operations Workstation",
      org: "Maintainer",
      dates: "Spring 2025 - Present",
      stack: ["Arch Linux", "Docker", "Metasploit", "Wireshark", "Python", "Bash", "Go"],
      bullets: [
        "Maintain a customized Arch Linux workstation as a daily-driver lab environment, integrating Docker-based security tools, Metasploit and Wireshark for hands-on testing.",
        "Developed small Python and Bash utilities to automate log collection and network analysis workflows used in practice investigations.",
      ],
    }),
  }),

  education: dir({
    "utsa.md": file(`
# University of Texas at San Antonio
BBA, Cyber Security - Major GPA 3.66 - Graduated May 2026

Coursework centered on network security, incident handling and forensic
analysis, including hands-on packet-capture and Windows/Linux investigation
labs, plus introductory AWS cloud labs.
`),
    "security-plus.md": file(`
# CompTIA Security+
In Progress

Network security, threats and vulnerabilities, identity and access
management, and security operations.
`),
    "google-cybersecurity.md": file(`
# Google Cybersecurity Professional Certificate
Acquired July 2025

Cyber threat intelligence, cyber attacks, cloud security, Bash, network
security, threat management, vulnerability management, incident management,
SQL and Python.
`),
    "ibm-cloud.md": file(`
# IBM Cloud Computing Fundamentals

Cloud services, deployment models, virtualization, orchestration and cloud
security, including deploying a containerized web app and analyzing security
in a simulated environment.
`),
  }),

  // Built from the same index the /writeups route renders.
  writeups: dir(
    Object.fromEntries(
      writeups.map((w) => [
        `${w.slug}.md`,
        file(
          [
            `# ${w.title}`,
            `${w.date} - ${w.tags.join(", ")}`,
            "",
            w.summary,
            "",
            "---",
            "",
            w.content,
          ].join("\n")
        ),
      ])
    )
  ),
});

// --- path helpers -------------------------------------------------------

export function normalize(cwd, target) {
  if (!target) return cwd;
  const abs = target.startsWith("/");
  const parts = (abs ? target : `${cwd}/${target}`).split("/");
  const out = [];
  for (const p of parts) {
    if (!p || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return "/" + out.join("/");
}

export function resolve(path) {
  const parts = path.split("/").filter(Boolean);
  let node = tree;
  for (const p of parts) {
    if (node.type !== "dir" || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

export function listDir(path) {
  const node = resolve(path);
  if (!node || node.type !== "dir") return null;
  return Object.entries(node.children).map(([name, n]) => ({ name, node: n }));
}
