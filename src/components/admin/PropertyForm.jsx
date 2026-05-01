'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PROPERTY_TYPES } from '@/lib/site';

export default function PropertyForm({ agents = [], mode = 'create', property = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState(property?.photos || []);
  const [floorPlans, setFloorPlans] = useState(property?.floor_plans || []);
  const [uploading, setUploading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState('');
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const latRef = useRef(null);
  const lngRef = useRef(null);

  async function findOnMap() {
    const address = addressRef.current?.value?.trim();
    const city = cityRef.current?.value?.trim();
    if (!address && !city) {
      setGeocodeMsg('Enter the address first.');
      return;
    }
    setGeocoding(true);
    setGeocodeMsg('Looking up coordinates...');
    try {
      const q = [address, city].filter(Boolean).join(', ');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        setGeocodeMsg('Could not find that address. Try refining it.');
        return;
      }
      const { lat, lon, display_name } = data[0];
      if (latRef.current) latRef.current.value = parseFloat(lat).toFixed(6);
      if (lngRef.current) lngRef.current.value = parseFloat(lon).toFixed(6);
      setGeocodeMsg(`Located: ${display_name}`);
    } catch (err) {
      setGeocodeMsg('Lookup failed. You can paste lat/lng manually.');
    } finally {
      setGeocoding(false);
    }
  }

  async function uploadFiles(files, target = 'photos') {
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files', f));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      alert('Could not upload files.');
      return;
    }
    const j = await res.json();
    if (target === 'floor_plans') setFloorPlans(p => [...p, ...j.urls]);
    else setPhotos(p => [...p, ...j.urls]);
  }

  function addPhotoUrl() {
    const url = prompt('Paste an image URL (e.g. from Pexels):');
    if (url && /^https?:\/\//.test(url)) setPhotos(p => [...p, url]);
  }
  function addFloorPlanUrl() {
    const url = prompt('Paste a floor plan image URL:');
    if (url && /^https?:\/\//.test(url)) setFloorPlans(p => [...p, url]);
  }

  function removePhoto(i) {
    setPhotos(p => p.filter((_, idx) => idx !== i));
  }
  function removeFloorPlan(i) {
    setFloorPlans(p => p.filter((_, idx) => idx !== i));
  }

  function movePhoto(i, dir) {
    setPhotos(p => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    data.featured = data.featured === 'on' ? 1 : 0;
    data.bedrooms = parseInt(data.bedrooms) || 0;
    data.bathrooms = parseInt(data.bathrooms) || 0;
    data.size_sqft = parseInt(data.size_sqft) || 0;
    data.price = parseInt(data.price) || 0;
    data.lat = parseFloat(data.lat) || 0;
    data.lng = parseFloat(data.lng) || 0;
    data.agent_id = parseInt(data.agent_id) || agents[0]?.id;
    data.photos = photos;
    data.floor_plans = floorPlans;
    if (photos.length === 0) {
      setError('Please add at least one photo.');
      setLoading(false);
      return;
    }
    const url = mode === 'edit' ? `/api/properties/${property.id}` : '/api/properties';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/properties');
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Could not save.');
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-navy-100 rounded-lg p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Title</label>
          <input required name="title" defaultValue={property?.title} className="input" />
        </div>
        <div>
          <label className="label">Slug (URL)</label>
          <input required name="slug" defaultValue={property?.slug} className="input" placeholder="modern-beachfront-villa" />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea required name="description" defaultValue={property?.description} rows="5" className="input" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Listing type</label>
          <select name="listing_type" defaultValue={property?.listing_type || 'buy'} className="input">
            <option value="buy">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>
        <div>
          <label className="label">Property type</label>
          <select name="type" defaultValue={property?.type || 'house'} className="input">
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price (USD)</label>
          <input required name="price" defaultValue={property?.price} className="input" inputMode="numeric" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Bedrooms</label>
          <input required name="bedrooms" defaultValue={property?.bedrooms} className="input" type="number" min="0" />
        </div>
        <div>
          <label className="label">Bathrooms</label>
          <input required name="bathrooms" defaultValue={property?.bathrooms} className="input" type="number" min="0" />
        </div>
        <div>
          <label className="label">Size (sqft)</label>
          <input required name="size_sqft" defaultValue={property?.size_sqft} className="input" type="number" min="0" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Address</label>
          <input required name="address" ref={addressRef} defaultValue={property?.address} className="input" placeholder="123 Main St" />
        </div>
        <div>
          <label className="label">City</label>
          <input required name="city" ref={cityRef} defaultValue={property?.city} className="input" placeholder="New York, NY" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="label !mb-0">Map coordinates</label>
          <button type="button" onClick={findOnMap} disabled={geocoding} className="btn-outline !py-2 !px-4 !text-sm">
            {geocoding ? 'Locating...' : 'Find on map'}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-xs text-navy-500">Latitude</label>
            <input required name="lat" ref={latRef} defaultValue={property?.lat} className="input" placeholder="40.7128" />
          </div>
          <div>
            <label className="text-xs text-navy-500">Longitude</label>
            <input required name="lng" ref={lngRef} defaultValue={property?.lng} className="input" placeholder="-74.0060" />
          </div>
        </div>
        {geocodeMsg ? <div className="text-xs text-navy-600 mt-2">{geocodeMsg}</div> : <div className="text-xs text-navy-400 mt-2">Click "Find on map" to auto-fill from the address. Used for the listings map and the property page map pin.</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Agent</label>
          <select name="agent_id" defaultValue={property?.agent_id} className="input">
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={property?.status || 'available'} className="input">
            <option value="draft">Draft (hidden from public)</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="featured" name="featured" type="checkbox" defaultChecked={!!property?.featured} className="w-5 h-5" />
        <label htmlFor="featured" className="text-navy-700">Mark as featured (appears on home page)</label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label !mb-0">Photos ({photos.length})</label>
          <div className="flex gap-2">
            <label className="btn-outline !py-2 !px-4 !text-sm cursor-pointer">
              Upload files
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
            </label>
            <button type="button" onClick={addPhotoUrl} className="btn-outline !py-2 !px-4 !text-sm">+ Add URL</button>
          </div>
        </div>
        {uploading ? <div className="text-sm text-navy-500 mt-2">Uploading...</div> : null}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <div key={i} className="relative group">
              <img src={p} alt="" className="w-full aspect-square object-cover rounded" />
              <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 rounded transition">
                <button type="button" onClick={() => movePhoto(i, -1)} className="bg-white text-navy-900 w-8 h-8 rounded">&lsaquo;</button>
                <button type="button" onClick={() => movePhoto(i, 1)} className="bg-white text-navy-900 w-8 h-8 rounded">&rsaquo;</button>
                <button type="button" onClick={() => removePhoto(i)} className="bg-red-600 text-white w-8 h-8 rounded">&times;</button>
              </div>
              {i === 0 ? <span className="absolute top-2 left-2 bg-gold-400 text-navy-950 text-xs font-semibold px-2 py-0.5 rounded">Cover</span> : null}
            </div>
          ))}
        </div>
        {photos.length === 0 ? <div className="mt-3 text-sm text-navy-500">No photos yet. Upload one or paste an image URL.</div> : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label !mb-0">Floor plans ({floorPlans.length})</label>
          <div className="flex gap-2">
            <label className="btn-outline !py-2 !px-4 !text-sm cursor-pointer">
              Upload
              <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => uploadFiles(e.target.files, 'floor_plans')} />
            </label>
            <button type="button" onClick={addFloorPlanUrl} className="btn-outline !py-2 !px-4 !text-sm">+ Add URL</button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {floorPlans.map((p, i) => (
            <div key={i} className="relative group">
              <img src={p} alt="" className="w-full aspect-square object-cover rounded bg-navy-50" />
              <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition">
                <button type="button" onClick={() => removeFloorPlan(i)} className="bg-red-600 text-white w-8 h-8 rounded">&times;</button>
              </div>
            </div>
          ))}
        </div>
        {floorPlans.length === 0 ? <div className="mt-3 text-sm text-navy-500">Optional: floor plan images shown in a separate tab on the property page.</div> : null}
      </div>

      <div>
        <label className="label">Virtual tour URL (optional)</label>
        <input name="virtual_tour_url" defaultValue={property?.virtual_tour_url || ''} className="input" placeholder="https://my.matterport.com/show/?m=..." />
        <div className="text-xs text-navy-400 mt-1">Matterport, YouTube, Vimeo, Kuula, or any embed URL.</div>
      </div>

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : (mode === 'edit' ? 'Save changes' : 'Create property')}</button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
