'use client';

import { useEffect } from 'react';
import type { Pet } from '@/data/pets';

/**
 * 펫 페이지에 있는 동안 페이지 배경(--bg)을 펫 색으로 바꿔요.
 * body의 background-color transition 덕분에 부드럽게 전환되고,
 * 페이지를 떠나면(언마운트) 원래 배경으로 돌아가요. 라이트/다크 색은 globals.css에서 골라요.
 */
export function PetBackdrop({ background }: { background: Pet['background'] }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--pet-bg-light', background.light);
    root.style.setProperty('--pet-bg-dark', background.dark);
    root.dataset.pet = '';
    return () => {
      delete root.dataset.pet;
    };
  }, [background.light, background.dark]);

  return null;
}
