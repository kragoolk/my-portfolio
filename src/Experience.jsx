import * as THREE from "three"
import { Group } from "three"
import { forwardRef, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, MeshReflectorMaterial } from "@react-three/drei"
import FloatingCameraControls from "./components/FloatingCameraControls"
import FloatingImage from "./components/FloatingImage"
import FloatingVideo from "./components/FloatingVideo"
import FloatingPaper from "./components/FloatingPaper"
import CrosshairOverlay from "./components/CrosshairOverlay"
import { FloatingSphere, FloatingPoly } from "./components/FloatingObjects"
import ClickHandler from "./components/Raycasting"
import GradientBackground from "./components/GradientBackground"
import CustomPointerControls from "./components/CustomPointerControls"
import TorusKnotHDR from './components/TorusKnotHDR'
import ActionButton from './components/ActionButton'
import MorphingTorusKnotHDR from './components/MorphingTorusKnotHDR'
import ControlsHUD from './components/ControlsHUD'

export default function Experience() {
  const clickablesRef = useRef()
  const hdriUrl = "/media/hdri/qwantani_moon_noon_puresky_4k.exr"
 
  return (
  <>
    <Canvas
      shadows
      camera={{ position: [0, 2, 10], fov: 90 }}
      style={{ width: "100%", height: "100vh" }}
      gl={{ 
	antialias: true,
	toneMapping: THREE.ACESFilmicToneMapping,
	toneMappingExposure: 1.2
      }}
    >
      <Environment files={hdriUrl} background />   

      {/* Lights with shadows */}
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={1.5}
      /> 
      
      <TorusKnotHDR
	hdrPath={hdriUrl}          // <-- your existing HDR file
	exposure={1.0}
	roughness={0.0}
	metalness={1.0}
	position={[0, 2.7, 0.5]}
	scale={2.5}
      />	

        <MorphingTorusKnotHDR
	  hdrPath={hdriUrl}
	  exposure={1.0}
	  roughness={0.18}
	  metalness={1.0}
	  morphStrength={0.1}
	  animationSpeed={0.8}
	  position={[0, 2.7, 0.5]}
	  scale={2.5}
	  
	/>
      {/* Clickable group: all interactable objects go inside here */}
      <group ref={clickablesRef}>
        <FloatingSphere  />
        <FloatingPoly />

        {/* Bottom Row L-R */}
        <FloatingImage url="/media/images/Butterfly.jpg"
                position={[-9, 1.6, -14]} size={4} rotation={[0, Math.PI / 4, 0]} />
        <FloatingImage url="/media/images/BigLandscape.jpg"
                position={[-3.33, 1.6, -17.5]} size={4} rotation={[0, Math.PI / 9, 0]} />
        <FloatingImage url="/media/images/GrassSea.jpg"
                position={[3.33, 1.6, -17.5]} size={4} rotation={[0, -Math.PI / 9, 0]} />
        <FloatingImage url="/media/images/ArchLoop.jpg"
                position={[9, 1.6, -14]} size={4} rotation={[0, -Math.PI / 4, 0]} />

        {/* Top Row L-R */}
        <FloatingVideo url="/media/videos/SORE_HTX.mp4"
                position={[-9, 6, -14]} size={3.5} rotation={[0, Math.PI / 4, 0]} />
        <FloatingImage url="/media/images/Underwater.jpg"
                position={[-3.33, 6, -17.5]} size={4} rotation={[0, Math.PI / 9, 0]} />
        <FloatingImage url="/media/images/LoneCanyon.jpg"
                position={[3.33, 6, -17.5]} size={4} rotation={[0, -Math.PI / 9, 0]} />
        <FloatingImage url="/media/images/CurvyTree.jpg"
                position={[9, 6, -14]} size={4} rotation={[0, -Math.PI / 4, 0]} />

        {/* Certifications */}
        <FloatingImage url="/media/images/SecurityPlus.jpg"
                position={[13.1, 1.4, -7.5]} size={2} rotation={[0, -Math.PI / 3, 0]} />
        <FloatingPaper
          url="/media/images/GCPC.jpg" id="GCPC" webUrl="https://www.coursera.org/account/accomplishments/specialization/A1V1TMEGLL7G"
          position={[12.5, 4.5, -9.5]} size={2.3} rotation={[0, -Math.PI / 3, 0]} />
        <FloatingPaper
          url="/media/images/IBM.jpg" id="IBM" webUrl="https://www.credly.com/badges/60c7bbc5-8bd2-4594-b085-3845f86f8360/email"
          position={[12.3, 7.5, -9.5]} size={2.5} rotation={[0, -Math.PI / 3, 0]} />

        {/* Miscellaneous */}
        <FloatingImage url="/media/images/UTSA.jpg"
                position={[12, 1.4, -10.5]} size={1.7} rotation={[0, -Math.PI / 3, 0]} />
        <FloatingPaper
          url="/media/images/wireshark.jpg"
          id="EventAnalysis_Krauss"
          pdfUrl="/media/papers/EventAnalysis_Krauss.pdf"
          position={[-13, 2, -9.3]}
          size={3}
          rotation={[0, Math.PI / 3, 0]} />

        {/* Action Buttons */}
        <ActionButton
          label="RESUME"
          link="/media/resume/OliverKraussResume.pdf"
          position={[-0.55, 2, 5.5]}
          size={0.5}
          rotation={[0, Math.PI*2, 0]}
        />
        <ActionButton
          label="LINKEDIN"
          link="https://linkedin.com/in/oliverkrauss"
          position={[0.55, 2, 5.5]}
          size={0.5}
          rotation={[0, Math.PI *2, 0]}
        />
        <ActionButton
          label="CONTACT"
          link="mailto:olkraussgo@gmail.com"
          position={[-0.55, 1.4, 5.5]}
          size={0.5}
          rotation={[0, Math.PI *2, 0]}
        />
        <ActionButton
          label="GITHUB"
          link="https://github.com/kragoolk"
          position={[0.55, 1.4, 5.5]}
          size={0.5}
          rotation={[0, Math.PI *2, 0]}
        />

      </group>

      <ClickHandler clickablesRef={clickablesRef} />

      {/* Controls */}
      <CustomPointerControls />
      <FloatingCameraControls speed={0.2} />
      
      {/* Horizon / ground plane */}i
      
	<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} >
	  <planeGeometry args={[1000, 1000]} />
	  <MeshReflectorMaterial
	    blur={[1000, 1000]}        // Blur reflections (horizontal, vertical)
	    mixBlur={0.5}              // How much blur mixes with surface roughness (default = 1)
	    mixStrength={0.5}        // Reflection strength
	    roughness={0.2}          // Surface roughness (0=mirror sharp, 1=matte)
	    resolution={1024}        // Resolution of the reflection render buffer
	    mirror={1}               // 0 = texture colors, 1 = environment map colors
	    depthScale={0.001}        // Depth factor scale of the reflection distortion
	    minDepthThreshold={0.8}  // Lower edge threshold to depth blur interpolation
	    maxDepthThreshold={1}    // Upper edge threshold to depth blur interpolation
	    color="#a4c1db"          // Base color of the plane
	  />
	</mesh>
      

    </Canvas>

      {/* Overlay UI */}
      <CrosshairOverlay size={5} color="rgba(0,0,0,0.95)" styleType="dot" />
      <ControlsHUD />
  </>
 );
i}
