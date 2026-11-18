'use client';

import { useState } from 'react';
import { webUrl } from '@/lib/find-collections';

type FeedItem = { title: string; href: string; published: number };
type Preview = 'idle' | 'loading' | 'error' | FeedItem[];

function parseFeed(xml: string, base: string): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (!['rss', 'feed', 'rdf'].includes(doc.documentElement.localName.toLowerCase())) {
    throw new Error('Expected an RSS or Atom feed.');
  }

  const items: FeedItem[] = [];
  for (const entry of doc.querySelectorAll('item, entry')) {
    const children = Array.from(entry.children);
    const title = children.find((child) => child.localName === 'title')?.textContent?.trim();
    const link = children.find((child) => child.localName === 'link' &&
      (!child.hasAttribute('rel') || child.getAttribute('rel') === 'alternate'));
    const url = webUrl(link?.getAttribute('href') ?? link?.textContent ?? '', base);
    if (!title || !url) continue;

    const date = children.find((child) => ['pubDate', 'published', 'updated', 'date'].includes(child.localName));
    items.push({ title, href: url.href, published: Date.parse(date?.textContent ?? '') || 0 });
  }
  return items.sort((left, right) => right.published - left.published).slice(0, 5);
}

export function FindFeedPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<Preview>('idle');

  async function loadPreview() {
    setPreview('loading');
    try {
      const response = await fetch(url, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(8_000),
      });
      const limit = 1_000_000;
      if (!response.ok || Number(response.headers.get('content-length')) > limit) {
        throw new Error('Feed could not be loaded.');
      }
      const text = await response.text();
      if (text.length > limit) throw new Error('Feed is too large to preview.');
      setPreview(parseFeed(text, response.url || url));
    } catch {
      setPreview('error');
    }
  }

  const loaded = Array.isArray(preview);

  return (
    <div className="mt-4 border-t border-(--border) pt-3">
      <button
        type="button"
        className="text-action text-sm font-semibold disabled:cursor-default"
        disabled={preview === 'loading'}
        onClick={loadPreview}
      >
        {preview === 'loading' ? 'Loading updates…' : loaded ? 'Refresh updates' : 'Preview updates'}
      </button>
      <div className="muted-text mt-2 text-sm" aria-live="polite">
        {preview === 'error' && <p>This feed couldn’t be previewed. Check the feed URL or open the website.</p>}
        {loaded && (
          preview.length > 0 ? (
            <ul className="space-y-2">
              {preview.map(({ title, href, published }, index) => (
                <li key={`${href}-${index}`} className="flex flex-wrap items-baseline gap-x-2 break-words">
                  <a className="text-action min-w-0 [overflow-wrap:anywhere]" href={href} target="_blank" rel="noreferrer">{title}</a>
                  {published > 0 && <time dateTime={new Date(published).toISOString()} className="text-xs">
                    {new Date(published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </time>}
                </li>
              ))}
            </ul>
          ) : <p>No recent items in this feed.</p>
        )}
      </div>
    </div>
  );
}
