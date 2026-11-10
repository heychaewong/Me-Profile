import { PetChips } from '@/components/ui/PetChips';
import { profile } from '@/data/profile';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={`overlay ${styles.home}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{profile.greeting}</h1>
        <p className={styles.tagline}>{profile.tagline}</p>
      </header>
      <footer className={styles.footer}>
        <PetChips />
      </footer>
    </main>
  );
}
