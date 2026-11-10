'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'theme';

/**
 * 첫 페인트 전에 실행되어 테마 깜빡임을 막는 인라인 스크립트.
 * 저장된 값 → 없으면 OS 설정을 따름.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light');
}

export function ThemeToggle() {
  const theme = useTheme();
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={next === 'dark' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {}
      }}
    >
      <span aria-hidden>{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  );
}
