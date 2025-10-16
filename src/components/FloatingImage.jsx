// src/components/FloatingImage.jsx
import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import ImageContents from "./ImageContents";
import { useSelection } from './SelectionContext';

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
  const texture = useTexture(url);
  const { camera } = useThree();
  const { select, isSelected } = useSelection();

  const phase = useRef(Math.random() * Math.PI * 5);

  const img = texture?.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
  const height = size;
  const width = size * aspect;
  const depth = Math.max(0.02, Math.min(0.12, Math.max(width, height) * 0.02));

  const basePos = useRef(new THREE.Vector3(...position));

  // Derive unique ID
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

  // Check if this item is selected
  const expanded = isSelected(uniqueId);

  // Set userData for raycasting
  useEffect(() => {
    if (group.current) {
      group.current.userData.id = uniqueId;
      group.current.userData.type = 'image';
    }
  }, [uniqueId]);

  const handleClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    select(uniqueId);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase.current;
    if (!group.current) return;

    const bob = Math.sin(t * 0.3 + phase.current) * 0.03;
    const targetPos = basePos.current.clone();
    targetPos.y += bob;

    if (expanded) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      targetPos.add(dir.clone().multiplyScalar(-0.5));
    }

    group.current.position.lerp(targetPos, 0.12);

    const desiredScale = expanded ? 1.2 : 1.0;
    const curS = group.current.scale.x || 1;
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.12);

    const yawAngle = Math.sin(t * 2 + phase.current) * 0.01;
    const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation));
    const qOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle);
    const targetQuat = baseQuat.multiply(qOffset);
    group.current.quaternion.slerp(targetQuat, 0.12);
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh ref={front} position={[0, 0, depth / 1.89]} onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          emissive={"#ffffff"}
          emissiveIntensity={0.01}
          transparent={false}
          opacity={1}
          roughness={0}
          metalness={0.8}
          envMapIntensity={3}
        />
      </mesh>

      <mesh
        ref={back}
        position={[0, 0, -depth / 1.89]}
        rotation={[0, Math.PI, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          emissive={"#ffffff"}
          emissiveIntensity={0.01}
          transparent={false}
          opacity={0.88}
          roughness={0.18}
          metalness={0.02}
          envMapIntensity={0.3}
        />
      </mesh>

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

      {expanded && (
        <Html
          position={[0, height * 0.8, 0.2]}
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
                whiteSpace: "normal",
                wordWrap: "break-word"
            }}>{content.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

