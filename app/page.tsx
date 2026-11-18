import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { WeeklyDashboard } from '@/components/weekly-dashboard';
import styles from '@/components/weekly-dashboard.module.css';

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">The Life Edit <span aria-hidden="true">✳</span></Link>
          <Navigation className={styles.navigation} currentWeek />
        </div>
      </header>
      <WeeklyDashboard />
    </>
  );
}
