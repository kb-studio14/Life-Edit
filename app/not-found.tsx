import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-frame">
      <h1 className="page-title mb-6">Page not found</h1>
      <Link className="primary-action" href="/">Return home</Link>
    </main>
  );
}
