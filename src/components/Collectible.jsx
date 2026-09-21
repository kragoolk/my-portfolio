// src/components/Collectible.jsx
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useSelection } from "./SelectionContext";
import { useCollectibles } from "./CollectibleContext";

const GEOMETRIES = {
  sphere: <sphereGeometry args={[1, 24, 24]} />,
  icosahedron: <icosahedronGeometry args={[1, 0]} />,
  octahedron: <octahedronGeometry args={[1, 0]} />,
  torus: <torusGeometry args={[0.8, 0.3, 16, 32]} />,
};

// POP_DURATION controls how long the collect animation plays before the
// crystal is removed from the scene for good.
const POP_DURATION = 0.55;

export default function Collectible({
  id,
  position,
  geometry = "icosahedron",
  color = "#ff5555",
  size = 1,
  floatRange = 1.4,
  floatSpeed = 1,
}) {
  const group = useRef();
  const meshRef = useRef();
  const { select, isSelected } = useSelection();
  const { collect, isCollected } = useCollectibles();

  const phase = useRef(Math.random() * Math.PI * 2);
  const [popping, setPopping] = useState(false);
  const popT = useRef(0);
  const alreadyCollected = isCollected(id);

  useEffect(() => {
    if (group.current) {
      group.current.userData.id = id;
      group.current.userData.type = "collectible";
    }
  }, [id]);

  const selected = isSelected(id);

  useEffect(() => {
    if (selected && !alreadyCollected && !popping) {
      setPopping(true);
    }
  }, [selected, alreadyCollected, popping]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (popping) {
      popT.current += delta / POP_DURATION;
      const t = Math.min(popT.current, 1);
      // Quick overshoot-then-collapse pop curve.
      const scale = t < 0.35 ? 1 + t * 1.6 : Math.max(0, 1.56 * (1 - (t - 0.35) / 0.65));
      group.current.scale.setScalar(scale * size);
      if (t >= 1) {
        collect(id);
      }
      return;
    }

    if (alreadyCollected) return;

    const t = state.clock.getElapsedTime() * floatSpeed + phase.current;
    group.current.position.y = position[1] + Math.sin(t) * floatRange;
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.6;
      meshRef.current.rotation.y += delta * 0.9;
    }
    const pulse = 1 + Math.sin(t * 2) * 0.06;
    group.current.scale.setScalar(pulse * size);
  });

  if (alreadyCollected) return null;

  const handleClick = (e) => {
    e.stopPropagation && e.stopPropagation();
    select(id);
  };

  return (
    <group ref={group} position={position}>
      <mesh ref={meshRef} onClick={handleClick}>
        {GEOMETRIES[geometry] || GEOMETRIES.icosahedron}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={popping ? 2.2 : 0.5}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      {popping && (
        <Sparkles count={28} scale={2.2} size={4} speed={4} color={color} />
      )}
    </group>
  );
}
