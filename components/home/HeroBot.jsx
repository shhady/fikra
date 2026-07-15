'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';

/**
 * The hero object: a small hovering robot — the AI that runs through
 * everything the studio sells (agents, automations, RAG assistants).
 *
 * A robot is the obvious move for an AI agency, so the execution has to be
 * ours: shell, face and eyes are the site's exact design tokens, the chest
 * carries the accent-square wordmark, and the personality is behavioural —
 * it bobs, blinks on its own clock, and watches the pointer. No decals, no
 * clip-art, no gradients.
 */

const SHELL = '#FFFFFF';
const FACE = '#14161D';
const ACCENT = '#2638E9';
const TRIM = '#DFE2EA';

function Bot({ still }) {
  const root = useRef(null);
  const head = useRef(null);
  const leftEye = useRef(null);
  const rightEye = useRef(null);
  const blinkAt = useRef(2.2);

  const eyeGeometry = useMemo(() => new THREE.CapsuleGeometry(0.085, 0.12, 6, 12), []);

  useFrame((state) => {
    if (!root.current || !head.current) return;
    const t = state.clock.elapsedTime;

    if (!still) {
      // Idle hover — the whole bot rides a slow sine, the head a slightly
      // faster one, so the two drift in and out of phase like breathing.
      root.current.position.y = Math.sin(t * 1.1) * 0.07;
      head.current.position.y = 0.55 + Math.sin(t * 1.4 + 0.6) * 0.03;

      // Blink on an irregular clock; a metronome blink reads as a bug.
      if (t > blinkAt.current) {
        const phase = (t - blinkAt.current) / 0.16;
        if (phase >= 1) {
          blinkAt.current = t + 2.4 + Math.random() * 2.8;
        }
        const squeeze = phase < 0.5 ? 1 - phase * 1.84 : 0.08 + (phase - 0.5) * 1.84;
        if (leftEye.current) leftEye.current.scale.y = Math.max(0.08, squeeze);
        if (rightEye.current) rightEye.current.scale.y = Math.max(0.08, squeeze);
      }
    }

    // It watches the reader. Lerped so the gaze trails the cursor — snapping
    // reads as tracking software, trailing reads as attention.
    const ry = state.pointer.x * 0.42;
    const rx = -state.pointer.y * 0.22;
    head.current.rotation.y += (ry - head.current.rotation.y) * 0.06;
    head.current.rotation.x += (rx - head.current.rotation.x) * 0.06;
    root.current.rotation.y += (state.pointer.x * 0.12 - root.current.rotation.y) * 0.03;
  });

  return (
    <group ref={root} position={[0, 0.1, 0]}>
      {/* ------------------------------- head ------------------------- */}
      <group ref={head} position={[0, 0.55, 0]}>
        <RoundedBox args={[1.6, 1.15, 1.15]} radius={0.3} smoothness={5}>
          <meshStandardMaterial color={SHELL} roughness={0.35} metalness={0.05} />
        </RoundedBox>

        {/* face plate */}
        <RoundedBox args={[1.14, 0.66, 0.12]} radius={0.16} smoothness={4} position={[0, -0.02, 0.55]}>
          <meshStandardMaterial color={FACE} roughness={0.5} />
        </RoundedBox>

        {/* eyes */}
        <mesh ref={leftEye} geometry={eyeGeometry} position={[-0.25, -0.02, 0.64]}>
          <meshBasicMaterial color={ACCENT} />
        </mesh>
        <mesh ref={rightEye} geometry={eyeGeometry} position={[0.25, -0.02, 0.64]}>
          <meshBasicMaterial color={ACCENT} />
        </mesh>

        {/* ears */}
        {[-0.86, 0.86].map((x) => (
          <mesh key={x} position={[x, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.14, 20]} />
            <meshStandardMaterial color={TRIM} roughness={0.4} />
          </mesh>
        ))}

        {/* antenna */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.3, 10]} />
          <meshStandardMaterial color={TRIM} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <sphereGeometry args={[0.085, 20, 20]} />
          <meshBasicMaterial color={ACCENT} />
        </mesh>
      </group>

      {/* ------------------------------- body ------------------------- */}
      <group position={[0, -0.62, 0]}>
        <RoundedBox args={[1.08, 0.82, 0.88]} radius={0.26} smoothness={5}>
          <meshStandardMaterial color={SHELL} roughness={0.35} metalness={0.05} />
        </RoundedBox>

        {/* the accent square — the same mark as the header wordmark */}
        <RoundedBox args={[0.17, 0.17, 0.06]} radius={0.03} smoothness={3} position={[0, 0.08, 0.45]}>
          <meshBasicMaterial color={ACCENT} />
        </RoundedBox>
      </group>

      <ContactShadows position={[0, -1.45, 0]} opacity={0.3} scale={6} blur={2.4} far={3} />
    </group>
  );
}

export default function HeroBot({ still = false }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.15, 6.2], fov: 30 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      frameloop={still ? 'demand' : 'always'}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <Bot still={still} />
    </Canvas>
  );
}
