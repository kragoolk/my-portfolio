import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture, Text } from "@react-three/drei";
import ImageContents from "./ImageContents";
import { useSelection } from "./SelectionContext";

export default function FloatingPaper({
  url,
  id = null,
  pdfUrl = null,
  webUrl = null,
  position = [0, 3, 0],
  size = 4,
  rotation = [0, 0, 0],
}) {
  const group = useRef();
  const front = useRef();
  const back = useRef();
  const edge = useRef();
  const buttonRef = useRef();
  const { camera } = useThree();
  const { select, isSelected } = useSelection();

  const texture = useTexture(url);
  const img = texture?.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
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

  // State for displaying the 3D confirmation prompt
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (group.current) {
      group.current.userData.id = uniqueId;
      group.current.userData.type = "paper";
    }
  }, [uniqueId]);

  const handleClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    select(uniqueId);
  };

  const handleOpenClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirmYes = (e) => {
    e.stopPropagation && e.stopPropagation();
    setConfirming(false);
    if (webUrl) {
      window.open(webUrl, "_blank");
    } else if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const handleConfirmNo = (e) => {
    e.stopPropagation && e.stopPropagation();
    setConfirming(false);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return;

    const bob = Math.sin(t * 0.9) * 0.08;
    const targetPos = basePos.current.clone();
    targetPos.y += bob;

    if (expanded) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      targetPos.add(dir.clone().multiplyScalar(-0.8));
    }

    group.current.position.lerp(targetPos, 0.12);

    const desiredScale = expanded ? 1.2 : 1.0;
    const curS = group.current.scale.x || 1;
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.12);

    const yawAngle = Math.sin(t * 5) * 0.01;
    const baseQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...rotation)
    );
    const qOffset = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawAngle
    );
    const targetQuat = baseQuat.multiply(qOffset);
    group.current.quaternion.slerp(targetQuat, 0.12);
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* Front, Back, Edge meshes */}
      <mesh ref={front} position={[0, 0, depth / 1.8]} onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={0.01}
          transparent={false}
          opacity={0.98}
          roughness={0}
          metalness={0.03}
          envMapIntensity={2}
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
          emissive="#ffffff"
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

      {/* Expanded content */}
      {expanded && (
        <>
          <Html
            position={[0, height, 0.2]}
            center
            transform
            occlude
            style={{
              pointerEvents: "auto",
              maxWidth: 400,
              background: "rgba(255,255,255,0.95)",
              color: "#0b1220",
              padding: "0.7rem",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              backdropFilter: "blur(6px)",
              userSelect: "text",
            }}
          >
            <div>
              <strong style={{ fontSize: "0.8rem" }}>{content.title}</strong>
              <p
                style={{
                  marginTop: "0.1rem",
                  fontSize: "0.7rem",
                  lineHeight: 1,
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {content.description}
              </p>
            </div>
          </Html>

          {/* Main Open/Verify button */}
          {!confirming && (
            <group
              position={[0, -1.6, depth]}
              ref={buttonRef}
              onClick={handleOpenClick}
              style={{ cursor: "pointer" }}
            >
              <mesh>
                <planeGeometry args={[width * 0.4, height * 0.2]} />
                <meshStandardMaterial color="#007acc" />
              </mesh>
              <Text
                position={[0, 0, 0.01]}
                fontSize={height * 0.1}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {webUrl ? "Verify" : "Open Paper"}
              </Text>
            </group>
          )}

          {/* Confirmation prompt */}
          {confirming && (
            <group position={[0, -1.4, depth]}>
              <mesh>
                <planeGeometry args={[width * 0.8, height * 0.3]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
              </mesh>
              <Text
                position={[0, height * 0.06, 0.01]}
                fontSize={height * 0.07}
                color="#222"
                anchorX="center"
                anchorY="middle"
              >
                {`Redirecting to:\n${webUrl || pdfUrl}\nProceed?`}
              </Text>

              {/* Yes Button */}
              <group
                position={[-width * 0.2, -height * 0.08, 0.02]}
                onClick={handleConfirmYes}
                style={{ cursor: "pointer" }}
              >
                <mesh>
                  <planeGeometry args={[width * 0.15, height * 0.1]} />
                  <meshStandardMaterial color="#0ea5e9" />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={height * 0.07}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  Yes
                </Text>
              </group>

              {/* No Button */}
              <group
                position={[width * 0.2, -height * 0.08, 0.02]}
                onClick={handleConfirmNo}
                style={{ cursor: "pointer" }}
              >
                <mesh>
                  <planeGeometry args={[width * 0.15, height * 0.1]} />
                  <meshStandardMaterial color="#ddd" />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={height * 0.07}
                  color="#222"
                  anchorX="center"
                  anchorY="middle"
                >
                  No
                </Text>
              </group>
            </group>
          )}
        </>
      )}
    </group>
  );
}

