import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { parsePhotos } from '@/lib/site';
import PropertyForm from '@/components/admin/PropertyForm';

export default function EditProperty({ params }) {
  const db = getDb();
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(parseInt(params.id));
  if (!property) notFound();
  const agents = db.prepare('SELECT id, name FROM agents ORDER BY name').all();

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Edit property</h1>
      <p className="text-navy-500 mt-1">Update details, photos, or status.</p>
      <div className="mt-6">
        <PropertyForm
          agents={agents}
          mode="edit"
          property={{ ...property, photos: parsePhotos(property.photos), floor_plans: parsePhotos(property.floor_plans) }}
        />
      </div>
    </>
  );
}
