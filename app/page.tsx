import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { WeeklyDashboard } from '@/components/weekly-dashboard';
import { WeeklyEdit } from '@/components/weekly-edit';
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
      <WeeklyDashboard>
        <section id="weekly-edit" className="mt-9 scroll-mt-6" aria-labelledby="weekly-edit-heading">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id="weekly-edit-heading" className="font-serif text-3xl tracking-tight">Weekly Edit</h2>
            <p className="text-sm text-[#565a50]">Demo ideas</p>
          </div>
          <WeeklyEdit heading="h3" />
        </section>
      </WeeklyDashboard>
    </>
  );
}
