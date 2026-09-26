import "../../styles/hub.css";
import NavBar from "./NavBar";
import Hero from "./Hero";
import About from "./About";
import WorkExperience from "./WorkExperience";
import Education from "./Education";
import Projects from "./Projects";
import WriteupsShowcase from "./WriteupsShowcase";
import ContactFooter from "./ContactFooter";

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
