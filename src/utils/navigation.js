const ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving';

const MILES_PER_METER = 0.000621371;

const CAMPUS_SPOTS = {
  busch: {
    main_gate: { lat: 40.5235, lng: -74.4626, label: 'Busch Campus Main Gate' },
    'busch student center': { lat: 40.52324, lng: -74.45851, label: 'Busch Student Center' },
    serc: { lat: 40.52412, lng: -74.46524, label: 'SERC' },
    'werblin rec': { lat: 40.51886, lng: -74.46385, label: 'Werblin Rec' },
    'werblin recreation center': { lat: 40.51886, lng: -74.46385, label: 'Werblin Recreation Center' },
  },
  college_ave: {
    main_gate: { lat: 40.5008, lng: -74.4474, label: 'College Avenue Main Gate' },
    'old queens': { lat: 40.50052, lng: -74.44896, label: 'Old Queens' },
    'voorhees mall': { lat: 40.50147, lng: -74.44753, label: 'Voorhees Mall' },
    'student center': { lat: 40.50341, lng: -74.4522, label: 'College Avenue Student Center' },
    'college avenue student center': { lat: 40.50341, lng: -74.4522, label: 'College Avenue Student Center' },
    'the yard': { lat: 40.49967, lng: -74.44837, label: 'The Yard' },
  },
  douglass: {
    main_gate: { lat: 40.4887, lng: -74.4496, label: 'Douglass Campus Main Gate' },
    'douglass library': { lat: 40.48758, lng: -74.44794, label: 'Douglass Library' },
    'jameson hall': { lat: 40.48589, lng: -74.44862, label: 'Jameson Hall' },
    'dining hall': { lat: 40.48931, lng: -74.45132, label: 'Douglass Dining Hall' },
  },
  cook: {
    main_gate: { lat: 40.4824, lng: -74.4378, label: 'Cook Campus Main Gate' },
    'cook student center': { lat: 40.48189, lng: -74.43572, label: 'Cook Student Center' },
    'blake hall': { lat: 40.48492, lng: -74.43724, label: 'Blake Hall' },
    'passion puddle': { lat: 40.48035, lng: -74.43333, label: 'Passion Puddle' },
  },
  livingston: {
    main_gate: { lat: 40.5219, lng: -74.438, label: 'Livingston Campus Main Gate' },
    'livingston student center': { lat: 40.52401, lng: -74.43698, label: 'Livingston Student Center' },
    'rbs building': { lat: 40.52276, lng: -74.43741, label: 'RBS Building' },
    quads: { lat: 40.51987, lng: -74.43475, label: 'Livingston Quads' },
    'livingston quads': { lat: 40.51987, lng: -74.43475, label: 'Livingston Quads' },
  },
};

function normalizeLabel(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function toPoint(point, fallbackLabel = 'Point') {
  return {
    lat: point.lat,
    lng: point.lng,
    label: point.label || fallbackLabel,
  };
}

function fallbackRoute(origin, destination) {
  const geometry = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];
  const distanceMeters = getDistanceMeters(origin, destination);
  const durationSeconds = Math.max(240, Math.round(distanceMeters / 5));

  return {
    geometry,
    distanceMeters,
    durationSeconds,
    distanceLabel: formatDistance(distanceMeters),
    durationLabel: formatDuration(durationSeconds),
    steps: [
      {
        instruction: `Head toward ${destination.label || 'the destination'}`,
        distanceMeters,
        durationSeconds,
        cumulativeDistance: distanceMeters,
      },
      {
        instruction: `Arrive at ${destination.label || 'the destination'}`,
        distanceMeters: 0,
        durationSeconds: 0,
        cumulativeDistance: distanceMeters,
      },
    ],
    source: 'fallback',
  };
}

function buildInstruction(step) {
  const maneuver = step?.maneuver || {};
  const type = maneuver.type || 'continue';
  const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
  const roadName = step?.name ? ` onto ${step.name}` : '';

  if (type === 'depart') return `Start${roadName || ' on the campus road'}`;
  if (type === 'arrive') return `Arrive at ${step?.name || 'your stop'}`;
  if (type === 'roundabout') return `Enter the roundabout${roadName}`;
  if (type === 'merge') return `Merge${modifier}${roadName}`;
  if (type === 'new name') return `Continue${roadName}`;
  if (type === 'notification') return `Continue${roadName}`;
  if (type === 'end of road') return `Turn${modifier}${roadName}`;
  return `${type === 'continue' ? 'Continue' : 'Turn'}${modifier}${roadName}`;
}

function normalizeRoute(route) {
  const steps = [];
  let cumulativeDistance = 0;

  route.legs.forEach(leg => {
    (leg.steps || []).forEach(step => {
      cumulativeDistance += step.distance || 0;
      steps.push({
        instruction: buildInstruction(step),
        distanceMeters: step.distance || 0,
        durationSeconds: step.duration || 0,
        cumulativeDistance,
      });
    });
  });

  return {
    geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    distanceLabel: formatDistance(route.distance),
    durationLabel: formatDuration(route.duration),
    steps,
    source: 'osrm',
  };
}

