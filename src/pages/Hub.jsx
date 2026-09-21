import "../css/hub.css";
import NavBar from "../components/hub/NavBar";
import Hero from "../components/hub/Hero";
import About from "../components/hub/About";
import WorkExperience from "../components/hub/WorkExperience";
import Education from "../components/hub/Education";
import Projects from "../components/hub/Projects";
import WriteupsShowcase from "../components/hub/WriteupsShowcase";
import ContactFooter from "../components/hub/ContactFooter";

export default function Hub() {
  return (
    <div className="hub">
      <NavBar />
      <Hero />
      <About />
      <WorkExperience />
      <Education />
      <Projects />
      <WriteupsShowcase />
      <ContactFooter />
    </div>
  );
}
