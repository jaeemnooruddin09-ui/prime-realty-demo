import SavedSearchList from '@/components/SavedSearchList';

export const metadata = {
  title: 'Saved Searches',
  description: 'Searches you have saved. Click to re-run any time.',
};

export default function SavedSearchesPage() {
  return (
    <section className="container-x py-12">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-navy-900 font-semibold">Saved searches</h1>
        <p className="text-navy-500 mt-2">Saved here only on this device. Each search runs live against the current catalog.</p>
      </div>
      <SavedSearchList />
    </section>
  );
}
