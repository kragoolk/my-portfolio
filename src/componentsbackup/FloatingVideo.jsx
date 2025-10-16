import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import ImageContents from "./ImageContents";

/**
 * FloatingVideo (glass panel with video texture)
 *
 * Props:
 * - url: string (video path, mp4 etc)
 * - id: optional string for content lookup (optional)
 * - position: [x,y,z]
 * - size: number (height in world units)
 * - rotation: rotation in euler angles
 */
export default function FloatingVideo({
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
  const { camera } = useThree();

  const phase = useRef(Math.random() * Math.PI * 2);

  // video element and texture
  const videoRef = useRef(document.createElement("video"));
  const [videoReady, setVideoReady] = useState(false);
  const videoTextureRef = useRef(null);

  // Setup video element
  useEffect(() => {
    const video = videoRef.current;
    video.src = url;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true; // start muted, will unmute on play
    video.playsInline = true;
    video.preload = "auto";
    video.pause(); // initially paused
    video.load();
    
    const handleCanPlay = () => {
      setVideoReady(true);
      videoTextureRef.current = new THREE.VideoTexture(video);
      videoTextureRef.current.minFilter = THREE.LinearFilter;
      videoTextureRef.current.magFilter = THREE.LinearFilter;
      videoTextureRef.current.format = THREE.RGBFormat;
      videoTextureRef.current.needsUpdate = true;
    };
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.pause();
      video.removeEventListener("canplay", handleCanPlay);
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
    };
  }, [url]);

  // state to toggle play/pause
  const [playing, setPlaying] = useState(false);

  // derived size and aspect ratio (default aspect 16:9 typical for video)
  const aspect = 16 / 9;
  const height = size;
  const width = size * aspect;
  const depth = Math.max(0.02, Math.min(0.12, Math.max(width, height) * 0.02));

  // base position for bobbing
  const basePos = useRef(new THREE.Vector3(...position));

  // Determine content key for popup info
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

  const handleClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    if (!videoReady) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      // unmute and play
      videoRef.current.muted = false;
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase.current;
    if (!group.current) return;

    // bobbing animation with sine
    const bob = Math.sin(t * 0.8 + phase.current) * 0.06;
    const targetPos = basePos.current.clone();
    targetPos.y += bob;
    group.current.position.lerp(targetPos, 0.12);

    // scale changes when playing
    const desiredScale = playing ? 1.8 : 1.0;
    const curS = group.current.scale.x || 1;
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.12);

    // Face camera with small oscillating yaw
    const yawAngle = Math.sin(t * 6 + phase.current) * 0.005;
    const baseQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...rotation)
    );
    const qOffset = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawAngle
    );
    const targetQuat = baseQuat.multiply(qOffset);
    group.current.quaternion.slerp(targetQuat, 0.12);

    // update video texture if playing
    if (playing && videoTextureRef.current) {
      videoTextureRef.current.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* Front video plane */}
      <mesh ref={front} position={[0, 0, depth / 1.89]} onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={videoTextureRef.current || null} // show video if ready
          toneMapped={false}
          transparent={false}
        />
        {!videoReady && (
          <meshStandardMaterial color="black" transparent opacity={0.7} />
        )}
      </mesh>

      {/* Back plane */}
      <mesh
        ref={back}
        position={[0, 0, -depth / 1.89]}
        rotation={[0, Math.PI, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#222"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Edge */}
      <mesh ref={edge} position={[0, 0, 0]} onClick={handleClick}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color="#111"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.4}
          transmission={0.9}
          clearcoat={0.2}
        />
      </mesh>

      {/* Popup content */}
      {playing && (
        <Html
          position={[0, height * 0.8, 1]}
          center
          transform
          occlude
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              minWidth: Math.min(300, Math.max(120, width * 60)),
              maxWidth: 360,
              background: "rgba(255,255,255,0.95)",
              color: "#0b1220",
              padding: "1rem",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: "1.05rem" }}>{content.title}</strong>
            </div>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                lineHeight: 1,
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
            >
              {content.description}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

