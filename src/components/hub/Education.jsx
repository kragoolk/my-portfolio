import Reveal from "./Reveal";

const items = [
  {
    title: "University of Texas at San Antonio",
    meta: "BBA, Cyber Security — Major GPA 3.66 — Graduated May 2026",
    desc: "Coursework centered on network security, incident handling, and forensic analysis, including hands-on packet-capture and Windows/Linux investigation labs.",
    image: "/media/images/UTSA.jpg",
  },
  {
    title: "CompTIA Security+",
    meta: "In Progress",
    desc: "Foundational certification covering network security, threats and vulnerabilities, identity/access management, and security operations.",
    image: "/media/images/SecurityPlus.jpg",
  },
  {
    title: "Google Cybersecurity Professional Certificate",
    meta: "Acquired July 2025",
    desc: "Cyber Threat Intelligence, Cyber Attacks, Cloud Security, Bash, Network Security, Threat Management, Vulnerability Management, Computer Security Incident Management, SQL, Python.",
    image: "/media/images/GCPC.jpg",
    link: "https://www.coursera.org/account/accomplishments/specialization/A1V1TMEGLL7G",
  },
  {
    title: "IBM Cloud Computing Fundamentals",
    meta: "Certification",
    desc: "Cloud services, deployment models, virtualization, orchestration, and cloud security — including deploying a containerized web app and analyzing security in a simulated environment.",
    image: "/media/images/IBM.jpg",
    link: "https://www.credly.com/badges/60c7bbc5-8bd2-4594-b085-3845f86f8360/email",
  },
];

export default function Education() {
  return (
    <section id="education" className="hub-section hub-section--tight">
      <Reveal>
        <p className="hub-eyebrow">
          <span className="hub-index">03</span> Education & Certifications
        </p>
        <h2 className="hub-heading">Where I've built my foundation</h2>
      </Reveal>
      <div className="hub-timeline">
        {items.map((item) => {
          const Wrapper = item.link ? "a" : "div";
          const wrapperProps = item.link
            ? { href: item.link, target: "_blank", rel: "noreferrer" }
            : {};
          return (
            <Reveal as={Wrapper} key={item.title} className="hub-timeline-item" {...wrapperProps}>
              <img className="hub-timeline-badge" src={item.image} alt="" />
              <div>
                <p className="hub-timeline-title">{item.title}</p>
                <p className="hub-timeline-meta">{item.meta}</p>
                <p className="hub-timeline-desc">{item.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
