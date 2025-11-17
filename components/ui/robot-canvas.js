'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls, Stage, useGLTF } from '@react-three/drei'

function RobotModel({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1.4} />
}

export function RobotCanvas({ className, modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RobotExpressive/glTF-Binary/RobotExpressive.glb' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 1.2, 3], fov: 35 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <PresentationControls
            global
            rotation={[0, Math.PI / 8, 0]}
            polar={[-0.2, 0.2]}
            azimuth={[-0.6, 0.6]}
            speed={1}
          >
            <Stage environment={null} intensity={0.6} contactShadow={false}>
              <RobotModel url={modelUrl} />
            </Stage>
          </PresentationControls>
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RobotExpressive/glTF-Binary/RobotExpressive.glb')


