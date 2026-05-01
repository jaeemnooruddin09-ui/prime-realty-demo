import { getDb } from '@/lib/db';
import PropertyForm from '@/components/admin/PropertyForm';

export default function NewProperty() {
  const db = getDb();
  const agents = db.prepare('SELECT id, name FROM agents ORDER BY name').all();
  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Add property</h1>
      <p className="text-navy-500 mt-1">Fill in the details and upload at least one photo.</p>
      <div className="mt-6">
        <PropertyForm agents={agents} mode="create" />
      </div>
    </>
  );
}
