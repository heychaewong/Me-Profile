'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { EarType } from '@/data/pets';

interface PetModelProps {
  color: string;
  cheek: string;
  ears: EarType;
}

const EYE_COLOR = '#2E2A3A';

/** 동글동글 몸 + 작은 귀 + 점 눈 + 볼터치. 몸 반지름 0.5 기준. */
export function PetModel({ color, cheek, ears }: PetModelProps) {
  const eyesRef = useRef<Group>(null);
  const nextBlink = useRef(-1);

  // 가끔 눈 깜빡이기 (2~6초 간격, 0.16초 동안)
  useFrame(({ clock }) => {
    const eyes = eyesRef.current;
    if (!eyes) return;
    const t = clock.elapsedTime;
    if (nextBlink.current < 0) nextBlink.current = t + 1 + Math.random() * 3;
    const dt = t - nextBlink.current;
    let open = 1;
    if (dt > 0) {
      const BLINK = 0.16;
      if (dt < BLINK) open = 1 - Math.sin((dt / BLINK) * Math.PI) * 0.92;
      else nextBlink.current = t + 2 + Math.random() * 4;
    }
    eyes.scale.y = open;
  });

  return (
    <group>
      {/* 몸 */}
      <mesh scale={[1, 0.9, 0.92]}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>

      <Ears type={ears} color={color} />

      {/* 눈 (그룹째 y축으로 눌러서 깜빡임) */}
      <group ref={eyesRef} position={[0, 0.06, 0.425]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.16, 0, 0]}>
            <mesh scale={[1, 1.15, 0.6]}>
              <sphereGeometry args={[0.05, 20, 20]} />
              <meshStandardMaterial color={EYE_COLOR} roughness={0.3} />
            </mesh>
            <mesh position={[0.016, 0.02, 0.028]}>
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 볼터치 */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.28, -0.07, 0.37]}
          rotation={[0, side * 0.62, 0]}
          scale={[1, 0.65, 0.25]}
        >
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshBasicMaterial color={cheek} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* 입 (작은 미소) */}
      <mesh position={[0, -0.025, 0.452]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.03, 0.008, 8, 20, Math.PI]} />
        <meshStandardMaterial color={EYE_COLOR} />
      </mesh>
    </group>
  );
}

function Ears({ type, color }: { type: EarType; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.55} />;

  if (type === 'pointy') {
    return (
      <>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.25, 0.43, 0]} rotation={[0, 0, -side * 0.38]}>
            <coneGeometry args={[0.14, 0.28, 24]} />
            {mat}
          </mesh>
        ))}
      </>
    );
  }

  if (type === 'long') {
    return (
      <>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.16, 0.6, 0]} rotation={[0, 0, -side * 0.16]}>
            <capsuleGeometry args={[0.085, 0.32, 8, 16]} />
            {mat}
          </mesh>
        ))}
      </>
    );
  }

  return (
    <>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.3, 0.37, 0]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          {mat}
        </mesh>
      ))}
    </>
  );
}
