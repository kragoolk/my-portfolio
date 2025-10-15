// src/components/FloatingText.jsx
import React, { useRef, useState } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"

export default function FloatingText({
  text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae.",
  title = "Info Podium",
  position = [0, 3, 0],
  size = 3,
  rotation = [0, 0, 0],
}) {
  const group = useRef()
  const edge = useRef()
  const { camera } = useThree()
  const [expanded, setExpanded] = useState(false)

  // base position (so it returns when not expanded)
  const basePos = useRef(new THREE.Vector3(...position))

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!group.current) return

    // gentle float
    const bob = Math.sin(t * 0.9) * 0.06
    const targetPos = basePos.current.clone()
    targetPos.y += bob

    if (expanded) {
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      targetPos.add(dir.clone().multiplyScalar(1.5))
    }

    group.current.position.lerp(targetPos, 0.1)

    // scale up when expanded
    const desiredScale = expanded ? 1.4 : 1.0
    const curS = group.current.scale.x || 1
    group.current.scale.setScalar(curS + (desiredScale - curS) * 0.1)

    // subtle yaw oscillation
    const yawAngle = Math.sin(t * 8) * 0.001
    const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation))
    const qOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle)
    const targetQuat = baseQuat.multiply(qOffset)
    group.current.quaternion.slerp(targetQuat, 0.1)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setExpanded((s) => !s)
  }

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* Podium "screen" (icy glass) */}
      <mesh ref={edge} onClick={handleClick}>
        <boxGeometry args={[size * 1.5, size, 0.1]} />
        <meshPhysicalMaterial
          color="#cce6ff"
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.3}
          transmission={0.9}
          clearcoat={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Scrollable HTML text overlay */}
      {expanded && (
        <Html
          position={[0, size * 0.6, 0]}
          center
          transform
          occlude
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              width: "240px",
              maxHeight: "180px",
              overflowY: "auto",
              background: "rgba(240, 248, 255, 0.85)",
              backdropFilter: "blur(8px)",
              color: "#0b1220",
              padding: "0.8rem",
              borderRadius: "10px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              fontSize: "0.9rem",
              lineHeight: "1.3rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{title}</h3>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

