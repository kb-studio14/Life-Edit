import type { ReactNode } from 'react';

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="page-frame">
      <h1 className="page-title mb-7">{title}</h1>
      {children}
      <footer className="muted-text mt-12 border-t border-(--border) pt-5 text-xs">
        Demo only · No live Pinterest or calendar integration
      </footer>
    </main>
  );
}
