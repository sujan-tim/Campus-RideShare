export const CAMPUSES = [
  {
    id: 'busch',
    name: 'Busch Campus',
    address: 'Busch Campus, Piscataway, NJ 08854',
    lat: 40.5235, lng: -74.4626,
    icon: '🔬', color: '#CC0033',
    desc: 'Science & Engineering',
    landmarks: ['SERC', 'Werblin Rec', 'Busch Student Center'],
  },
  {
    id: 'college_ave',
    name: 'College Avenue Campus',
    address: 'College Avenue, New Brunswick, NJ 08901',
    lat: 40.5008, lng: -74.4474,
    icon: '🏛️', color: '#CC0033',
    desc: 'Historic Main Campus',
    landmarks: ['Old Queens', 'Voorhees Mall', 'Student Center'],
  },
  {
    id: 'douglass',
    name: 'Douglass Campus',
    address: 'Douglass Campus, New Brunswick, NJ 08901',
    lat: 40.4887, lng: -74.4496,
    icon: '🌿', color: '#CC0033',
    desc: 'Liberal Arts & Residential',
    landmarks: ['Douglass Library', 'Jameson Hall', 'Dining Hall'],
  },
  {
    id: 'cook',
    name: 'George H. Cook Campus',
    address: 'Cook Campus, New Brunswick, NJ 08901',
    lat: 40.4824, lng: -74.4378,
    icon: '🌾', color: '#CC0033',
    desc: 'Agricultural & Environmental',
    landmarks: ['Cook Student Center', 'Blake Hall', 'Passion Puddle'],
  },
  {
    id: 'livingston',
    name: 'Livingston Campus',
    address: 'Livingston Campus, Piscataway, NJ 08854',
    lat: 40.5219, lng: -74.4380,
    icon: '🏙️', color: '#CC0033',
    desc: 'Business & Social Sciences',
    landmarks: ['Livingston Student Center', 'RBS Building', 'Quads'],
  },
];

// Mock drivers with real positions near Rutgers
export const MOCK_DRIVERS = [
  {
    id: 'd1', name: 'Marcus Thompson', initials: 'MT',
    rating: 4.9, trips: 203, car: 'Honda Civic 2021', plate: 'RU-2024',
    lat: 40.5050, lng: -74.4510, eta: '4 min', seats: 3, verified: true,
    phone: '+17325550101',
  },
  {
    id: 'd2', name: 'Priya Sharma', initials: 'PS',
    rating: 4.8, trips: 156, car: 'Toyota Corolla 2022', plate: 'NJ-4821',
    lat: 40.4970, lng: -74.4430, eta: '7 min', seats: 2, verified: true,
    phone: '+17325550102',
  },
  {
    id: 'd3', name: 'James Wilson', initials: 'JW',
    rating: 5.0, trips: 89, car: 'Honda Accord 2020', plate: 'RUT-789',
    lat: 40.5180, lng: -74.4360, eta: '11 min', seats: 1, verified: true,
    phone: '+17325550103',
  },
  {
    id: 'd4', name: 'Sofia Garcia', initials: 'SG',
    rating: 4.7, trips: 244, car: 'Nissan Altima 2021', plate: 'NJ-9932',
    lat: 40.4850, lng: -74.4480, eta: '9 min', seats: 2, verified: true,
    phone: '+17325550104',
  },
  {
    id: 'd5', name: 'David Chen', initials: 'DC',
    rating: 4.9, trips: 178, car: 'Toyota Camry 2022', plate: 'RU-7721',
    lat: 40.5100, lng: -74.4550, eta: '5 min', seats: 3, verified: true,
    phone: '+17325550105',
  },
];

export const SCHOOLS = [
  'School of Arts and Sciences (SAS)',
  'Rutgers Business School (RBS)',
  'School of Engineering (SOE)',
  'School of Education',
  'Mason Gross School of the Arts',
  'Ernest Mario School of Pharmacy',
  'Edward J. Bloustein School',
  'School of Environmental and Biological Sciences (SEBS)',
  'School of Communication and Information',
  'School of Social Work',
  'New Jersey Medical School',
  'Robert Wood Johnson Medical School',
  'School of Management and Labor Relations',
];

