'use client';

import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitScene } from './OrbitScene';

/**
 * 루트 layout에 한 번만 렌더되는 3D 캔버스.
 * 라우트가 바뀌어도 언마운트되지 않으므로 화면 전환을 끊김 없이 애니메이션할 수 있어요.
 */
export default function Stage() {
  const router = useRouter();

  return (
    <div className="stage" aria-hidden>
      <Canvas
        flat // 톤매핑 끄기 → 파스텔 색이 탁해지지 않게
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 9], fov: 35 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#d6deff" />
        <OrbitScene onSelect={(slug) => router.push(`/${slug}`)} />
      </Canvas>
    </div>
  );
}
