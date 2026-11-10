'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, ContactShadows, Html, useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, type Group } from 'three';
import { pets, type Pet } from '@/data/pets';
import { profile } from '@/data/profile';
import { useSceneStore } from '@/lib/store';
import { PetModel } from './PetModel';

/** 궤도 회전 속도 (rad/s). 작을수록 천천히 돕니다. */
const ORBIT_SPEED = 0.18;
const HOVER_SCALE = 1.22;
const PROFILE_RADIUS = 1.05;
const PROFILE_Y = 0.3;
const ORBIT_Y = -0.15;

/** 화면 크기에 맞춰 궤도 크기와 전체 배율을 계산 */
function useOrbitLayout() {
  const viewport = useThree((s) => s.viewport);
  const portrait = viewport.aspect < 1;
  // 좁은 화면에서는 씬 전체를 줄이되, 너무 작아지지 않게 하한을 둠
  const k = MathUtils.clamp(viewport.width / 8.6, 0.46, 1);
  const innerWidth = viewport.width / k;
  const a = Math.min(3.4, innerWidth * 0.42); // 가로 반지름
  // 세로 화면: 궤도를 원에 가깝게 + 카메라 쪽으로 기울여서 프로필 위아래로도 펫이 지나가게
  const b = a * (portrait ? 1.05 : 0.42); // 깊이 반지름
  const tilt = portrait ? 0.62 : 0; // 궤도면 기울기 (rad)
  const petScale = portrait ? 1.2 : 1;
  return { k, a, b, tilt, petScale, portrait };
}

interface OrbitSceneProps {
  onSelect: (slug: string) => void;
}

export function OrbitScene({ onSelect }: OrbitSceneProps) {
  const { k, a, b, tilt, petScale, portrait } = useOrbitLayout();
  const hoveredSlug = useSceneStore((s) => s.hoveredSlug);
  const petRefs = useRef<(Group | null)[]>([]);
  const angle = useRef(0);
  const speed = useRef(ORBIT_SPEED);

  useEffect(() => {
    document.body.style.cursor = hoveredSlug ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hoveredSlug]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    // 호버 중이면 궤도가 부드럽게 멈춤
    const target = useSceneStore.getState().hoveredSlug ? 0 : ORBIT_SPEED;
    speed.current = MathUtils.damp(speed.current, target, 5, dt);
    angle.current += speed.current * dt;

    petRefs.current.forEach((g, i) => {
      if (!g) return;
      // 앞쪽(+z)에서 시작해 시계 반대 방향으로 고르게 배치
      const theta = angle.current + Math.PI / 2 + (i / pets.length) * Math.PI * 2;
      g.position.set(Math.cos(theta) * a, 0, Math.sin(theta) * b);
    });
  });

  return (
    <group scale={k}>
      {/* 사진이 로드되는 동안에도 펫은 먼저 보이도록 프로필만 따로 Suspense */}
      <Suspense fallback={null}>
        <ProfileAvatar />
      </Suspense>
      <group position={[0, ORBIT_Y, 0]} rotation={[tilt, 0, 0]}>
        {pets.map((pet, i) => (
          <group key={pet.slug} ref={(el) => void (petRefs.current[i] = el)}>
            <OrbitPet pet={pet} index={i} baseScale={petScale} onSelect={onSelect} />
          </group>
        ))}
      </group>
      {!portrait && (
        <ContactShadows
          position={[0, ORBIT_Y - 1.1, 0]}
          scale={12}
          blur={2.6}
          far={3}
          opacity={0.22}
          resolution={512}
        />
      )}
    </group>
  );
}

function OrbitPet({
  pet,
  index,
  baseScale,
  onSelect,
}: {
  pet: Pet;
  index: number;
  baseScale: number;
  onSelect: (slug: string) => void;
}) {
  const ref = useRef<Group>(null);
  const hovered = useSceneStore((s) => s.hoveredSlug === pet.slug);
  const setHovered = useSceneStore((s) => s.setHovered);
  const phase = index * 1.3;

  useFrame(({ clock, camera }, delta) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    // 둥둥 떠다니기
    g.position.y = Math.sin(t * 1.6 + phase) * 0.12;
    g.rotation.z = Math.sin(t * 1.1 + phase) * 0.06;
    const s = MathUtils.damp(g.scale.x, baseScale * (hovered ? HOVER_SCALE : 1), 10, delta);
    g.scale.setScalar(s);
    // 항상 카메라 쪽을 바라봄 (z 기울기는 유지)
    const rz = g.rotation.z;
    g.lookAt(camera.position);
    g.rotation.z = rz;
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(pet.slug);
      }}
      onPointerOut={() => {
        if (useSceneStore.getState().hoveredSlug === pet.slug) setHovered(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setHovered(null);
        onSelect(pet.slug);
      }}
    >
      <PetModel color={pet.color} cheek={pet.cheek} ears={pet.ears} />
      {hovered && (
        <Html position={[0, -0.78, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="pet-tag">
            {pet.emoji} {pet.name} <span>· {pet.persona}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ProfileAvatar() {
  const ref = useRef<Group>(null);
  const texture = useTexture(profile.photo, (t) => {
    t.colorSpace = SRGBColorSpace;
  });

  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = PROFILE_Y + Math.sin(clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <group ref={ref} position={[0, PROFILE_Y, 0]}>
      <Billboard>
        {/* 테두리 */}
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[PROFILE_RADIUS + 0.07, 96]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {/* 사진 */}
        <mesh>
          <circleGeometry args={[PROFILE_RADIUS, 96]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  );
}
