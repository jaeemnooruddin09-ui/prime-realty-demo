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
  `);
  ensureColumn(db, 'properties', 'floor_plans', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, 'properties', 'virtual_tour_url', 'TEXT');
  ensureColumn(db, 'properties', 'country', "TEXT NOT NULL DEFAULT 'United States'");
  db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  seedAgents(db);
  seedLuxuryCatalog(db);
  seedSettings(db);
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
      email: 'sarah@primerealty.example',
      bio: 'With over 12 years of experience in luxury real estate, Sarah has helped hundreds of families find their dream homes. She specializes in waterfront properties and historic estates.',
    },
    {
      slug: 'james-okafor',
      name: 'James Okafor',
      title: 'Lead Agent, City Properties',
      photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600',
      phone: '+1 (555) 234-1011',
      email: 'james@primerealty.example',
      bio: 'James brings 9 years of urban property expertise. He has closed over 200 city apartment sales and is fluent in three languages.',
    },
    {
      slug: 'priya-shah',
      name: 'Priya Shah',
      title: 'Luxury Estate Specialist',
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      phone: '+1 (555) 234-1012',
      email: 'priya@primerealty.example',
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
      featured: 1, agent_id: 2,
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
      photos: [PHOTO(2102600), PHOTO(2102591), PHOTO(2102592), PHOTO(1648776), PHOTO(2451264)],
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
      featured: 1, agent_id: 2,
      description: 'A 48th-floor sky residence with full Marina Bay panoramas. Italian-designer kitchen, marble-clad spa baths, smart-home automation, and a private balcony. Tower amenities include a 50-meter sky pool, sky garden, residents lounge, and 24-hour concierge with valet.',
      photos: [PHOTO(271624), PHOTO(271643), PHOTO(271639), PHOTO(271620), PHOTO(271619)],
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
      photos: [PHOTO(1571453), PHOTO(271694), PHOTO(271667), PHOTO(271800), PHOTO(271816)],
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
      photos: [PHOTO(2451264), PHOTO(2462015), PHOTO(2462017), PHOTO(2098913), PHOTO(2089698)],
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
      featured: 1, agent_id: 2,
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

export { getDb };
