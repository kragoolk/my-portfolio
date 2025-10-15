import * as THREE from "three"
import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"
//first skyColor #cfe8ff
export default function GradientBackground({ skyColor = "#a4c1db" }) {
  const { scene, fog } = useThree()

  useEffect(() => {
    if (!fog) return // ensure fog is defined

    const fogColor = fog.color.getStyle()

    // Create gradient from fog color (bottom) → skyColor (top)
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 512
    const context = canvas.getContext("2d")

    const gradient = context.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, fogColor)   // horizon (bottom)
    gradient.addColorStop(1, skyColor)  // sky (top)

    context.fillStyle = gradient
    context.fillRect(0, 0, 1, 256)

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter

    scene.background = texture
  }, [scene, fog, skyColor]) // re-run if color changes

  return null
}
