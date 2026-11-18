import { Shell } from '@/components/shell';

export default function Page() {
  return (
    <Shell title="My plans">
      <div className="grid gap-3 sm:grid-cols-3">
        {['Safari honeymoon', 'Wardrobe refresh', 'Host a dinner'].map((title) => (
          <article key={title} className="surface-card p-5 sm:p-6">
            <h2 className="card-title">{title}</h2>
            <p className="muted-text mt-2 text-sm">Example roadmap · Planning tools coming soon</p>
          </article>
        ))}
      </div>
    </Shell>
  );
}
