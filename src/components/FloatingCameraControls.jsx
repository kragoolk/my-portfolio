import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"
import * as THREE from "three"

export default function FloatingCameraControls({ speed = 0.9 }) {
  const { camera, gl } = useThree()
  const keys = useRef({})

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.key.toLowerCase()] = true)
    const handleKeyUp = (e) => (keys.current[e.key.toLowerCase()] = false)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)

    const right = new THREE.Vector3()
    camera.getWorldDirection(right)
    right.cross(camera.up)

    // Forward/backward (W or ArrowUp)
    if (keys.current["w"] || keys.current["arrowup"]) {
      camera.position.addScaledVector(direction, speed)
    }
    if (keys.current["s"] || keys.current["arrowdown"]) {
      camera.position.addScaledVector(direction, -speed)
    }

    // Left/right (A/D or ArrowLeft/ArrowRight)
    if (keys.current["a"] || keys.current["arrowleft"]) {
      camera.position.addScaledVector(right, -speed)
    }
    if (keys.current["d"] || keys.current["arrowright"]) {
      camera.position.addScaledVector(right, speed)
    }

    // Up (Q or Space)
    if (keys.current["q"] || keys.current[" "]) {
      camera.position.y += speed
    }
    // Down (E or Shift)
    if (keys.current["e"] || keys.current["shift"]) {
      camera.position.y -= speed
    }

    // Prevent camera from going under ground
    if (camera.position.y < 0.1) camera.position.y = 0.1
    if (camera.position.y > 8.0) camera.position.y = 8.0
  })
  return null
}

