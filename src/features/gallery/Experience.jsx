import * as THREE from "three"
import { Group } from "three"
import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, MeshReflectorMaterial, Sparkles } from "@react-three/drei"
import FloatingCameraControls from "./FloatingCameraControls"
import FloatingImage from "./FloatingImage"
import FloatingVideo from "./FloatingVideo"
import CrosshairOverlay from "./CrosshairOverlay"
import Collectible from "./Collectible"
import CollectibleHUD from "./CollectibleHUD"
import ClickHandler from "./Raycasting"
import CustomPointerControls from "./CustomPointerControls"
import MorphingTorusKnotHDR from './MorphingTorusKnotHDR'
import ControlsHUD from './ControlsHUD'

const SKIES = [
  { name: "Day", file: "/media/hdri/kloofendal_48d_partly_cloudy_puresky_2k.hdr", sparkleColor: "#ffffff", ambient: 1.5, directional: 1.3, exposure: 0.9 },
  { name: "Golden Hour", file: "/media/hdri/citrus_orchard_puresky_2k.hdr", sparkleColor: "#ffd08a", ambient: 1.6, directional: 1.4, exposure: 0.9 },
  // The night HDR is a low-luminance environment map, so the scene goes
  // nearly black at a normal tone-mapping exposure. Boost the renderer's
  // global exposure (set below via MorphingTorusKnotHDR) well above the
  // daytime level so objects stay visible.
  { name: "Night", file: "/media/hdri/qwantani_moon_noon_puresky_2k.exr", sparkleColor: "#bcd4ff", ambient: 3.5, directional: 2.4, exposure: 3.2 },
]

const COLLECTIBLES = [
  { id: "crystal-1", position: [-16, 6, -3], geometry: "icosahedron", color: "#ff5555" },
  { id: "crystal-2", position: [18, 5, -8], geometry: "octahedron", color: "#4fd6ff" },
  { id: "crystal-3", position: [0, 9, -22], geometry: "sphere", color: "#ffd35e", size: 1.1 },
  { id: "crystal-4", position: [-5, 2, 5], geometry: "torus", color: "#c084fc" },
  { id: "crystal-5", position: [14, 7, -3], geometry: "icosahedron", color: "#4ade80" },
  { id: "crystal-6", position: [-9, 1.4, -1], geometry: "octahedron", color: "#ff8fd6", size: 0.85 },
]

export default function Experience() {
  const clickablesRef = useRef()
  const [skyIndex, setSkyIndex] = useState(0)
  const sky = SKIES[skyIndex]

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === "n") {
        setSkyIndex((i) => (i + 1) % SKIES.length)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
  <>
    <Canvas
      camera={{ position: [0, 2, 10], fov: 90 }}
      style={{ width: "100%", height: "100vh" }}
      gl={{
	antialias: true,
	toneMapping: THREE.ACESFilmicToneMapping,
	toneMappingExposure: 1.2
      }}
    >
      <Environment files={sky.file} background />

      {/* Lights with shadows */}
      <ambientLight intensity={sky.ambient} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={sky.directional}
      />

        <MorphingTorusKnotHDR
	  exposure={sky.exposure}
	  roughness={0.02}
	  metalness={0.1}
	  morphStrength={1}
	  animationSpeed={0.3}
	  position={[0, 2.7, 0.5]}
	  scale={2}

	/>

      {/* Ambient atmosphere — tints with the current sky mood */}
      <Sparkles count={150} scale={[50, 22, 50]} size={2.5} speed={0.25} opacity={0.5} color={sky.sparkleColor} />

      {/* Clickable group: all interactable objects go inside here */}
      <group ref={clickablesRef}>
        {COLLECTIBLES.map((c) => (
          <Collectible key={c.id} {...c} />
        ))}

        {/* Bottom Row L-R */}
        <FloatingImage id="butterfly" url="/media/images/Butterfly.jpg"
                position={[-9, 1.6, -14]} size={4} rotation={[0, Math.PI / 4, 0]} />
        <FloatingImage id="biglandscape" url="/media/images/BigLandscape.jpg"
                position={[-3.33, 1.6, -17.5]} size={4} rotation={[0, Math.PI / 9, 0]} />
        <FloatingImage id="grasssea" url="/media/images/GrassSea.jpg"
                position={[3.33, 1.6, -17.5]} size={4} rotation={[0, -Math.PI / 9, 0]} />
        <FloatingImage id="archloop" url="/media/images/ArchLoop.jpg"
                position={[9, 1.6, -14]} size={4} rotation={[0, -Math.PI / 4, 0]} />

        {/* Top Row L-R */}
        <FloatingVideo id="sore_htx" url="/media/videos/SORE_HTX_web.mp4"
                position={[-9, 6, -14]} size={3.5} rotation={[0, Math.PI / 4, 0]} />
        <FloatingImage id="underwater" url="/media/images/Underwater.jpg"
                position={[-3.33, 6, -17.5]} size={4} rotation={[0, Math.PI / 9, 0]} />
        <FloatingImage id="lonecanyon" url="/media/images/LoneCanyon.jpg"
                position={[3.33, 6, -17.5]} size={4} rotation={[0, -Math.PI / 9, 0]} />
        <FloatingImage id="curvytree" url="/media/images/CurvyTree.jpg"
                position={[9, 6, -14]} size={4} rotation={[0, -Math.PI / 4, 0]} />

      </group>

      <ClickHandler clickablesRef={clickablesRef} />

      {/* Controls */}
      <CustomPointerControls sensitivity={1.5} />
      <FloatingCameraControls speed={0.09} />

      {/* Horizon / ground plane */}

	<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} >
	  <planeGeometry args={[1000, 1000]} />
	  <MeshReflectorMaterial
	    blur={[100, 100]}        // Blur reflections (horizontal, vertical)
	    mixBlur={0.5}              // How much blur mixes with surface roughness (default = 1)
	    mixStrength={1.5}        // Reflection strength
	    roughness={0.01}          // Surface roughness (0=mirror sharp, 1=matte)
	    resolution={1024}        // Resolution of the reflection render buffer
	    mirror={1}               // 0 = texture colors, 1 = environment map colors
	    depthScale={0.01}        // Depth factor scale of the reflection distortion
	    minDepthThreshold={0.5}  // Lower edge threshold to depth blur interpolation
	    maxDepthThreshold={1}    // Upper edge threshold to depth blur interpolation
	    color="#ffffff"          // Base color of the plane a4c1db
	    metalness={0.3}
	  />
	</mesh>


    </Canvas>

      {/* Overlay UI */}
      <CrosshairOverlay size={5} color="rgba(0,0,0,0.95)" styleType="dot" />
      <ControlsHUD skyName={sky.name} />
      <CollectibleHUD />
  </>
 );
}
