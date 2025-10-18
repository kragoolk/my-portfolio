// src/components/FloatingVideo.jsx
import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import ImageContents from "./ImageContents";
import { useSelection } from './SelectionContext';

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
  const { select, isSelected } = useSelection();

  const phase = useRef(Math.random() * Math.PI * 2);

  const videoRef = useRef(document.createElement("video"));
  const [videoReady, setVideoReady] = useState(false);
  const videoTextureRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    video.src = url;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.pause();
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

  const [playing, setPlaying] = useState(false);

  const aspect = 16 / 9;
  const height = size;
  const width = size * aspect;
  const depth = Math.max(0.02, Math.min(0.12, Math.max(width, height) * 0.02));

  const basePos = useRef(new THREE.Vector3(...position));

  const deriveId = () => {
    if (id) return id;
    try {
      const fname = url.split("/").pop();
      return fname ? fname.split(".")[0] : url;
    } catch {
      return url;
    }
  };
  const uniqueId = deriveId();
  const contentKey = id || deriveId();
  const content = ImageContents[contentKey] || ImageContents.default;

  const expanded = isSelected(uniqueId);

  useEffect(() => {
    if (group.current) {
      group.current.userData.id = uniqueId;
      group.current.userData.type = 'video';
    }
  }, [uniqueId]);

  // Sync playing state with expanded
  useEffect(() => {
    if (!videoReady) return;
    if (expanded) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.muted = true;
      setPlaying(false);
    }
  }, [expanded, videoReady]);

  const handleClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    select(uniqueId);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase.current;
    if (!group.current) return;

    const bob = Math.sin(t * 0.8 + phase.current) * 0.06;
    const targetPos = basePos.current.clone();
    targetPos.y += bob;
    group.current.position.lerp(targetPos, 0.12);

    const desiredScale = playing ? 1.3 : 1.0;
    const curS = group.current.scale.x || 0.5;
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.12);

    const yawAngle = Math.sin(t * 6 + phase.current) * 0.005;
    const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation));
    const qOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle);
    const targetQuat = baseQuat.multiply(qOffset);
    group.current.quaternion.slerp(targetQuat, 0.12);

    if (playing && videoTextureRef.current) {
      videoTextureRef.current.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh ref={front} position={[0, 0, depth / 1.89]} onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={videoTextureRef.current || null}
          toneMapped={false}
          transparent={false}
        />
        {!videoReady && (
          <meshStandardMaterial color="black" transparent opacity={0.7} />
        )}
      </mesh>

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

      {playing && (
        <Html
          position={[0, height * 0.9, 0.3]}
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
                marginTop: "0.3rem",
                fontSize: "0.8rem",
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

