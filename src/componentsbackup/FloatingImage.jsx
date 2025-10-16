// src/FloatingImage.jsx
import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture, Image } from "@react-three/drei";
import ImageContents from "./ImageContents";

/**
 * FloatingImage (glass panel)
 *
 * Props:
 * - url: string (image path)
 * - id: optional string to look up content in ImageContents (if omitted, derived from filename)
 * - position: [x,y,z]
 * - size: number (height in world units)
 */
export default function FloatingImage({
  url,
  id = null,
  position = [0, 3, 0],
  size = 4,
  rotation = [0, 0, 0],
}) {
  const group = useRef();
  const front = useRef();
  const back = useRef();
  const edge = useRef();
  const texture = useTexture(url); // drei helper; caches textures
  const { camera } = useThree();

  //random phase offset per image (indpndt floating)
  const phase = useRef(Math.random() * Math.PI * 5);

  // --- compute aspect / dims safely (texture may load async) ---
  const img = texture?.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
  const height = size;
  const width = size * aspect;
  const depth = Math.max(0.02, Math.min(0.12, Math.max(width, height) * 0.02));

  // expanded state toggles the popup + pop-toward-camera
  const [expanded, setExpanded] = useState(false);

  // base position so we lerp back to it when not expanded
  const basePos = useRef(new THREE.Vector3(...position));

  // Determine content: prefer explicit id, else derive from filename, else default
  const deriveId = () => {
    if (id) return id;
    try {
      const fname = url.split("/").pop();
      return fname ? fname.split(".")[0] : "default";
    } catch {
      return "default";
    }
  };
  const contentKey = deriveId();
  const content = ImageContents[contentKey] || ImageContents.default;

  // click handler toggles expanded
  const handleClick = (e) => {
    // prevent parent click handlers (if any) from firing
    e.stopPropagation && e.stopPropagation();
    setExpanded((s) => !s);
  };

  // ---- Animation loop: bobbing + face-camera + smooth pop + subtle yaw oscillation ----
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase.current;
    if (!group.current) return;

    // 1) bobbing: small vertical sine motion
    const bob = Math.sin(t * 0.6 + phase.current) * 0.08;
    const targetPos = basePos.current.clone();
    targetPos.y += bob;

    // 2) if expanded, move slightly toward the camera for a pop effect
    if (expanded) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir); // forward vector from camera
      // negative to move panel toward camera
      targetPos.add(dir.clone().multiplyScalar(-0.5));
    }

    // smooth position lerp
    group.current.position.lerp(targetPos, 0.12);

    // scale lerp (bigger when expanded)
    const desiredScale = expanded ? 1.2 : 1.0;
    const curS = group.current.scale.x || 1;
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.12);

  
    // small oscillating yaw (so it "rotates" slightly while still facing camera)
    const yawAngle = Math.sin(t * 3 + phase.current) * 0.01; // amplitude and speed => tweak here
    const baseQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...rotation) // your prop rotation
    );
    const qOffset = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawAngle
  );
  const targetQuat = baseQuat.multiply(qOffset);
  
  // slerp towards the target quaternion to keep motion smooth
    group.current.quaternion.slerp(targetQuat, 0.12);
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* FRONT plane */}
      <mesh ref={front} position={[0, 0, depth / 1.89]} onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          emissive={"#ffffff"}
          emissiveIntensity={0.01}
          transparent={false}
          opacity={0.98}
          roughness={0}
          metalness={0.03}
          envMapIntensity={2}
        />
      </mesh>

      {/* BACK plane (flipped) */}
      <mesh
        ref={back}
        position={[0, 0, -depth / 1.89]}
        rotation={[0, Math.PI, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
Welcome
Preparing portfolio
          emissive={"#ffffff"}
          emissiveIntensity={0.01} 
          transparent={false}
          opacity={0.88}
          roughness={0.18}
          metalness={0.02}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* EDGE / thickness */}
      <mesh ref={edge} position={[0, 0, 0]} onClick={handleClick}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.86}
          roughness={0.08}
          metalness={0.4}
          transmission={0.9}
          clearcoat={0.2}
        />
      </mesh>

      {/* Html popup — position above the panel so it doesn't clip into ground */}
      {expanded && (
        <Html
          position={[0, height * 0.8, 0.2]} // above the panel
          center
          transform
          occlude
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              minWidth: Math.min(200, Math.max(120, width * 60)),
              maxWidth: 300,
	      background: "rgba(255,255,255,0.95)",
              color: "#0b1220",
              padding: "0.7rem",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "0.9rem" }}>{content.title}</strong>
            </div>

            <p style={{ 
	        marginTop: "0.1rem", 
                fontSize: "0.7rem", 
                lineHeight: 1,
                whiteSpace: "normal", //allow wrapping at spaces
                wordWrap: "break-word" //break long words if needed
            }}>{content.description}</p>

          </div>
        </Html>
      )}
    </group>
  );
}

