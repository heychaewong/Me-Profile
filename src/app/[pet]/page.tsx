import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPet, pets } from '@/data/pets';
import { PetBackdrop } from '@/components/ui/PetBackdrop';
import { PetDialog } from '@/components/ui/PetDialog';
import styles from './page.module.css';

// pets.ts에 있는 slug만 미리 만들어 두고, 그 외 주소는 아래 notFound()로 404
export function generateStaticParams() {
  return pets.map((p) => ({ pet: p.slug }));
}

export async function generateMetadata(props: PageProps<'/[pet]'>): Promise<Metadata> {
  const pet = getPet((await props.params).pet);
  return pet ? { title: `${pet.emoji} ${pet.persona} · ${pet.name}` } : {};
}

/**
 * 펫 포커스 화면. 3D 전환(펫이 앞으로 나오기)은 layout의 Stage가 URL을 보고 처리하고,
 * 이 페이지는 그 위에 겹치는 HTML(배경색, 말풍선, 돌아가기)만 담당해요.
 */
export default async function PetPage(props: PageProps<'/[pet]'>) {
  const pet = getPet((await props.params).pet);
  if (!pet) notFound();

  return (
    <main className="overlay">
      <PetBackdrop background={pet.background} />
      <h1 className="sr-only">
        {pet.name} · {pet.persona}
      </h1>
      <Link href="/" className={styles.back}>
        <span aria-hidden>←</span> 돌아가기
      </Link>
      {/* key: 펫이 바뀌면 대사 상태를 처음부터 */}
      <PetDialog key={pet.slug} pet={pet} />
    </main>
  );
}
