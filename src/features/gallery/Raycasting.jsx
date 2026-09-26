import * as THREE from "three"
import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { useSelection } from './SelectionContext'

export default function ClickHandler({ clickablesRef }) {
  const { camera, gl } = useThree()
  const { select } = useSelection()
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  useEffect(() => {
    const onMouseMove = (e) => {
      if (document.pointerLockElement) return
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const onClick = (e) => {
      const rect = gl.domElement.getBoundingClientRect()
      let ndcX, ndcY

      if (document.pointerLockElement) {
        ndcX = 0
        ndcY = 0
      } else {
        const x = (mouse.current.x - rect.left) / rect.width
        const y = (mouse.current.y - rect.top) / rect.height
        ndcX = x * 2 - 1
        ndcY = -(y * 2 - 1)
      }

      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2(ndcX, ndcY)
      raycaster.setFromCamera(pointer, camera)

      const group = clickablesRef?.current
      if (!group) return
      const objects = group.children || []

      const hits = raycaster.intersectObjects(objects, true)
      if (hits.length > 0) {
        const hit = hits[0]
        
        // Find the root clickable object
        let target = hit.object
        while (target && target.parent && target.parent !== group) {
          target = target.parent
        }

        // Get the ID from userData
        const id = target.userData?.id
        
        if (id) {
          console.log("Clicked object with ID:", id)
          select(id) // This will auto-deselect previous selection
        } else {
          console.warn("Clicked object has no ID:", target)
        }
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    gl.domElement.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      gl.domElement.removeEventListener("click", onClick)
    }
  }, [camera, gl, clickablesRef, select])

  return null
}

