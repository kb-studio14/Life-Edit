'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STORAGE_KEY, isLifePreferences, buildLifeDNA, type LifePreferences } from '@/lib/life-dna';

export default function DNA() {
  const [preferences, setPreferences] = useState<LifePreferences | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (isLifePreferences(value)) setPreferences(value);
      }
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) return <main className="page-frame muted-text">Loading your edit…</main>;

  if (!preferences) {
    return (
      <main className="page-frame">
        <h1 className="page-title">Your Life DNA starts with you.</h1>
        <p className="muted-text mt-4 mb-6">Complete a few questions to create your first personalized profile.</p>
        <Link className="primary-action" href="/onboarding">Start onboarding →</Link>
      </main>
    );
  }

  const dna = buildLifeDNA(preferences);

  function clear() {
    if (window.confirm('Delete your locally saved Life Edit answers?')) {
      window.localStorage.removeItem(STORAGE_KEY);
      setPreferences(null);
    }
  }

  return (
    <main className="page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="muted-text mb-2 text-sm">Your personal DNA · Based on your answers</p>
          <h1 className="page-title">{dna.name ? `${dna.name}'s Life DNA` : 'Your Life DNA'}</h1>
        </div>
        <Link className="secondary-action" href="/onboarding">Edit my answers</Link>
      </div>
      <section className="surface-card mt-7 p-6 sm:p-8">
        <p className="muted-text mb-2 text-sm">Your aesthetic direction</p>
        <h2 className="section-title">{dna.headline}</h2>
        <p className="muted-text mt-3 max-w-2xl">Your current preferences, expressed as a starting point—not a fixed label or an AI inference.</p>
      </section>
      <section className="mt-8">
        <h2 className="section-title">The areas you&apos;re designing</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dna.insights.map((item) => (
            <article className="surface-card p-5 sm:p-6" key={item.area}>
              <h3 className="card-title">{item.area}</h3>
              <p className="muted-text mt-2">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      {dna.goal && (
        <section className="surface-card mt-6 p-6">
          <h2 className="card-title">Your north star</h2>
          <p className="mt-2">{dna.goal}</p>
          <Link className="text-action mt-4 inline-block" href="/plans">Explore My Plans →</Link>
        </section>
      )}
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <Link className="text-action" href="/edit">Explore My Edit →</Link>
        <Link className="text-action" href="/finds">Explore My Finds →</Link>
        <button type="button" className="text-action" onClick={clear}>Delete my saved answers</button>
      </div>
      <p className="muted-text mt-8 border-t border-(--border) pt-5 text-xs">
        Saved in this browser only. No Pinterest, AI, account or database connection is active.
      </p>
    </main>
  );
}
