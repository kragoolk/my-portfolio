import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"

export function FloatingSphere() {
  const ref = useRef()
  const baseY = 7

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.position.y = baseY + Math.sin(t) * 1.5 // gentle float
    ref.current.rotation.y += 0.01 // slow spin
  })

  // Click handler
  const handleClick = () => {
    console.log("Sphere clicked!")
  }

  return (
    <mesh
      ref={ref}
      position={[3, baseY, -27]}
      onClick={handleClick} // <--- added
    >
      <sphereGeometry args={[2, 30, 30]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}

export function FloatingPoly() {
  const ref = useRef()
  const baseY = 7
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.position.y = baseY + Math.cos(t) * 2
    
    ref.current.rotation.x += 0.05
    ref.current.rotation.y += 0.1
  })

  const handleClick = () => {
    console.log("Poly clicked!")
  }

  return (
    <mesh
      ref={ref}
      position={[-3, baseY, -27]}
      onClick={handleClick}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}
