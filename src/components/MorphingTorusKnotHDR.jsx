// src/components/MorphingTorusKnotHDR.jsx

import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js'

extend({ UltraHDRLoader })

export default function MorphingTorusKnotHDR({
  hdrPath = '/media/hdri/qwantani_moon_noon_puresky_2k.exr',
  exposure = 1,
  morphStrength = 0.4,
  animationSpeed = 0.8,
  position = [0, 2.7, 0.5],
  scale = 2.5,
  rotation = [Math.PI/3, -Math.PI*2, -Math.PI],
}) {
  const { gl, scene } = useThree()
  const meshRef = useRef()
  const timeUniform = useRef({ value: 0 })

  // Tone mapping
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = exposure
  }, [gl, exposure])

  // Load HDR
  useEffect(() => {
    const loader = new UltraHDRLoader().setDataType(THREE.HalfFloatType)
    loader.load(hdrPath, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = tex
      scene.background = tex
    })
  }, [hdrPath, scene])

  // Shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        envMap: { value: scene.environment },
        time: timeUniform.current,
        morphStrength: { value: morphStrength * 2.0 }
      },
      vertexShader: /* glsl */`
        uniform float time;
        uniform float morphStrength;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        // (insert simplex noise functions here, same as before)...
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          vViewDir = normalize(-mv.xyz);
          // compute disp via snoise() layers...
          float disp = /* noise combo */ 0.0;
          vec3 displaced = position + normal * disp * morphStrength;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced,1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform samplerCube envMap;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main(){
          vec3 R = reflect(vViewDir, vNormal);
          vec3 color = textureCube(envMap, R).rgb;
          gl_FragColor = vec4(color,1.0);
        }
      `,
      side: THREE.DoubleSide
    })
  }, [scene.environment, morphStrength])

  // Animate
  useFrame((state) => {
    timeUniform.current.value = state.clock.elapsedTime * animationSpeed
    meshRef.current.rotation.y += 0.005
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      rotation={rotation}
      geometry={new THREE.TorusKnotGeometry(1, 0.4, 128, 32)}
      material={material}
    />
  )
}

