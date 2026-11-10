import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPet, pets } from '@/data/pets';

// pets.ts에 있는 slug만 미리 만들어 두고, 그 외 주소는 아래 notFound()로 404
export function generateStaticParams() {
  return pets.map((p) => ({ pet: p.slug }));
}

export async function generateMetadata(props: PageProps<'/[pet]'>): Promise<Metadata> {
  const pet = getPet((await props.params).pet);
  return pet ? { title: `${pet.emoji} ${pet.persona} · ${pet.name}` } : {};
}

// TODO(2단계): 펫 포커스 전환 · 말풍선 대사 · 카드 리스트
export default async function PetPage(props: PageProps<'/[pet]'>) {
  const pet = getPet((await props.params).pet);
  if (!pet) notFound();

  return (
    <main className="overlay" style={{ padding: '72px 16px' }}>
      <h1>
        {pet.emoji} {pet.name} · {pet.persona}
      </h1>
      <p style={{ marginTop: 8, color: 'var(--fg-muted)' }}>이 화면은 2단계에서 만들어요.</p>
      <Link href="/" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'underline' }}>
        ← 돌아가기
      </Link>
    </main>
  );
}
