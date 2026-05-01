import Link from 'next/link';
import { getDb } from '@/lib/db';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import SortSelect from '@/components/SortSelect';
import ViewToggle from '@/components/ViewToggle';
import PropertiesMap from '@/components/PropertiesMap';
import SaveSearchButton from '@/components/SaveSearchButton';
import { PROPERTY_TYPES, SITE } from '@/lib/site';

export const metadata = {
  title: 'Browse Properties',
  description: `Browse all properties for sale and rent at ${SITE.name}. Filter by country, price, location, bedrooms, and property type.`,
};

const PER_PAGE = 12;

export default function PropertiesPage({ searchParams }) {
  const sp = searchParams || {};
  const view = sp.view === 'map' ? 'map' : 'grid';
  const page = Math.max(1, parseInt(sp.page) || 1);
  const q = (sp.q || '').toString().trim();
  const country = (sp.country || '').toString().trim();
  const listingType = (sp.listing_type || '').toString();
  const type = (sp.type || '').toString();
  const minPrice = parseInt(sp.min_price) || 0;
  const maxPrice = parseInt(sp.max_price) || 0;
  const minBeds = parseInt(sp.min_beds) || 0;
  const sort = (sp.sort || 'newest').toString();

  const where = [`status != 'draft'`];
  const params = {};
  if (q) {
    where.push(`(LOWER(title) LIKE @q OR LOWER(address) LIKE @q OR LOWER(city) LIKE @q OR LOWER(country) LIKE @q OR LOWER(description) LIKE @q)`);
    params.q = `%${q.toLowerCase()}%`;
  }
  if (country) {
    where.push(`country = @country`);
    params.country = country;
  }
  if (listingType === 'buy' || listingType === 'rent') {
    where.push(`listing_type = @listing_type`);
    params.listing_type = listingType;
  }
  if (PROPERTY_TYPES.includes(type)) {
    where.push(`type = @type`);
    params.type = type;
  }
  if (minPrice) {
    where.push(`price >= @min_price`);
    params.min_price = minPrice;
  }
  if (maxPrice) {
    where.push(`price <= @max_price`);
    params.max_price = maxPrice;
  }
  if (minBeds) {
    where.push(`bedrooms >= @min_beds`);
    params.min_beds = minBeds;
  }

  let order = 'created_at DESC';
  if (sort === 'price_asc') order = 'price ASC';
  if (sort === 'price_desc') order = 'price DESC';

  const db = getDb();
  const totalRow = db.prepare(`SELECT COUNT(*) as c FROM properties WHERE ${where.join(' AND ')}`).get(params);
  const total = totalRow.c;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const offset = (page - 1) * PER_PAGE;

  const isMap = view === 'map';
  const properties = isMap
    ? db.prepare(`SELECT * FROM properties WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT 200`).all(params)
    : db.prepare(`SELECT * FROM properties WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ${PER_PAGE} OFFSET ${offset}`).all(params);

  const countries = db.prepare(`SELECT DISTINCT country FROM properties WHERE country IS NOT NULL AND country != '' ORDER BY country`).all().map(r => r.country);

  function makeUrl(overrides = {}) {
    const merged = { ...sp, ...overrides };
    const out = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== '' && v != null) out.set(k, v);
    });
    return `/properties?${out.toString()}`;
  }

  return (
    <>
      <section className="bg-navy-950 text-white py-12">
        <div className="container-x">
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Browse Properties</h1>
          <p className="mt-2 text-navy-200">{total} {total === 1 ? 'listing' : 'listings'} across {countries.length} {countries.length === 1 ? 'country' : 'countries'}.</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          <PropertyFilters countries={countries} />
          <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <ViewToggle value={view} />
                {!isMap ? <div className="text-sm text-navy-600">Page {page} of {totalPages}</div> : null}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <SaveSearchButton />
                {!isMap ? <SortSelect value={sort} /> : null}
              </div>
            </div>

            {properties.length === 0 ? (
              <div className="bg-navy-50 rounded-lg p-12 text-center">
                <h3 className="font-display text-2xl text-navy-900">No properties match your filters.</h3>
                <p className="mt-2 text-navy-600">Try adjusting the filters or clearing your search.</p>
                <Link href="/properties" className="btn-primary mt-5">Reset filters</Link>
              </div>
            ) : isMap ? (
              <PropertiesMap properties={properties} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}

            {!isMap && totalPages > 1 ? (
              <nav className="mt-12 flex items-center justify-center gap-2">
                {page > 1 ? <Link href={makeUrl({ page: page - 1 })} className="px-4 py-2 rounded border border-navy-200 hover:bg-navy-50">Previous</Link> : null}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={makeUrl({ page: p })} className={`px-4 py-2 rounded border ${p === page ? 'bg-navy-900 text-white border-navy-900' : 'border-navy-200 hover:bg-navy-50'}`}>{p}</Link>
                ))}
                {page < totalPages ? <Link href={makeUrl({ page: page + 1 })} className="px-4 py-2 rounded border border-navy-200 hover:bg-navy-50">Next</Link> : null}
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
