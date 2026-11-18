'use client';

import { useId, useState, type FormEvent } from 'react';
import { webUrl, type SavedFind } from '@/lib/find-collections';

export function SavedFindForm({ find, onSave, onCancel }: {
  find?: SavedFind;
  onSave: (find: SavedFind) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = webUrl(String(data.get('url') ?? ''));
    if (!url) return setError('Enter a valid website address.');

    const updates = String(data.get('updates') ?? '').trim();
    const feed = String(data.get('feed') ?? '').trim();
    const updatesUrl = webUrl(updates);
    const feedUrl = webUrl(feed);
    if (updates && !updatesUrl) return setError('Enter a valid new arrivals address.');
    if (feed && !feedUrl) return setError('Enter a valid RSS or Atom feed address.');

    onSave({
      id: find?.id ?? crypto.randomUUID(),
      url: url.href,
      title: String(data.get('title') ?? '').trim() || url.hostname.replace(/^www\./i, ''),
      note: String(data.get('note') ?? '').trim(),
      updatesUrl: updatesUrl?.href,
      feedUrl: feedUrl?.href,
    });
  }

  return (
    <form className="surface-card mb-5 space-y-4 p-4 sm:p-5" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold" htmlFor={`${id}-url`}>Website URL</label>
          <input className="field-control mt-1" id={`${id}-url`} name="url" inputMode="url"
            autoComplete="url" defaultValue={find?.url} placeholder="https://example.com" maxLength={2048} required />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor={`${id}-title`}>Name <span className="muted-text font-normal">(optional)</span></label>
          <input className="field-control mt-1" id={`${id}-title`} name="title" defaultValue={find?.title}
            placeholder="Brand, product, or page name" maxLength={120} />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor={`${id}-note`}>Notes <span className="muted-text font-normal">(optional)</span></label>
        <textarea className="field-control mt-1 block resize-y" id={`${id}-note`} name="note"
          rows={2} maxLength={1000} defaultValue={find?.note} placeholder="What do you want to remember?" />
      </div>
      <details open={find?.updatesUrl || find?.feedUrl ? true : undefined}>
        <summary className="text-action w-fit text-sm font-semibold">New arrivals and updates</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold" htmlFor={`${id}-updates`}>New arrivals URL</label>
            <input className="field-control mt-1" id={`${id}-updates`} name="updates" inputMode="url"
              defaultValue={find?.updatesUrl} placeholder="https://example.com/new" maxLength={2048} />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor={`${id}-feed`}>RSS or Atom feed URL</label>
            <input className="field-control mt-1" id={`${id}-feed`} name="feed" inputMode="url"
              defaultValue={find?.feedUrl} placeholder="https://example.com/feed.xml" maxLength={2048} />
          </div>
        </div>
        <p className="muted-text mt-2 text-xs">A public feed lets Life Edit preview recent posts when the site permits browser access.</p>
      </details>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button className="primary-action" type="submit">{find ? 'Save changes' : 'Save link'}</button>
        <button className="secondary-action" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
