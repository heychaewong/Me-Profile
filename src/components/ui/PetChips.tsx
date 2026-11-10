'use client';

import Link from 'next/link';
import { pets } from '@/data/pets';
import { useSceneStore } from '@/lib/store';
import styles from './PetChips.module.css';

/**
 * 하단 펫 바로가기. 3D를 못 쓰는 환경·키보드 사용자를 위한 대체 내비게이션이자,
 * 호버하면 3D 궤도도 함께 멈춰요.
 */
export function PetChips() {
  const hoveredSlug = useSceneStore((s) => s.hoveredSlug);
  const setHovered = useSceneStore((s) => s.setHovered);

  return (
    <nav className={styles.chips} aria-label="자아 목록">
      {pets.map((pet) => (
        <Link
          key={pet.slug}
          href={`/${pet.slug}`}
          className={styles.chip}
          data-active={hoveredSlug === pet.slug || undefined}
          style={{ '--pet': pet.color } as React.CSSProperties}
          onMouseEnter={() => setHovered(pet.slug)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(pet.slug)}
          onBlur={() => setHovered(null)}
          onClick={() => setHovered(null)}
        >
          <span aria-hidden>{pet.emoji}</span>
          {pet.persona}
        </Link>
      ))}
    </nav>
  );
}
