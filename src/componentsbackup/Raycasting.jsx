import * as THREE from "three"
import { Group } from "three"
import { forwardRef, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"

//RAYCASTING
// ClickHandler: attach inside <Canvas>. Minimal, reliable raycast-on-click.
export default function ClickHandler({ clickablesRef }) {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    // Track mouse when pointer lock is NOT active
    const onMouseMove = (e) => {
      if (document.pointerLockElement) return;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // Click handler on the canvas DOM element
    const onClick = (e) => {
      // normalized device coords (NDC) calculation
      const rect = gl.domElement.getBoundingClientRect();
      let ndcX, ndcY;
      if (document.pointerLockElement) {
        // pointer-lock -> center of screen
        ndcX = 0;
        ndcY = 0;
      } else {
        const x = (mouse.current.x - rect.left) / rect.width;
        const y = (mouse.current.y - rect.top) / rect.height;
        ndcX = x * 2 - 1;
        ndcY = -(y * 2 - 1);
      }

      // create and set ray
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(ndcX, ndcY);
      raycaster.setFromCamera(pointer, camera);

      // collect objects to test: use group's children so all nested meshes are tested
      const group = clickablesRef?.current;
      if (!group) return;
      const objects = group.children || [];

      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length > 0) {
        const hit = hits[0]; // closest
        console.log("Clicked object:", hit.object, "distance:", hit.distance);

        // visual feedback: scale the hit object's root (or its parent)
        // we try to pick a stable target (the top-level object under the group)
        let target = hit.object;
        // if the hit is a geometry child, try to pick a parent mesh/group that's visible
        while (target && target.parent && target.parent !== group && !(target.userData && target.userData.__isClickableRoot)) {
          target = target.parent;
        }

        // store and pulse scale (non-destructive, simple)
        if (target) {
          const original = target.scale.clone();
          target.scale.multiplyScalar(1.12);
          setTimeout(() => {
            // restore
            if (target && target.scale) target.scale.copy(original);
          }, 250);
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    gl.domElement.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [camera, gl, clickablesRef]);

  return null;
}
//RAYCASTING END