export async function fetchShortestStreetRoute({ origin, destination, signal }) {
  if (!origin || !destination) return null;

  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const query = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'true',
    alternatives: 'true',
  });

  try {
    const response = await fetch(`${ROUTING_URL}/${coords}?${query.toString()}`, { signal });
    if (!response.ok) throw new Error(`Routing failed with ${response.status}`);

    const payload = await response.json();
    if (!payload?.routes?.length) throw new Error('No routes returned');

    const bestRoute = payload.routes.reduce((shortest, route) => (
      !shortest || route.distance < shortest.distance ? route : shortest
    ), null);

    return normalizeRoute(bestRoute);
  } catch {
    return fallbackRoute(origin, destination);
  }
}

export function resolveCampusSpot({ campus, selectionValue, label, fallbackLocation = null }) {
  if (selectionValue === 'current_location' && fallbackLocation) {
    return toPoint({ ...fallbackLocation, label: 'Current GPS Location' }, 'Current GPS Location');
  }

  const spots = campus?.id ? CAMPUS_SPOTS[campus.id] : null;
  if (!spots) {
    if (fallbackLocation) return toPoint(fallbackLocation, fallbackLocation.label || 'Current location');
    if (!campus) return null;
    return toPoint({ lat: campus.lat, lng: campus.lng, label: campus.name }, campus.name);
  }

  if (selectionValue && selectionValue.startsWith(`${campus.id}:`)) {
    const rawSpot = selectionValue.slice(campus.id.length + 1);
    const spotKey = rawSpot === 'main' ? 'main_gate' : normalizeLabel(rawSpot);
    if (spots[spotKey]) return toPoint(spots[spotKey], spots[spotKey].label);
  }

  const normalizedLabel = normalizeLabel(label);
  if (normalizedLabel && spots[normalizedLabel]) return toPoint(spots[normalizedLabel], spots[normalizedLabel].label);

  return toPoint({ lat: campus.lat, lng: campus.lng, label: campus.name }, campus.name);
}

export function formatDistance(distanceMeters = 0) {
  return `${(distanceMeters * MILES_PER_METER).toFixed(1)} mi`;
}

export function formatDuration(durationSeconds = 0) {
  return `${Math.max(1, Math.round(durationSeconds / 60))} min`;
}

export function getDistanceMeters(a, b) {
  if (!a || !b) return 0;

  const toRadians = value => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine = Math.sin(latDelta / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getRoutePointAtProgress(route, progress = 0) {
  const geometry = route?.geometry || [];
  if (!geometry.length) return null;
  if (geometry.length === 1) return { lat: geometry[0][0], lng: geometry[0][1] };

  const clamped = Math.max(0, Math.min(1, progress));
  const segmentCount = geometry.length - 1;
  const exactIndex = clamped * segmentCount;
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.min(segmentCount, Math.ceil(exactIndex));
  const localProgress = exactIndex - lowerIndex;
  const [startLat, startLng] = geometry[lowerIndex];
  const [endLat, endLng] = geometry[upperIndex];

  return {
    lat: startLat + (endLat - startLat) * localProgress,
    lng: startLng + (endLng - startLng) * localProgress,
  };
}

export function splitRouteGeometry(route, progress = 0) {
  const geometry = route?.geometry || [];
  if (geometry.length < 2) return { traveled: geometry, remaining: geometry };

  const clamped = Math.max(0, Math.min(1, progress));
  const segmentCount = geometry.length - 1;
  const exactIndex = clamped * segmentCount;
  const lowerIndex = Math.floor(exactIndex);
  const pointAtProgress = getRoutePointAtProgress(route, clamped);
  const pivot = [pointAtProgress.lat, pointAtProgress.lng];

  return {
    traveled: [...geometry.slice(0, lowerIndex + 1), pivot],
    remaining: [pivot, ...geometry.slice(lowerIndex + 1)],
  };
}

export function getNavigationSnapshot(route, progress = 0) {
  if (!route) {
    return {
      instruction: 'Street routing unavailable.',
      remainingDistance: '0.0 mi',
      remainingDuration: '0 min',
    };
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const traveledDistance = route.distanceMeters * clamped;
  const nextStep = route.steps.find(step => step.cumulativeDistance > traveledDistance);
  const remainingDistanceMeters = Math.max(0, route.distanceMeters - traveledDistance);
  const remainingDurationSeconds = Math.max(0, route.durationSeconds * (1 - clamped));

  return {
    instruction: nextStep?.instruction || 'Arrive at your destination',
    remainingDistance: formatDistance(remainingDistanceMeters),
    remainingDuration: formatDuration(remainingDurationSeconds),
  };
}
