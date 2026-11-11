'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Pet } from '@/data/pets';
import { useSceneStore } from '@/lib/store';
import styles from './PetDialog.module.css';

/** 펫이 앞으로 나오는 동안 기다렸다가 말하기 시작 (ms) */
const START_DELAY = 900;
const CHAR_DELAY = 42;
/** 문장부호 뒤에서 잠깐 쉬기 (ms) */
const PAUSE_DELAY = 260;
const PAUSE_CHARS = ',.!?…~';

/**
 * 펫 오른쪽(모바일은 아래)에 뜨는 말풍선.
 * lines를 한 줄씩 타이핑 효과로 보여주고, 타이핑 중에는 store.talking=true → 3D 펫이 통통 튐.
 * "다음": 타이핑 중이면 문장 즉시 완성, 다 나왔으면 다음 줄.
 */
export function PetDialog({ pet }: { pet: Pet }) {
  const router = useRouter();
  const setTalking = useSceneStore((s) => s.setTalking);
  const [started, setStarted] = useState(false);
  const [line, setLine] = useState(0);
  const [count, setCount] = useState(0);

  const text = pet.lines[line] ?? '';
  const lineDone = count >= text.length;
  const typing = started && !lineDone;
  const isLast = line >= pet.lines.length - 1;

  useEffect(() => {
    const id = setTimeout(() => setStarted(true), START_DELAY);
    return () => clearTimeout(id);
  }, []);

  // 한 글자씩 타이핑
  useEffect(() => {
    if (!started || count >= text.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prev = text[count - 1] ?? '';
    const delay = reduceMotion ? 0 : PAUSE_CHARS.includes(prev) ? PAUSE_DELAY : CHAR_DELAY;
    const id = setTimeout(() => setCount(reduceMotion ? text.length : count + 1), delay);
    return () => clearTimeout(id);
  }, [started, count, text]);

  // 말하는 중인지 3D 씬에 알려주기
  useEffect(() => {
    setTalking(typing);
  }, [typing, setTalking]);
  useEffect(() => () => setTalking(false), [setTalking]);

  // Esc로 돌아가기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const next = () => {
    if (!started) {
      setStarted(true);
      setCount(text.length);
      return;
    }
    if (!lineDone) {
      setCount(text.length);
      return;
    }
    setLine(isLast ? 0 : line + 1);
    setCount(0);
  };

  const label = !lineDone || !isLast ? '다음' : '다시 듣기';

  return (
    <section
      className={styles.wrap}
      aria-label={`${pet.name}의 소개`}
      data-interactive
      style={{ '--pet': pet.color } as React.CSSProperties}
    >
      <div className={styles.bubble} onClick={next}>
        <p className={styles.speaker}>
          {pet.emoji} {pet.name} <span>· {pet.persona}</span>
        </p>

        {/* 전체 문장을 투명하게 깔아 높이를 미리 확보 → 타이핑 중 말풍선 크기가 흔들리지 않음 */}
        <p className={styles.text} aria-hidden>
          <span className={styles.ghost}>{text}</span>
          <span>
            {text.slice(0, started ? count : 0)}
            <span className={styles.caret} data-on={typing || undefined} />
          </span>
        </p>
        <p className="sr-only" aria-live="polite">
          {started ? text : ''}
        </p>

        <div className={styles.footer}>
          <ol className={styles.dots} aria-label={`${pet.lines.length}줄 중 ${line + 1}번째`}>
            {pet.lines.map((_, i) => (
              <li key={i} data-active={i === line || undefined} data-past={i < line || undefined} />
            ))}
          </ol>
          <button
            type="button"
            className={styles.next}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            {label}
            <span aria-hidden>{label === '다음' ? ' ▸' : ' ↺'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
