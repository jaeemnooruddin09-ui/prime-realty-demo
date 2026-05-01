import SavedList from '@/components/SavedList';
import { FAVORITES_KEY } from '@/lib/storage';

export const metadata = {
  title: 'Saved Properties',
  description: 'Your saved properties. Pick up where you left off and find your next home.',
};

export default function FavoritesPage() {
  return (
    <section className="container-x py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-navy-900 font-semibold">Saved properties</h1>
        <p className="text-navy-500 mt-2">Properties you have saved while browsing. Saved here only on this device.</p>
      </div>
      <SavedList
        storageKey={FAVORITES_KEY}
        emptyTitle="No saved properties yet"
        emptyText="Tap the heart on any listing to save it. Come back to compare your shortlist or share with family."
        ctaLabel="Browse properties"
        ctaHref="/properties"
      />
    </section>
  );
}
