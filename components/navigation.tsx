import Link from 'next/link';

const links = [
  ['My DNA', '/dna'],
  ['My Edit', '/edit'],
  ['My Plans', '/plans'],
  ['My Finds', '/finds'],
];

export function Navigation({ className, currentWeek = false }: {
  className?: string;
  currentWeek?: boolean;
}) {
  return (
    <nav aria-label="Main navigation" className={className ?? 'flex flex-wrap gap-6 border-b border-stone-200 py-6 text-sm'}>
      {currentWeek && <Link href="/" aria-current="page">This week</Link>}
      {links.map(([title, href]) => <Link href={href} key={href}>{title}</Link>)}
    </nav>
  );
}
