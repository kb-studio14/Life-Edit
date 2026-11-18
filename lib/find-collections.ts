export const COLLECTIONS_STORAGE_KEY = 'life-edit-collections-v1';

export type SavedFind = {
  id: string;
  url: string;
  title: string;
  note: string;
  updatesUrl?: string;
  feedUrl?: string;
};

export type FindCollection = {
  id: string;
  name: string;
  finds: SavedFind[];
};

export function webUrl(value: string, base?: string): URL | null {
  const text = value.trim();
  if (!text) return null;

  try {
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(text);
    const address = base || hasScheme
      ? text
      : 'https://' + text.replace(/^\/\//, '');
    const url = new URL(address, base);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

function isStoredUrl(value: unknown): value is string {
  return typeof value === 'string' && webUrl(value)?.href === value;
}

function isSavedFind(value: unknown): value is SavedFind {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SavedFind>;
  return typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.note === 'string' && isStoredUrl(item.url) &&
    (item.updatesUrl === undefined || isStoredUrl(item.updatesUrl)) &&
    (item.feedUrl === undefined || isStoredUrl(item.feedUrl));
}

function isCollection(value: unknown): value is FindCollection {
  if (!value || typeof value !== 'object') return false;
  const collection = value as Partial<FindCollection>;
  return typeof collection.id === 'string' && typeof collection.name === 'string' &&
    Array.isArray(collection.finds) && collection.finds.every(isSavedFind);
}

export function readFindCollections(): FindCollection[] {
  const stored = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
  if (!stored) return [];
  const collections: unknown = JSON.parse(stored);
  if (!Array.isArray(collections) || !collections.every(isCollection)) {
    throw new Error('Saved collections could not be read.');
  }
  return collections;
}
