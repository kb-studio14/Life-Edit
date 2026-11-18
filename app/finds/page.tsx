import { Shell } from '@/components/shell';

export default function Page() {
  return (
    <Shell title="My finds">
      <p className="muted-text mb-6">Curated shopping concepts, not live products or prices.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {['The safari edit', 'For your home', 'Thoughtful gifts'].map((title) => (
          <article key={title} className="surface-card p-5 sm:p-6">
            <h2 className="card-title">{title}</h2>
          </article>
        ))}
      </div>
    </Shell>
  );
}
