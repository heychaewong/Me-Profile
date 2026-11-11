'use client';

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, ContactShadows, Html, useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, Vector3, type Group } from 'three';
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
/** 포커스 전환 속도 (클수록 빠름) */
const FOCUS_LAMBDA = 3.2;

const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** 화면 크기에 맞춰 궤도 크기, 전체 배율, 포커스 위치를 계산 */
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

  // 포커스된 펫의 위치·크기 (월드 좌표, z=0 평면 기준).
  // ⚠️ 말풍선 위치(PetDialog.module.css)와 짝이에요. 한쪽을 바꾸면 다른 쪽도 맞춰주세요.
  //  - 가로 화면: 펫 중심이 화면 왼쪽 28% 지점, 말풍선은 44%부터
  //  - 세로 화면: 펫 중심이 위에서 30% 지점, 말풍선은 45%부터
  const focus = portrait
    ? {
        x: 0,
        y: viewport.height * 0.2,
        scale: Math.min(viewport.width * 0.42, viewport.height * 0.3),
        turn: 0,
      }
    : {
        x: -viewport.width * 0.22,
        y: -0.05,
        scale: Math.min(viewport.height * 0.38, viewport.width * 0.3),
        turn: 0.32, // 말풍선 쪽(오른쪽)으로 살짝 고개 돌리기
      };

  return { k, a, b, tilt, petScale, portrait, focus };
}

interface OrbitSceneProps {
  /** 포커스된 펫 slug (URL에서 결정). null이면 메인 궤도 화면 */
  focusSlug: string | null;
  onSelect: (slug: string) => void;
}

