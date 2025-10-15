import { forwardRef, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"

export default function CustomPointerControls({ sensitivity = 8 }) {
  const controlsRef = useRef()

  useEffect(() => {
    if (controlsRef.current) {
      // Increase sensitivity
      controlsRef.current.pointerSpeed = sensitivity   // default ~1.0
    }
  }, [sensitivity])

  return <PointerLockControls ref={controlsRef} /> 
}
