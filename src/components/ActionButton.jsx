import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text, Sparkles } from "@react-three/drei";

export default function ActionButton({
  label,
  link,
  position = [0, 1, 0],
  size = 2,
  rotation = [0, 0, 0],
}) {
  const groupRef = useRef();
  const boxRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const phase = useRef(Math.random() * Math.PI * 2);
  const { scene } = useThree();

  // Dimensions
  const height = size;
  const width = size * 2;
  const depth = size * 0.1;

  // Popup window size (manipulate these to adjust popup size)
  const popupWidth = width * 1.5;  // <-- change this to resize popup width
  const popupHeight = height;      // <-- change this to resize popup height

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase.current;
    if (!groupRef.current || !boxRef.current) return;

    // 1. Bobbing motion
    const bob = Math.sin(t * 0.9) * 0.04;
    groupRef.current.position.y = position[1] + bob;

    // 2. Scale on hover/press
    const targetScale = pressed ? 0.9 : hovered ? 1.08 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.16
    );

    // 3. Subtle yaw oscillation
    const yawAngle = Math.sin(t * 5) * 0.009;
    const baseQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...rotation)
    );
    const qOffset = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawAngle
    );
    groupRef.current.quaternion.slerp(baseQuat.multiply(qOffset), 0.12);

    // 4. Emissive effect on hover
    const mat = boxRef.current.material;
    if (mat) {
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        hovered ? 0.6 : 0,
        0.18
      );
    }
  });

  // Event handlers
  const onPointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
  };
  const onPointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    setPressed(false);
  };
  const onPointerDown = (e) => {
    e.stopPropagation();
    setPressed(true);
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    setPressed(false);
    setConfirming(true); // Show confirmation popup instead of direct open
  };

  const handleConfirmYes = (e) => {
    e.stopPropagation();
    setConfirming(false);
    window.open(link, "_blank");
  };

  const handleConfirmNo = (e) => {
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <>
      <group ref={groupRef} position={position} rotation={rotation}>
        {hovered && <Sparkles count={20} scale={[width, height, depth]} />}
        <RoundedBox
          ref={boxRef}
          args={[width, height, depth]}
          radius={depth * 0.8}
          smoothness={8}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <meshPhysicalMaterial
            color="#a4d2fa"
            metalness={1.0}
            roughness={0.08}
            envMap={scene.environment}
            envMapIntensity={1.45}
            transparent
            opacity={0.5}
            transmission={0.88}
            clearcoat={0.7}
            clearcoatRoughness={0.25}
            reflectivity={0.98}
            thickness={depth}
            emissive="#51c0fc"
            emissiveIntensity={0}
          />
        </RoundedBox>
        <Text
          position={[0, 0, depth * 0.7]}
          fontSize={height * 0.31}
          color="#111"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>

      {/* Confirmation popup rendered near the button */}
      {confirming && (
        <group position={[position[0], position[1] + height * 1.1, position[2]+ height * 0.1]} rotation={rotation}>
          <mesh>
            <planeGeometry args={[popupWidth, popupHeight]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>

          <Text
            position={[0, popupHeight * 0.1, 0.05]}
            fontSize={popupHeight * 0.1}
            color="#222"
            anchorX="center"
            anchorY="middle"
          >
            {`Open link?\n${link}`}
          </Text>

          {/* Yes Button */}
          <group
            position={[-popupWidth * 0.25, -popupHeight * 0.2, 0.02]}
            onClick={handleConfirmYes}
            style={{ cursor: "pointer" }}
          >
            <mesh>
              <planeGeometry args={[popupWidth * 0.3, popupHeight * 0.25]} />
              <meshStandardMaterial color="#0ea5e9" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={popupHeight * 0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Yes
            </Text>
          </group>

          {/* No Button */}
          <group
            position={[popupWidth * 0.25, -popupHeight * 0.2, 0.02]}
            onClick={handleConfirmNo}
            style={{ cursor: "pointer" }}
          >
            <mesh>
              <planeGeometry args={[popupWidth * 0.3, popupHeight * 0.25]} />
              <meshStandardMaterial color="#ddd" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={popupHeight * 0.15}
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
  );
}

