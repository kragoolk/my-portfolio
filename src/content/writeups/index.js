import eventAnalysisMd from "./event-analysis.md?raw";
import rootCauseMd from "./root-cause.md?raw";
import windows7BreakinMd from "./windows7-breakin.md?raw";

const writeups = [
  {
    slug: "windows7-breakin",
    title: "Ten Minutes to Pwned: An Estate-Sale Windows 7 Break-In",
    date: "2026-09-14",
    tags: ["Physical Access", "Offline Attacks", "chntpw"],
    summary:
      "Bypassing a Windows 7 login with an offline SAM edit on a secondhand Dell — and the wrong-drive detour that turned a ten-minute exercise into a lesson about full-disk encryption.",
    heroImage: "/media/writeups/windows7-breakin/01-kali-boot.jpg",
    sourceUrl: "/media/papers/Windows7Breakin_Krauss.docx",
    sourceLabel: "Download Original (DOCX)",
    content: windows7BreakinMd,
  },
  {
    slug: "event-analysis",
    title: "Event Analysis: Network Packet Capture Forensics",
    date: "2025-09-21",
    tags: ["Network Forensics", "Wireshark", "Incident Response"],
    summary:
      "Forensic analysis of a home network packet capture revealing exploitation of a zero-day FTP vulnerability, lateral movement, and probable data exfiltration.",
    heroImage: "/media/images/wireshark.jpg",
    sourceUrl: "/media/papers/EventAnalysis_Krauss.pdf",
    sourceLabel: "Download Original (PDF)",
    content: eventAnalysisMd,
  },
  {
    slug: "root-cause",
    title: "Root Cause Analysis: Windows XP Compromise",
    date: "2025-10-15",
    tags: ["Root Cause Analysis", "Malware", "Windows Forensics"],
    summary:
      "Root cause investigation of a Windows XP workstation compromised via anonymous FTP and malware bundled with pirated software, resulting in full SYSTEM-level backdoor access.",
    heroImage: "/media/images/ZenmapImage.jpg",
    sourceUrl: "/media/papers/RootCause_Krauss.pdf",
    sourceLabel: "Download Original (PDF)",
    content: rootCauseMd,
  },
];

export default writeups;

export const getWriteup = (slug) => writeups.find((w) => w.slug === slug);
