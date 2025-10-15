// src/components/TorusKnotHDR.jsx
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js'

// Extend R3F so it recognizes UltraHDRLoader
extend({ UltraHDRLoader })

export default function TorusKnotHDR({
  hdrPath = '/media/hdri/qwantani_moon_noon_puresky_4k.exr',
  exposure = 1,
  roughness = 0.0,
  metalness = 1.0,
  position = [0, 2, -5],
  scale = 1.5,
  rotation = [0, 0 ,0],
}) {
  const { gl, scene, camera } = useThree()
  const meshRef = useRef()

  // 1️⃣ Configure renderer tone mapping once
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = exposure
  }, [gl, exposure])

  // 2️⃣ Load the HDR and assign to scene.environment & background
  useEffect(() => {
    const loader = new UltraHDRLoader()
    loader.setDataType(THREE.HalfFloatType)
    loader.load(hdrPath, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = tex
      scene.background = tex
    })
  }, [hdrPath, scene])

  // 3️⃣ Rotate the torus each frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]} 
      rotation={[Math.PI/3, -Math.PI*2, -Math.PI]}
    >
      {/* Torus knot geometry */}
      <torusKnotGeometry args={[1, 0.4, 128, 32]} />
      {/* Material uses scene.environment for real reflections */}
      
      <meshPhysicalMaterial
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={1}
      />
    </mesh>
  )
}

