'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navigation.module.css';

const links = [
  ['This week', '/'],
  ['My DNA', '/dna'],
  ['My Edit', '/edit'],
  ['My Plans', '/plans'],
  ['My Finds', '/finds'],
];

export function Navigation() {
  const pathname = usePathname();
  const activePage = pathname === '/onboarding' ? '/dna' : pathname;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✳</span>
          The Life Edit
        </Link>
        <nav className={styles.links} aria-label="Main navigation">
          {links.map(([title, href]) => (
            <Link href={href} key={href} aria-current={activePage === href ? 'page' : undefined}>
              {title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
