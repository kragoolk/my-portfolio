export default function ContactFooter() {
  return (
    <>
      <h2 className="hub-heading">Let's talk.</h2>
      <p className="hub-lede">
        Open to internships, SOC/analyst roles, and anything security
        research related. Reach out directly, or grab my resume.
      </p>
      <div className="hub-footer-links">
        <a href="mailto:olkraussgo@gmail.com">Email</a>
        <a href="https://linkedin.com/in/oliverkrauss" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/kragoolk" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="/media/resume/OliverKraussResume.pdf" target="_blank" rel="noreferrer">
          Resume (PDF)
        </a>
      </div>
      <p className="hub-footer-copyright">
        © {new Date().getFullYear()} Oliver Krauss
      </p>
    </>
  );
}
