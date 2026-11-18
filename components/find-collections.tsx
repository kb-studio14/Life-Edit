'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { COLLECTIONS_STORAGE_KEY, readFindCollections, type FindCollection, type SavedFind } from '@/lib/find-collections';
import { FindFeedPreview } from './find-feed-preview';
import { SavedFindForm } from './saved-find-form';

type ChangeCollections = (update: (collections: FindCollection[]) => FindCollection[], message: string) => void;

function CollectionNameForm({ name = '', onSave, onCancel }: {
  name?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(name);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim()) onSave(draft.trim());
  }

  return (
    <form className="mt-3 space-y-2" onSubmit={submit}>
      <label className="block text-sm font-semibold" htmlFor={id}>Collection name</label>
      <input className="field-control" id={id} value={draft} onChange={(event) => setDraft(event.target.value)}
        placeholder="e.g. Favorite brands" maxLength={80} required />
      <div className="flex flex-wrap gap-2">
        <button className="primary-action" type="submit" disabled={!draft.trim()}>{name ? 'Save name' : 'Create'}</button>
        <button className="secondary-action" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function FindCard({ find, destinations, onEdit, onMove, onRemove }: {
  find: SavedFind;
  destinations: FindCollection[];
  onEdit: () => void;
  onMove: (id: string) => void;
  onRemove: () => void;
}) {
  const host = new URL(find.url).hostname.replace(/^www\./i, '');

  return (
    <li className="surface-card p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--accent-soft) text-lg font-semibold text-(--accent-hover)">
          {host[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="card-title [overflow-wrap:anywhere]">
            <a className="hover:underline" href={find.url} target="_blank" rel="noreferrer">{find.title} <span className="text-sm text-(--accent-hover)" aria-hidden="true">→</span></a>
          </h3>
          <p className="muted-text mt-0.5 text-sm [overflow-wrap:anywhere]">{host}</p>
        </div>
      </div>
      {find.note && <p className="muted-text mt-3 whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{find.note}</p>}
      {find.updatesUrl && (
        <a className="text-action mt-3 inline-block text-sm font-semibold" href={find.updatesUrl} target="_blank" rel="noreferrer">New arrivals <span aria-hidden="true">→</span></a>
      )}
      {find.feedUrl && <FindFeedPreview key={find.feedUrl} url={find.feedUrl} />}
      <div className="muted-text mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--border) pt-2 text-sm">
        <button type="button" className="min-h-8 cursor-pointer hover:underline" aria-label={`Edit ${find.title}`} onClick={onEdit}>Edit</button>
        {destinations.length > 0 && (
          <select
            className="max-w-full cursor-pointer rounded-md border border-(--border) px-2 py-1 focus-visible:outline-2 focus-visible:outline-(--accent)"
            aria-label={`Move ${find.title} to another collection`}
            value=""
            onChange={(event) => onMove(event.currentTarget.value)}
          >
            <option value="" disabled>Move to…</option>
            {destinations.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
          </select>
        )}
        <button type="button" className="min-h-8 cursor-pointer hover:underline" aria-label={`Remove ${find.title}`} onClick={onRemove}>Remove</button>
      </div>
    </li>
  );
}

function CollectionView({ collection, destinations, changeCollections }: {
  collection: FindCollection;
  destinations: FindCollection[];
  changeCollections: ChangeCollections;
}) {
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const editedFind = collection.finds.find((find) => find.id === editing);
  const query = search.trim().toLowerCase();
  const visibleFinds = collection.finds.filter((find) =>
    [find.title, find.url, find.note].some((value) => value.toLowerCase().includes(query)));

  function changeCollection(update: (current: FindCollection) => FindCollection, message: string) {
    changeCollections((collections) => collections.map((current) =>
      current.id === collection.id ? update(current) : current), message);
  }

  function saveFind(find: SavedFind) {
    const isNew = editing === 'new';
    changeCollection((current) => ({
      ...current,
      finds: isNew ? [find, ...current.finds] : current.finds.map((item) => item.id === find.id ? find : item),
    }), isNew ? 'Link saved.' : 'Link updated.');
    if (isNew) setSearch('');
    setEditing(null);
  }

  function moveFind(find: SavedFind, destinationId: string) {
    changeCollections((collections) => {
      const source = collections.find((item) => item.id === collection.id);
      const destination = collections.find((item) => item.id === destinationId);
      const saved = source?.finds.find((item) => item.id === find.id);
      if (!saved || !destination || destination.id === source?.id) return collections;

      return collections.map((item) => {
        if (item.id === destination.id) return { ...item, finds: [saved, ...item.finds] };
        if (item.id === collection.id) return { ...item, finds: item.finds.filter((entry) => entry.id !== saved.id) };
        return item;
      });
    }, 'Link moved.');
  }

  function removeCollection() {
    if (!window.confirm(`Delete “${collection.name}” and its saved links?`)) return;
    changeCollections((collections) => collections.filter((item) => item.id !== collection.id), 'Collection deleted.');
  }

  return (
    <section className="min-w-0" aria-labelledby="collection-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="collection-heading" className="section-title [overflow-wrap:anywhere]">{collection.name}</h2>
          <p className="muted-text mt-1 text-sm">{collection.finds.length} saved {collection.finds.length === 1 ? 'link' : 'links'}</p>
        </div>
        <button type="button" className="primary-action" onClick={() => setEditing('new')}>+ Save a link</button>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="button" className="text-action text-sm" onClick={() => setRenaming(!renaming)}>Rename collection</button>
        <button type="button" className="muted-text cursor-pointer text-sm hover:underline" onClick={removeCollection}>Delete collection</button>
      </div>
      {renaming && (
        <div className="surface-card mb-4 p-4">
          <CollectionNameForm
            name={collection.name}
            onCancel={() => setRenaming(false)}
            onSave={(name) => {
              changeCollection((current) => ({ ...current, name }), 'Collection renamed.');
              setRenaming(false);
            }}
          />
        </div>
      )}
      {(editing === 'new' || editedFind) && (
        <SavedFindForm key={editing} find={editedFind} onSave={saveFind} onCancel={() => setEditing(null)} />
      )}
      {collection.finds.length > 0 && (
        <label className="mb-4 block">
          <span className="sr-only">Search this collection</span>
          <input type="search" className="field-control" placeholder="Search this collection…"
            value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      )}
      {visibleFinds.length > 0 ? (
        <ul className="grid list-none gap-3 xl:grid-cols-2">
          {visibleFinds.map((find) => (
            <FindCard
              key={find.id}
              find={find}
              destinations={destinations}
              onEdit={() => setEditing(find.id)}
              onMove={(id) => moveFind(find, id)}
              onRemove={() => {
                if (window.confirm(`Remove “${find.title}” from this collection?`)) {
                  changeCollection((current) => ({ ...current, finds: current.finds.filter((item) => item.id !== find.id) }), 'Link removed.');
                }
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="surface-card muted-text p-5 text-sm">
          {collection.finds.length ? 'No links match your search.' : 'No saved links yet. Paste a website address to add your first find.'}
        </p>
      )}
    </section>
  );
}

export function FindCollections() {
  const [collections, setCollections] = useState<FindCollection[]>([]);
  const [selected, setSelected] = useState('');
  const [creating, setCreating] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    function read() {
      try {
        setCollections(readFindCollections());
        setStorageUnavailable(false);
      } catch {
        setStorageUnavailable(true);
      }
      setReady(true);
    }

    function sync(event: StorageEvent) {
      if (event.key === COLLECTIONS_STORAGE_KEY || event.key === null) read();
    }

    read();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const changeCollections: ChangeCollections = (update, message) => {
    let next: FindCollection[] | undefined;
    try {
      next = update(storageUnavailable ? collections : readFindCollections());
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(next));
      setCollections(next);
      setStorageUnavailable(false);
    } catch {
      setCollections(next ?? update(collections));
      setStorageUnavailable(true);
    }
    setStatus(message);
  };

  const active = collections.find((collection) => collection.id === selected) ?? collections[0];

  return (
    <>
      <div className="grid items-start gap-5 md:grid-cols-[245px_minmax(0,1fr)]">
        <aside aria-labelledby="collections-heading" className="surface-card p-4">
          <h2 id="collections-heading" className="card-title">Collections</h2>
          <button type="button" className="secondary-action mt-3" onClick={() => setCreating(!creating)} disabled={!ready}>+ New collection</button>
          {creating && (
            <CollectionNameForm
              onCancel={() => setCreating(false)}
              onSave={(name) => {
                const id = crypto.randomUUID();
                changeCollections((current) => [...current, { id, name, finds: [] }], 'Collection created.');
                setSelected(id);
                setCreating(false);
              }}
            />
          )}
          {collections.length > 0 && (
            <ul className="mt-4 grid gap-1">
              {collections.map((collection) => (
                <li key={collection.id} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={collection.id === active?.id}
                    onClick={() => setSelected(collection.id)}
                    className="option-control flex w-full items-center justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere]">{collection.name}</span>
                    <span className="muted-text text-xs">{collection.finds.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        {active ? (
          <CollectionView
            key={active.id}
            collection={active}
            destinations={collections.filter((collection) => collection.id !== active.id)}
            changeCollections={changeCollections}
          />
        ) : (
          <div className="surface-card p-5 sm:p-7">
            <h2 className="section-title">Save something to come back to</h2>
            <p className="muted-text mt-2">{ready ? 'Create a collection for favorite brands, gift ideas, or anything else you find online.' : 'Loading your collections…'}</p>
          </div>
        )}
      </div>
      <p className="muted-text mt-5 text-sm" role="status">
        {storageUnavailable ? 'Browser storage is unavailable. Changes may be lost when you leave this page.' : status}
      </p>
    </>
  );
}
