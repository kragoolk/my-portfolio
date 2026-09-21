import "../css/hub.css";
import StatusBar from "../components/hub/StatusBar";
import WmPane from "../components/hub/WmPane";
import NeofetchPane from "../components/hub/NeofetchPane";
import MatrixRainPane from "../components/hub/MatrixRainPane";
import AsciiquariumPane from "../components/hub/AsciiquariumPane";
import About from "../components/hub/About";
import WorkExperience from "../components/hub/WorkExperience";
import Education from "../components/hub/Education";
import Projects from "../components/hub/Projects";
import WriteupsShowcase from "../components/hub/WriteupsShowcase";
import ContactFooter from "../components/hub/ContactFooter";

export default function Hub() {
  return (
    <div className="hub">
      <StatusBar />

      <div className="wm-workspace wm-workspace--hero">
        <WmPane title="neofetch" defaultFocused>
          <NeofetchPane />
        </WmPane>
        <div className="wm-workspace-side">
          <WmPane title="cmatrix" className="wm-pane--toy">
            <MatrixRainPane />
          </WmPane>
          <WmPane title="asciiquarium" className="wm-pane--toy">
            <AsciiquariumPane />
          </WmPane>
        </div>
      </div>

      <div className="wm-workspace">
        <WmPane id="about" title="~/about.md" workspace="[ 1 ]">
          <About />
        </WmPane>
      </div>

      <div className="wm-workspace">
        <WmPane id="experience" title="nvim ~/experience.log" workspace="[ 2 ]">
          <WorkExperience />
        </WmPane>
      </div>

      <div className="wm-workspace">
        <WmPane id="education" title="~/education.json" workspace="[ 3 ]">
          <Education />
        </WmPane>
      </div>

      <div className="wm-workspace">
        <WmPane id="projects" title="~/projects" workspace="[ 4 ]">
          <Projects />
        </WmPane>
      </div>

      <div className="wm-workspace">
        <WmPane id="writeups" title="~/writeups --list" workspace="[ 5 ]">
          <WriteupsShowcase />
        </WmPane>
      </div>

      <div className="wm-workspace">
        <WmPane id="contact" title="mail ~/contact" workspace="[ 6 ]" className="wm-pane--alt">
          <ContactFooter />
        </WmPane>
      </div>
    </div>
  );
}
