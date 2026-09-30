import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="hub-section">
      <Reveal>
        <p className="hub-eyebrow">
          <span className="hub-index">01</span> About
        </p>
        <h2 className="hub-heading">Hi, I'm Oliver.</h2>
        <p className="hub-lede">
          I'm a Cybersecurity graduate (BBA, University of Texas at San
          Antonio) with enterprise SOC experience in alert triage, log
          analysis, and incident documentation across Microsoft Defender,
          Splunk, and ExtraHop.
        </p>
        <p className="hub-lede">
          Across everything here I'm doing the same thing: starting from
          evidence and working backwards to what actually happened. That's
          been a 2,449-packet capture rebuilt in Wireshark, a compromised
          Windows XP host traced to anonymous FTP write access rather than
          anything exotic, and a DNS outage in my own house that turned out
          to be a misconfigured packet-capture path stopping dnsmasq from
          starting. Then I write it up, wrong turns included, since
          those are usually the useful part.
        </p>
        <p className="hub-lede">
          I'm comfortable at both ends of the stack. I ran and terminated
          the Cat6 in my own house and split it into trusted and lab VLANs
          under a default-deny policy. At the other end, I mapped an attack
          chain to MITRE ATT&amp;CK techniques in the packet-capture
          write-up below, and during my SOC internship carried out the
          containment side of it: deprovisioning services and
          blocking MAC addresses on confirmed alerts. I'm targeting
          security operations and detection engineering roles.
        </p>
        <p className="hub-lede">
          Outside of work it's more of the same: embedded systems,
          networking, and network security, currently counter-surveillance
          work on an ESP32-C6.
        </p>
      </Reveal>
    </section>
  );
}
