import { FindCollections } from '@/components/find-collections';

export default function Page() {
  return (
    <main className="page-frame">
      <h1 className="page-title">My finds</h1>
      <p className="muted-text mt-3 mb-6">Save and organize links from across the web. Collections are saved in this browser.</p>
      <FindCollections />
    </main>
  );
}