export function OrbitScene({ focusSlug, onSelect }: OrbitSceneProps) {
  const { k, a, b, tilt, petScale, portrait, focus } = useOrbitLayout();
  const hoveredSlug = useSceneStore((s) => s.hoveredSlug);
  const orbitRef = useRef<Group>(null);
  const petRefs = useRef<(Group | null)[]>([]);
  const angle = useRef(0);
  // 초기값은 처음 들어온 URL 기준 → /music으로 바로 접속하면 전환이 끝난 상태에서 시작
  const speed = useRef(focusSlug ? 0 : ORBIT_SPEED);
  /** 각 펫이 포커스 위치로 얼마나 이동했는지 (0 = 궤도, 1 = 포커스) */
  const focusT = useRef<number[]>(pets.map((p) => (p.slug === focusSlug ? 1 : 0)));
  /** 포커스 모드 진입 정도 (0 = 메인, 1 = 다른 펫·프로필이 완전히 사라짐) */
  const hideT = useRef(focusSlug ? 1 : 0);
  const target = useMemo(() => new Vector3(), []);

  useEffect(() => {
    document.body.style.cursor = hoveredSlug && !focusSlug ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hoveredSlug, focusSlug]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    // 호버 중이거나 포커스 모드면 궤도가 부드럽게 멈춤 (각도는 유지 → 돌아올 때 제자리로)
    const paused = focusSlug || useSceneStore.getState().hoveredSlug;
    speed.current = MathUtils.damp(speed.current, paused ? 0 : ORBIT_SPEED, 5, dt);
    angle.current += speed.current * dt;
    hideT.current = MathUtils.damp(hideT.current, focusSlug ? 1 : 0, FOCUS_LAMBDA, dt);

    const orbit = orbitRef.current;
    if (!orbit) return;
    // 포커스 위치(월드)를 궤도 그룹 기준 좌표로 변환 (궤도 그룹은 기울어지고 배율이 걸려 있음)
    target.set(focus.x, focus.y, 0);
    orbit.worldToLocal(target);

    petRefs.current.forEach((g, i) => {
      if (!g) return;
      // 앞쪽(+z)에서 시작해 고르게 배치
      const theta = angle.current + Math.PI / 2 + (i / pets.length) * Math.PI * 2;
      const ox = Math.cos(theta) * a;
      const oz = Math.sin(theta) * b;

      const isFocus = pets[i].slug === focusSlug;
      const f = MathUtils.damp(focusT.current[i], isFocus ? 1 : 0, FOCUS_LAMBDA, dt);
      focusT.current[i] = f;
      const e = smoothstep(f);

      g.position.set(
        MathUtils.lerp(ox, target.x, e),
        MathUtils.lerp(0, target.y, e),
        MathUtils.lerp(oz, target.z, e),
      );
      // 포커스 모드에선 나머지는 작아지며 사라지고, 포커스 펫만 커짐
      const s = MathUtils.lerp(1 - hideT.current, focus.scale / k, e);
      g.scale.setScalar(Math.max(s, 0.0001));
      g.visible = s > 0.01;
    });
  });

  return (
    <group scale={k}>
      {/* 사진이 로드되는 동안에도 펫은 먼저 보이도록 프로필만 따로 Suspense */}
      <Suspense fallback={null}>
        <ProfileAvatar hideRef={hideT} />
      </Suspense>
      <group ref={orbitRef} position={[0, ORBIT_Y, 0]} rotation={[tilt, 0, 0]}>
        {pets.map((pet, i) => (
          <group key={pet.slug} ref={(el) => void (petRefs.current[i] = el)}>
            <OrbitPet
              pet={pet}
              index={i}
              baseScale={petScale}
              focused={pet.slug === focusSlug}
              interactive={!focusSlug}
              turn={focus.turn}
              onSelect={onSelect}
            />
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

interface OrbitPetProps {
  pet: Pet;
  index: number;
  baseScale: number;
  focused: boolean;
  interactive: boolean;
  /** 포커스 시 y축으로 돌릴 각도 (rad) */
  turn: number;
  onSelect: (slug: string) => void;
}

function OrbitPet({ pet, index, baseScale, focused, interactive, turn, onSelect }: OrbitPetProps) {
  const ref = useRef<Group>(null);
  const hovered = useSceneStore((s) => s.hoveredSlug === pet.slug);
  const setHovered = useSceneStore((s) => s.setHovered);
  const phase = index * 1.3;
  const size = useRef(focused ? 1 : baseScale);
  const talkAmp = useRef(0);
  const yaw = useRef(focused ? turn : 0);

  useFrame(({ clock, camera }, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    const t = clock.elapsedTime;

    // 말하는 중이면 통통 튀기 (진폭을 부드럽게 올리고 내림)
    const talking = focused && useSceneStore.getState().talking;
    talkAmp.current = MathUtils.damp(talkAmp.current, talking ? 1 : 0, 8, dt);
    const amp = talkAmp.current;
    const hop = Math.abs(Math.sin(t * 9)) * 0.1 * amp;
    // 바닥에 닿을 때 납작, 위로 뜰 때 길쭉 (squash & stretch)
    const squash = -Math.cos(t * 18) * 0.06 * amp;

    // 둥둥 떠다니기 + 흔들림
    g.position.y = Math.sin(t * 1.6 + phase) * (focused ? 0.06 : 0.12) + hop;
    const rz = Math.sin(t * 1.1 + phase) * 0.06;

    const targetSize = focused ? 1 : baseScale * (hovered && interactive ? HOVER_SCALE : 1);
    size.current = MathUtils.damp(size.current, targetSize, 10, dt);
    const s = size.current;
    g.scale.set(s * (1 - squash * 0.5), s * (1 + squash), s * (1 - squash * 0.5));

    // 항상 카메라를 바라보고, 포커스 중엔 말풍선 쪽으로 살짝 고개를 돌림
    yaw.current = MathUtils.damp(yaw.current, focused ? turn : 0, 4, dt);
    g.lookAt(camera.position);
    g.rotation.z = rz;
    g.rotateY(yaw.current);
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHovered(pet.slug);
      }}
      onPointerOut={() => {
        if (useSceneStore.getState().hoveredSlug === pet.slug) setHovered(null);
      }}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHovered(null);
        onSelect(pet.slug);
      }}
    >
      <PetModel color={pet.color} cheek={pet.cheek} ears={pet.ears} />
      {hovered && interactive && (
        <Html position={[0, -0.78, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="pet-tag">
            {pet.emoji} {pet.name} <span>· {pet.persona}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ProfileAvatar({ hideRef }: { hideRef: RefObject<number> }) {
  const ref = useRef<Group>(null);
  const texture = useTexture(profile.photo, (t) => {
    t.colorSpace = SRGBColorSpace;
  });

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.position.y = PROFILE_Y + Math.sin(clock.elapsedTime * 0.9) * 0.04;
    // 포커스 모드에선 작아지며 사라짐
    const s = 1 - hideRef.current;
    g.scale.setScalar(Math.max(s, 0.0001));
    g.visible = s > 0.01;
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
