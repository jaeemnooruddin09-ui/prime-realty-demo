import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, 'realestate.db');

let db;
function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    init(db);
  }
  return db;
}

function ensureColumn(db, table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.find(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function init(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      photo TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      bio TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      type TEXT NOT NULL,
      listing_type TEXT NOT NULL DEFAULT 'buy',
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      size_sqft INTEGER NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'available',
      photos TEXT NOT NULL,
      agent_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );

    CREATE INDEX IF NOT EXISTS idx_props_listing_type ON properties(listing_type);
    CREATE INDEX IF NOT EXISTS idx_props_type ON properties(type);
    CREATE INDEX IF NOT EXISTS idx_props_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_props_featured ON properties(featured);

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      body TEXT NOT NULL,
      cover TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Insights',
      reading_minutes INTEGER NOT NULL DEFAULT 5,
      published_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      status TEXT NOT NULL DEFAULT 'published'
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      quote TEXT NOT NULL,
      photo TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS customer_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      message TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS open_houses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      starts_at INTEGER NOT NULL,
      ends_at INTEGER NOT NULL,
      host_agent_id INTEGER,
      capacity INTEGER NOT NULL DEFAULT 20,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (host_agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL DEFAULT 'newsletter',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id INTEGER UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_agent_id INTEGER,
      notes TEXT,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (enquiry_id) REFERENCES enquiries(id),
      FOREIGN KEY (assigned_agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id INTEGER,
      details TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
    CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at);
    CREATE INDEX IF NOT EXISTS idx_open_houses_starts ON open_houses(starts_at);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
  `);
  ensureColumn(db, 'properties', 'floor_plans', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, 'properties', 'virtual_tour_url', 'TEXT');
  ensureColumn(db, 'properties', 'country', "TEXT NOT NULL DEFAULT 'United States'");
  ensureColumn(db, 'properties', 'price_history', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, 'customer_comments', 'approved', 'INTEGER NOT NULL DEFAULT 0');
  db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  seedAgents(db);
  seedLuxuryCatalog(db);
  seedBlog(db);
  seedTestimonials(db);
  seedOpenHouses(db);
  seedSettings(db);
  rebrandPrimeRealtyToPrimeForgeHomes(db);
  fixBadListingPhotos(db);
  rebrandToDemoUrl(db);
  assignListingsToPriya(db);
}

function rebrandToDemoUrl(db) {
  const flag = db.prepare('SELECT value FROM settings WHERE key = ?').get('migrated_demo_url_v1');
  if (flag) return;
  db.exec(`
    UPDATE agents SET email = REPLACE(email, '@primeforgehomes.example', '@primeforge-homes.demo')
      WHERE email LIKE '%@primeforgehomes.example';
    UPDATE settings SET value = REPLACE(value, 'primeforgehomes.example', 'primeforge-homes.demo')
      WHERE value LIKE '%primeforgehomes.example%';
    INSERT OR REPLACE INTO settings (key, value) VALUES ('migrated_demo_url_v1', '1');
  `);
}

function assignListingsToPriya(db) {
  const flag = db.prepare('SELECT value FROM settings WHERE key = ?').get('migrated_priya_listings_v1');
  if (flag) return;
  const priya = db.prepare("SELECT id FROM agents WHERE slug = 'priya-shah'").get();
  if (priya) {
    const upd = db.prepare('UPDATE properties SET agent_id = ? WHERE slug = ?');
    upd.run(priya.id, 'marina-bay-condo');
    upd.run(priya.id, 'manhattan-sky-penthouse');
    upd.run(priya.id, 'tribeca-designer-loft');
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('migrated_priya_listings_v1', '1');
}

function fixBadListingPhotos(db) {
  const flag = db.prepare('SELECT value FROM settings WHERE key = ?').get('migrated_photos_v1');
  if (flag) return;
  const url = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
  const replacements = {
    'palm-jumeirah-mansion': [1396132, 261101, 2287310, 1396122, 280229],
    'tuscan-vineyard-villa': [280229, 1396122, 1396132, 105776, 2287310],
    'marina-bay-condo':      [1571447, 2079438, 210617, 3214064, 2079431],
    'brickell-bay-condo':    [2724748, 2724749, 12932050, 1862402, 2079433],
  };
  const upd = db.prepare('UPDATE properties SET photos = ? WHERE slug = ?');
  for (const [slug, ids] of Object.entries(replacements)) {
    upd.run(JSON.stringify(ids.map(url)), slug);
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('migrated_photos_v1', '1');
}

function rebrandPrimeRealtyToPrimeForgeHomes(db) {
  const flag = db.prepare('SELECT value FROM settings WHERE key = ?').get('migrated_primeforge_v1');
  if (flag) return;
  db.exec(`
    UPDATE agents SET email = REPLACE(email, '@primerealty.example', '@primeforge-homes.demo')
      WHERE email LIKE '%@primerealty.example';
    UPDATE testimonials SET quote = REPLACE(quote, 'Prime Realty', 'PrimeForge Homes')
      WHERE quote LIKE '%Prime Realty%';
    UPDATE settings SET value = REPLACE(value, 'primerealty.example', 'primeforge-homes.demo')
      WHERE value LIKE '%primerealty.example%';
    UPDATE settings SET value = REPLACE(value, 'Prime Realty', 'PrimeForge Homes')
      WHERE value LIKE '%Prime Realty%';
    INSERT OR REPLACE INTO settings (key, value) VALUES ('migrated_primeforge_v1', '1');
  `);
}

function seedSettings(db) {
  const defaults = { mortgage_rate: '6.5' };
  const get = db.prepare('SELECT value FROM settings WHERE key = ?');
  const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  Object.entries(defaults).forEach(([k, v]) => {
    if (!get.get(k)) insert.run(k, v);
  });
}

export function getSetting(key, fallback = '') {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

function seedAgents(db) {
  const c = db.prepare('SELECT COUNT(*) as c FROM agents').get().c;
  if (c > 0) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO agents (slug, name, title, photo, phone, email, bio)
    VALUES (@slug, @name, @title, @photo, @phone, @email, @bio)
  `);
  const agents = [
    {
      slug: 'sarah-mitchell',
      name: 'Sarah Mitchell',
      title: 'Senior Property Consultant',
      photo: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=600',
      phone: '+1 (555) 234-1010',
      email: 'sarah@primeforge-homes.demo',
      bio: 'With over 12 years of experience in luxury real estate, Sarah has helped hundreds of families find their dream homes. She specializes in waterfront properties and historic estates.',
    },
    {
      slug: 'james-okafor',
      name: 'James Okafor',
      title: 'Lead Agent, City Properties',
      photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600',
      phone: '+1 (555) 234-1011',
      email: 'james@primeforge-homes.demo',
      bio: 'James brings 9 years of urban property expertise. He has closed over 200 city apartment sales and is fluent in three languages.',
    },
    {
      slug: 'priya-shah',
      name: 'Priya Shah',
      title: 'Luxury Estate Specialist',
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      phone: '+1 (555) 234-1012',
      email: 'priya@primeforge-homes.demo',
      bio: 'Priya represents private estates, penthouses, and premium rentals. She is known for her tireless advocacy and attention to detail.',
    },
  ];
  agents.forEach(a => insert.run(a));
}

const PHOTO = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;

function seedLuxuryCatalog(db) {
  const existing = db.prepare('SELECT COUNT(*) as c FROM properties').get().c;
  if (existing > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO properties (slug, title, description, price, type, listing_type, bedrooms, bathrooms, size_sqft, address, city, country, lat, lng, featured, status, photos, agent_id, floor_plans, virtual_tour_url)
    VALUES (@slug, @title, @description, @price, @type, @listing_type, @bedrooms, @bathrooms, @size_sqft, @address, @city, @country, @lat, @lng, @featured, @status, @photos, @agent_id, @floor_plans, @virtual_tour_url)
  `);

  const luxury = [
    // ===== HOUSES (2) =====
    {
      slug: 'bel-air-modern-estate',
      title: 'Bel Air Modern Estate',
      type: 'house',
      city: 'Los Angeles', country: 'United States',
      address: '11620 Stradella Ct, Bel Air, CA',
      price: 14500000,
      bedrooms: 7, bathrooms: 9, size_sqft: 9200,
      lat: 34.0939, lng: -118.4517,
      featured: 1, agent_id: 1,
      description: 'A grand contemporary estate above Bel Air with panoramic city-to-ocean views. Twin pools, indoor wellness wing, oversized chef kitchen with adjacent catering kitchen, six-car gallery garage, and a temperature-controlled wine cave. Walls of glass disappear into manicured grounds with citrus orchards and a championship putting green.',
      photos: [PHOTO(323776), PHOTO(2462015), PHOTO(2098913), PHOTO(2451264), PHOTO(280229)],
    },
    {
      slug: 'cotswolds-country-house',
      title: 'Cotswolds Country House',
      type: 'house',
      city: 'Cotswolds', country: 'United Kingdom',
      address: 'Stow Lane, Lower Slaughter, Gloucestershire, GL54',
      price: 9450000,
      bedrooms: 8, bathrooms: 7, size_sqft: 8400,
      lat: 51.9118, lng: -1.7693,
      featured: 1, agent_id: 1,
      description: 'A Grade II listed Cotswold-stone manor on twelve acres of mature parkland. Original mullioned windows, six fireplaces, a renovated chef kitchen opening to a walled rose garden, indoor pool wing, and a converted barn guest cottage. Within an hour of central London by car.',
      photos: [PHOTO(2089696), PHOTO(2089698), PHOTO(2079246), PHOTO(2284166), PHOTO(2227776)],
    },

    // ===== APARTMENTS (2) =====
    {
      slug: 'mayfair-apartment',
      title: 'Mayfair Park Lane Residence',
      type: 'apartment',
      city: 'London', country: 'United Kingdom',
      address: '20 Park Lane, Mayfair, London W1K',
      price: 7250000,
      bedrooms: 3, bathrooms: 3, size_sqft: 2950,
      lat: 51.5079, lng: -0.1530,
      featured: 1, agent_id: 2,
      description: 'A premier Mayfair apartment overlooking Hyde Park with floor-to-ceiling windows, herringbone oak floors, gas fireplace, custom Boffi kitchen, and dedicated staff quarters. Building includes 24-hour concierge, residents-only spa, valet, and secure underground parking.',
      photos: [PHOTO(1571463), PHOTO(1457842), PHOTO(279607), PHOTO(2079249), PHOTO(2079248)],
    },
    {
      slug: 'tribeca-designer-loft',
      title: 'Tribeca Designer Loft',
      type: 'apartment',
      city: 'New York', country: 'United States',
      address: '14 White St, Tribeca, NY',
      price: 4850000,
      bedrooms: 3, bathrooms: 3, size_sqft: 3100,
      lat: 40.7180, lng: -74.0046,
      featured: 1, agent_id: 3,
      description: 'A converted-industrial Tribeca loft reimagined by a noted Manhattan studio. 12-foot ceilings, original cast-iron columns, herringbone oak floors, custom Boffi kitchen, hand-plastered baths, and a rare 600-square-foot landscaped terrace. Concierge building, key-locked elevator entry, full-service garage.',
      photos: [PHOTO(1029599), PHOTO(2102587), PHOTO(2079431), PHOTO(2079438), PHOTO(2079433)],
    },

    // ===== VILLAS (2) =====
    {
      slug: 'tuscan-vineyard-villa',
      title: 'Tuscan Vineyard Villa',
      type: 'villa',
      city: 'Tuscany', country: 'Italy',
      address: 'Strada di Vagliagli, 53019 Castelnuovo Berardenga, Siena',
      price: 7950000,
      bedrooms: 6, bathrooms: 7, size_sqft: 7400,
      lat: 43.4156, lng: 11.4239,
      featured: 1, agent_id: 1,
      description: 'A storybook villa on twelve hectares of mature Sangiovese vineyards in the Chianti hills. Hand-laid Tuscan stone, antique reclaimed beams, terracotta roofs, and a seventy-foot infinity pool overlooking the valley. Working winery and barrel cellar, private chapel, outdoor pizza oven, and bocce court.',
      photos: [PHOTO(280229), PHOTO(1396122), PHOTO(1396132), PHOTO(105776), PHOTO(2287310)],
    },
    {
      slug: 'marbella-cliffside-villa',
      title: 'Marbella Cliffside Villa',
      type: 'villa',
      city: 'Marbella', country: 'Spain',
      address: 'Carretera de Cadiz, La Zagaleta, Marbella, 29679',
      price: 11250000,
      bedrooms: 7, bathrooms: 8, size_sqft: 8600,
      lat: 36.5097, lng: -5.0234,
      featured: 1, agent_id: 1,
      description: 'A breathtaking Mediterranean estate within La Zagaleta, perched above the Costa del Sol. Tile-roofed loggias, hand-carved limestone fireplaces, sea-view great room with disappearing walls, spa wing, and a zero-edge pool that meets the horizon. Two staff residences and a private security gate.',
      photos: [PHOTO(1396132), PHOTO(1396122), PHOTO(261101), PHOTO(2287310), PHOTO(280229)],
    },

    // ===== CONDOS (2) =====
    {
      slug: 'marina-bay-condo',
      title: 'Marina Bay Sky Residence',
      type: 'condo',
      city: 'Singapore', country: 'Singapore',
      address: '8 Marina Boulevard, Marina Bay, Singapore 018981',
      price: 4250000,
      bedrooms: 3, bathrooms: 3, size_sqft: 2150,
      lat: 1.2843, lng: 103.8585,
      featured: 1, agent_id: 3,
      description: 'A 48th-floor sky residence with full Marina Bay panoramas. Italian-designer kitchen, marble-clad spa baths, smart-home automation, and a private balcony. Tower amenities include a 50-meter sky pool, sky garden, residents lounge, and 24-hour concierge with valet.',
      photos: [PHOTO(1571447), PHOTO(2079438), PHOTO(210617), PHOTO(3214064), PHOTO(2079431)],
    },
    {
      slug: 'brickell-bay-condo',
      title: 'Brickell Bay Tower Residence',
      type: 'condo',
      city: 'Miami', country: 'United States',
      address: '1100 Brickell Bay Dr, Miami, FL',
      price: 2250000,
      bedrooms: 3, bathrooms: 3, size_sqft: 2050,
      lat: 25.7616, lng: -80.1881,
      featured: 0, agent_id: 2,
      description: 'A 42nd-floor sky residence with floor-to-ceiling windows on three exposures: ocean, bay, and skyline. Italian designer kitchen, smart-home automation, spa-grade primary bath, two-car garage. Building amenities include rooftop pool deck, fitness lounge, residents-only sky bar, and 24-hour concierge.',
      photos: [PHOTO(2724748), PHOTO(2724749), PHOTO(12932050), PHOTO(1862402), PHOTO(2079433)],
    },

    // ===== MANSIONS (2) =====
    {
      slug: 'palm-jumeirah-mansion',
      title: 'Palm Jumeirah Signature Mansion',
      type: 'mansion',
      city: 'Dubai', country: 'United Arab Emirates',
      address: 'Frond G, Palm Jumeirah, Dubai',
      price: 28500000,
      bedrooms: 8, bathrooms: 11, size_sqft: 13800,
      lat: 25.1124, lng: 55.1389,
      featured: 1, agent_id: 1,
      description: 'A signature beachfront villa on the iconic Palm Jumeirah with private 30-meter beach. Floor-to-ceiling glass walls, double-height marble entry, indoor cinema, gym with sea-view spa, and a 25-meter pool with swim-up bar. Sixteen-car gated motor court and private dock.',
      photos: [PHOTO(1396132), PHOTO(261101), PHOTO(2287310), PHOTO(1396122), PHOTO(280229)],
    },
    {
      slug: 'hilltop-glass-mansion',
      title: 'Bel Air Hilltop Glass Mansion',
      type: 'mansion',
      city: 'Los Angeles', country: 'United States',
      address: '1408 Mulholland Dr, Bel Air, CA',
      price: 23500000,
      bedrooms: 8, bathrooms: 11, size_sqft: 14200,
      lat: 34.1314, lng: -118.4031,
      featured: 1, agent_id: 1,
      description: 'A statement architectural mansion set on a private gated bluff. Walls of glass dissolve into a 110-foot infinity pool above the canyon. A private elevator connects four levels, including a 3,000-bottle wine vault, screening room, gym with a 30-foot moving glass wall, and a six-car gallery garage.',
      photos: [PHOTO(2089696), PHOTO(2284166), PHOTO(2227776), PHOTO(2079246), PHOTO(105776)],
    },

    // ===== TOWNHOUSES (2) =====
    {
      slug: 'kensington-townhouse',
      title: 'Kensington Garden Townhouse',
      type: 'townhouse',
      city: 'London', country: 'United Kingdom',
      address: '14 Kensington Park Gardens, London W11',
      price: 12750000,
      bedrooms: 6, bathrooms: 6, size_sqft: 6200,
      lat: 51.5118, lng: -0.2025,
      featured: 1, agent_id: 2,
      description: 'A landmark stucco-fronted Notting Hill townhouse with private direct access to Kensington Park Gardens. Six floors, formal entertaining suite, library, double-height kitchen-conservatory, principal floor with morning room, and self-contained mews coach house with parking for two.',
      photos: [PHOTO(105776), PHOTO(164558), PHOTO(1571470), PHOTO(1571460), PHOTO(2079248)],
    },
    {
      slug: 'paris-saint-germain-townhouse',
      title: 'Saint-Germain Hotel Particulier',
      type: 'townhouse',
      city: 'Paris', country: 'France',
      address: '7 Rue de Lille, 75007 Paris',
      price: 14500000,
      bedrooms: 6, bathrooms: 6, size_sqft: 5800,
      lat: 48.8593, lng: 2.3294,
      featured: 0, agent_id: 2,
      description: 'A discreet hotel particulier on the Left Bank, hidden behind classic Haussmannian doors. Restored boiserie, marble fireplaces, parquet de Versailles, a private inner courtyard, secret cellar, and a paneled library overlooking a manicured garden. Steps from the Seine.',
      photos: [PHOTO(1438832), PHOTO(1668860), PHOTO(1862402), PHOTO(2079433), PHOTO(280229)],
    },

    // ===== PENTHOUSES (2) =====
    {
      slug: 'manhattan-sky-penthouse',
      title: 'Manhattan Sky Penthouse',
      type: 'penthouse',
      city: 'New York', country: 'United States',
      address: '432 Park Ave, Manhattan, NY',
      price: 32500000,
      bedrooms: 5, bathrooms: 6, size_sqft: 6500,
      lat: 40.7614, lng: -73.9716,
      featured: 1, agent_id: 3,
      description: 'A trophy 78th-floor penthouse with 360-degree Manhattan views from Central Park to the East River. Private elevator entry, double-height living gallery, custom Italian millwork, gas fireplace, climate-controlled wine display, and a 1,400-square-foot wraparound terrace. White-glove concierge, indoor pool, spa, and squash courts.',
      photos: [PHOTO(1571447), PHOTO(2079438), PHOTO(210617), PHOTO(2079431), PHOTO(3214064)],
    },
    {
      slug: 'sydney-harbour-penthouse',
      title: 'Sydney Harbour Penthouse',
      type: 'penthouse',
      city: 'Sydney', country: 'Australia',
      address: '63 Kirribilli Avenue, Kirribilli, NSW 2061',
      price: 21500000,
      bedrooms: 4, bathrooms: 5, size_sqft: 5400,
      lat: -33.8463, lng: 151.2118,
      featured: 1, agent_id: 2,
      description: 'A whole-floor penthouse with arguably the most iconic outlook on earth: the Sydney Opera House and Harbour Bridge from every room. Folding glass walls, chef\'s catering kitchen, double primary suite with spa baths, media room, and a 70-foot wraparound terrace with private plunge pool.',
      photos: [PHOTO(3214064), PHOTO(2724748), PHOTO(2724749), PHOTO(1862402), PHOTO(12932050)],
    },
  ];

  luxury.forEach(p => {
    insert.run({
      slug: p.slug,
      title: p.title,
      description: p.description,
      price: p.price,
      type: p.type,
      listing_type: 'buy',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      size_sqft: p.size_sqft,
      address: p.address,
      city: p.city,
      country: p.country || 'United States',
      lat: p.lat,
      lng: p.lng,
      featured: p.featured,
      status: 'available',
      photos: JSON.stringify(p.photos),
      agent_id: p.agent_id,
      floor_plans: '[]',
      virtual_tour_url: null,
    });
  });
}

function seedBlog(db) {
  const c = db.prepare('SELECT COUNT(*) as c FROM blog_posts').get().c;
  if (c > 0) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (slug, title, excerpt, body, cover, author, category, reading_minutes, published_at, status)
    VALUES (@slug, @title, @excerpt, @body, @cover, @author, @category, @reading_minutes, @published_at, 'published')
  `);
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const posts = [
    {
      slug: 'luxury-market-report-q1-2026',
      title: 'Luxury Market Report: Q1 2026 trends across our seven markets',
      excerpt: 'Trophy property prices held firm in London and New York while Marbella and Tuscany saw double-digit growth. Here is what our data shows.',
      cover: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600',
      author: 'Sarah Mitchell',
      category: 'Market Reports',
      reading_minutes: 7,
      published_at: now - 7 * day,
      body: `<p>The first quarter of 2026 has continued the resilience we observed in late 2025. Across our seven primary markets, transaction volume rose 8 percent year on year, while average price per square foot at the upper end advanced 4 to 12 percent depending on the city.</p>
<h2>London: stable, narrow inventory</h2>
<p>Mayfair and Belgravia remained the strongest sub-markets, with Park Lane apartments commanding pricing premiums of 18 percent versus comparable units two streets back. Inventory remains tight, with average days on market falling to 71 from 92 a year ago.</p>
<h2>New York: trophy returns</h2>
<p>Above $20 million, Manhattan saw 23 closings in Q1, the strongest opening quarter since 2022. Park Avenue and Central Park West retained their dominance.</p>
<h2>Marbella and the Costa del Sol</h2>
<p>The clear standout: La Zagaleta and Sierra Blanca pricing rose 14 percent, driven by international buyers from Northern Europe and the Gulf seeking second residences with golf and concierge security.</p>
<h2>Looking ahead</h2>
<p>We expect interest rate stabilisation to support a stronger second half. Buyers who held off through 2024 to 2025 are returning, particularly to the family-house segment.</p>`,
    },
    {
      slug: 'first-time-luxury-buyer-guide',
      title: 'A first-time buyer guide to the luxury market',
      excerpt: 'Buying a first $5M home is different from buying a $500K starter. Here is what changes, from inspections to negotiation strategy.',
      cover: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1600',
      author: 'James Okafor',
      category: 'Guides',
      reading_minutes: 9,
      published_at: now - 14 * day,
      body: `<p>The luxury segment behaves differently from the broader market in three important ways: pricing transparency, the role of off-market inventory, and the structure of negotiation.</p>
<h2>Listing prices are not what you think</h2>
<p>In the trophy segment, the published price is often a reference point rather than a target. We have closed homes at 18 percent below ask and seen others bid 12 percent over.</p>
<h2>The off-market market</h2>
<p>Roughly 30 percent of our annual transaction volume happens before a property is publicly listed. If you are searching seriously, your agent relationship matters more than any property portal.</p>
<h2>Inspections become forensic</h2>
<p>For a $10M property, a basic visual inspection is insufficient. Plan on a thermal imaging survey, a structural engineer, an HVAC specialist, and on coastal homes, a saltwater corrosion review.</p>
<h2>Negotiation is relational</h2>
<p>At this level, sellers care who buys their home. We routinely include a personal letter from the buyer with our offer.</p>`,
    },
    {
      slug: 'why-marbella-is-hot-2026',
      title: 'Why Marbella is the strongest second-home market of 2026',
      excerpt: 'Five forces are pushing capital into the Costa del Sol. We look at the data, the demographics, and what it means for buyers.',
      cover: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600',
      author: 'Sarah Mitchell',
      category: 'Markets',
      reading_minutes: 6,
      published_at: now - 21 * day,
      body: `<p>Marbella has been quietly redefining itself. Once known for sunny villas and golf, the Costa del Sol has reorganised around three pillars: ultra-prime gated communities, year-round international schools, and an explicitly tax-friendly residence regime.</p>
<h2>The Beckham Law effect</h2>
<p>Spain's special expat tax regime, sometimes called the Beckham Law, caps income tax at a flat 24 percent for new residents for six years. This has attracted finance and tech families from London and Frankfurt.</p>
<h2>La Zagaleta and the gated premium</h2>
<p>La Zagaleta now trades at a meaningful premium to Sierra Blanca. The Hill District and the new Real de la Quinta development continue this trend, with private security and concierge being the deciding factor for many buyers.</p>
<h2>What we are seeing</h2>
<p>Most active buyer profiles in 2026: London families seeking a year-round base, Northern European retirees, and Gulf-region investors building second-residence portfolios.</p>`,
    },
    {
      slug: 'staging-for-the-luxury-market',
      title: 'Staging at the top end: what actually moves a $10M property',
      excerpt: 'Forget bowls of lemons. Real luxury staging is about lifestyle proof, scent design, and sequencing. We share our playbook.',
      cover: 'https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=1600',
      author: 'Priya Shah',
      category: 'Insider',
      reading_minutes: 5,
      published_at: now - 30 * day,
      body: `<p>Generic staging is fine for a $700K home. At $10M, the standard does not move the needle. Here is what we have learned.</p>
<h2>Lifestyle proof</h2>
<p>We bring the lifestyle into focus. The wine cellar should have wine. The cigar room should smell of cedar. The catering kitchen needs to look like it has prepared three dinners this week.</p>
<h2>Scent design</h2>
<p>Every property should have a single, unobtrusive scent signature. We work with fragrance designers to specify a custom blend per home. It costs little and is remembered.</p>
<h2>Sequencing</h2>
<p>The order in which a buyer experiences spaces matters as much as the spaces themselves. We script viewings to peak at the property's strongest moment, not start with it.</p>
<h2>One thing to avoid</h2>
<p>Empty rooms. Even one empty room communicates abandonment. We furnish every space, even if minimally.</p>`,
    },
    {
      slug: 'tax-tips-international-buyers',
      title: 'A simple checklist for international buyers',
      excerpt: 'Buying across borders adds tax, residency, and currency complexity. Use this checklist before you sign anything.',
      cover: 'https://images.pexels.com/photos/2089696/pexels-photo-2089696.jpeg?auto=compress&cs=tinysrgb&w=1600',
      author: 'James Okafor',
      category: 'Guides',
      reading_minutes: 4,
      published_at: now - 45 * day,
      body: `<h2>1. Tax residency</h2>
<p>Where you spend more than 183 days a year matters. Several countries trigger a tax residency test more aggressively, particularly Spain, Italy, France, and the United Kingdom.</p>
<h2>2. Stamp duty and equivalents</h2>
<p>UK Stamp Duty Land Tax, French notaire fees, and Italian imposta di registro all behave differently. Budget 4 to 12 percent on top of purchase price.</p>
<h2>3. Currency</h2>
<p>Lock in a forward contract for large purchases if a 5 percent FX swing materially changes the deal. Most international buyers we work with do.</p>
<h2>4. Banking and proof of funds</h2>
<p>Have your proof of funds letter dated within the last 30 days. Sellers and lawyers will ask for it.</p>
<h2>5. Power of attorney</h2>
<p>Notarised, apostilled, in the destination language. Always.</p>`,
    },
  ];
  posts.forEach(p => insert.run(p));
}

function seedTestimonials(db) {
  const c = db.prepare('SELECT COUNT(*) as c FROM testimonials').get().c;
  if (c > 0) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO testimonials (name, title, quote, photo, rating, featured)
    VALUES (@name, @title, @quote, @photo, @rating, @featured)
  `);
  const items = [
    {
      name: 'David and Helena Karlsson',
      title: 'Bought in Marbella',
      quote: 'After three months and four agents in two countries, Sarah found us our home in two viewings. We finally felt understood and not just sold to.',
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      featured: 1,
    },
    {
      name: 'Andrew Tomlinson',
      title: 'Sold a London townhouse',
      quote: 'James handled a complex sale with an off-market introduction that exceeded every expectation. Best in class. We would not work with anyone else.',
      photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      featured: 1,
    },
    {
      name: 'The Yamamoto family',
      title: 'Purchased in New York',
      quote: 'Priya understood that this was as much about a school district and lifestyle as it was about the apartment. She made the move from Tokyo seamless.',
      photo: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      featured: 1,
    },
    {
      name: 'Rashid Al-Mansouri',
      title: 'Investor portfolio, multi-market',
      quote: 'PrimeForge Homes introduced four off-market opportunities I would never have found. Two were the strongest acquisitions in my 2025 portfolio.',
      photo: 'https://images.pexels.com/photos/2496893/pexels-photo-2496893.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      featured: 0,
    },
    {
      name: 'Sophia Bertelli',
      title: 'Bought in Tuscany',
      quote: 'Sarah had a sense of taste that matched ours, which is rare. She showed us four properties, all of which we could have lived in. We chose the most beautiful one.',
      photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      featured: 0,
    },
  ];
  items.forEach(t => insert.run(t));
}

function seedOpenHouses(db) {
  const c = db.prepare('SELECT COUNT(*) as c FROM open_houses').get().c;
  if (c > 0) return;
  const props = db.prepare('SELECT id, agent_id FROM properties WHERE status = ? ORDER BY featured DESC, id ASC LIMIT 6').all('available');
  if (props.length === 0) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO open_houses (property_id, starts_at, ends_at, host_agent_id, capacity, notes)
    VALUES (@property_id, @starts_at, @ends_at, @host_agent_id, @capacity, @notes)
  `);
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const slots = [
    { offsetDays: 3, startHour: 14, durationHours: 3, notes: 'Refreshments will be served. Strict by-appointment for security.' },
    { offsetDays: 5, startHour: 11, durationHours: 4, notes: 'Open viewing. Booking recommended.' },
    { offsetDays: 7, startHour: 16, durationHours: 2, notes: 'Twilight viewing. Wine and canapés.' },
    { offsetDays: 10, startHour: 12, durationHours: 4, notes: 'By private appointment only.' },
    { offsetDays: 14, startHour: 13, durationHours: 4, notes: 'Open house with agent walkthrough every 30 minutes.' },
    { offsetDays: 17, startHour: 15, durationHours: 3, notes: 'Sunset viewing. Champagne reception.' },
  ];
  props.forEach((p, i) => {
    const s = slots[i % slots.length];
    const dayStart = now + s.offsetDays * day;
    const startsAt = dayStart - (dayStart % day) + s.startHour * 3600;
    const endsAt = startsAt + s.durationHours * 3600;
    insert.run({
      property_id: p.id,
      starts_at: startsAt,
      ends_at: endsAt,
      host_agent_id: p.agent_id,
      capacity: 20,
      notes: s.notes,
    });
  });
}

export { getDb };
