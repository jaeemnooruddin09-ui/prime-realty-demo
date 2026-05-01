import CompareTable from '@/components/CompareTable';

export const metadata = {
  title: 'Compare Properties',
  description: 'Compare up to four properties side by side. Price, bedrooms, bathrooms, size, location.',
};

export default function ComparePage() {
  return (
    <section className="container-x py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-navy-900 font-semibold">Compare properties</h1>
        <p className="text-navy-500 mt-2">Compare up to four properties side by side.</p>
      </div>
      <CompareTable />
    </section>
  );
}