export const RESTAURANTS = [
  { id: 1, name: 'Fat Sandwich Company', cuisine: 'American', rating: 4.8, time: '15–25 min', price: '$', emoji: '🥪', campus: 'college_ave', popular: true },
  { id: 2, name: "Stuff Yer Face", cuisine: 'Stromboli & Italian', rating: 4.7, time: '20–30 min', price: '$$', emoji: '🍕', campus: 'college_ave', popular: true },
  { id: 3, name: "Hansel 'n Griddle", cuisine: 'Breakfast & Brunch', rating: 4.5, time: '10–20 min', price: '$', emoji: '🥞', campus: 'college_ave', popular: false },
  { id: 4, name: 'YuFu Asian Cuisine', cuisine: 'Asian Fusion', rating: 4.6, time: '20–35 min', price: '$$', emoji: '🍜', campus: 'busch', popular: true },
  { id: 5, name: 'Destination Dogs', cuisine: 'Gourmet Hot Dogs', rating: 4.4, time: '15–25 min', price: '$', emoji: '🌭', campus: 'livingston', popular: false },
  { id: 6, name: 'Harvest Moon Brewery', cuisine: 'Pub Food', rating: 4.5, time: '25–40 min', price: '$$', emoji: '🍺', campus: 'college_ave', popular: false },
  { id: 7, name: 'Red Mango', cuisine: 'Frozen Yogurt', rating: 4.6, time: '10–15 min', price: '$', emoji: '🍦', campus: 'college_ave', popular: true },
  { id: 8, name: "Ronny's Place", cuisine: 'Classic Diner', rating: 4.3, time: '20–30 min', price: '$', emoji: '🥘', campus: 'cook', popular: false },
];

export const MENU_ITEMS = [
  { id: 'm1', name: 'Signature Burger', desc: 'House sauce, caramelized onions, aged cheddar', price: 9.99, emoji: '🍔', popular: true },
  { id: 'm2', name: 'Loaded Fries', desc: 'Truffle oil, parmesan, fresh herbs', price: 5.99, emoji: '🍟', popular: false },
  { id: 'm3', name: 'Buffalo Wings', desc: '8 pieces, blue cheese dip, celery', price: 11.99, emoji: '🍗', popular: true },
  { id: 'm4', name: 'Caesar Salad', desc: 'Romaine, house dressing, croutons', price: 8.99, emoji: '🥗', popular: false },
  { id: 'm5', name: 'Chocolate Shake', desc: 'Thick-cut house-made ice cream', price: 6.99, emoji: '🥤', popular: false },
  { id: 'm6', name: 'Veggie Wrap', desc: 'Hummus, roasted vegetables, feta', price: 8.49, emoji: '🌯', popular: false },
];

export const FARE = 5.00;

export const TERMS_SECTIONS = [
  ['1. Eligibility', 'RUride is exclusively available to currently enrolled Rutgers University students with a valid NetID. Users must maintain active enrollment to continue using the platform.'],
  ['2. Identity Verification', 'All users must upload a valid Rutgers student ID card. Accounts are approved by administrators within 1–4 hours. Submitting false information results in permanent suspension.'],
  ['3. Ride Conduct', 'Treat all Rutgers community members with respect. Harassment, discrimination, or unsafe behavior results in immediate account suspension and potential campus disciplinary action.'],
  ['4. Flat Fare Policy', 'All rides are priced at a flat $5.00 regardless of campus destination. Fares are non-refundable once a driver accepts the ride.'],
  ['5. Safety & Liability', 'An in-app emergency button is available at all times during rides. RUride recommends sharing trip details with trusted contacts.'],
  ['6. Privacy & Data', 'Location data is used solely for ride matching and deleted at session end. We never sell personal data to third parties.'],
  ['7. Payments', 'Payments are processed securely. RUride does not store card details. Disputes must be filed within 48 hours of ride completion.'],
  ['8. Cancellation', 'Cancel without penalty within 2 minutes of requesting. Frequent cancellations may restrict your account.'],
  ['9. Food Delivery', 'Delivery times are estimates. RUride is not responsible for food quality or order accuracy from partner restaurants.'],
  ['10. Amendments', 'Terms may be updated at any time. Continued use constitutes acceptance of updated terms.'],
];
