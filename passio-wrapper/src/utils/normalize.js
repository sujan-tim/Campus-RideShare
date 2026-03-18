function pickFirst(source, keys, fallback = null) {
  for (const key of keys) {
    const value = source && source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoString(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload && payload[key])) return payload[key];
  }

  return [];
}

function normalizeSystem(raw) {
  const id = String(pickFirst(raw, ['id', 'systemId'], ''));
  const name = pickFirst(raw, ['fullname', 'fullName', 'goAgencyName', 'name'], 'Unknown system');

  return {
    id,
    name,
    shortName: pickFirst(raw, ['shortName', 'goNameShort', 'username'], null),
    raw,
  };
}

function normalizeRoute(raw) {
  return {
    id: String(pickFirst(raw, ['myid', 'id', 'routeId'], '')),
    name: pickFirst(raw, ['name', 'longName', 'fullname', 'nameOrig'], 'Unknown route'),
    shortName: pickFirst(raw, ['shortName', 'goRouteName', 'abbr'], null),
    color: pickFirst(raw, ['groupColor', 'color'], null),
    raw,
  };
}

function normalizeStop(raw) {
  const routesAndPositions = raw && raw.routesAndPositions && typeof raw.routesAndPositions === 'object'
    ? Object.keys(raw.routesAndPositions)
    : [];
  const routeIds = raw && raw.routeId !== undefined && raw.routeId !== null && raw.routeId !== ''
    ? [String(raw.routeId)]
    : [];

  return {
    id: String(pickFirst(raw, ['id', 'stopId'], '')),
    name: pickFirst(raw, ['name', 'stopName'], 'Unknown stop'),
    lat: toNumber(pickFirst(raw, ['latitude', 'lat'])),
    lng: toNumber(pickFirst(raw, ['longitude', 'lng', 'lon'])),
    routes: ensureArray(pickFirst(raw, ['routes'], routesAndPositions.length ? routesAndPositions : routeIds)).map(String),
    raw,
  };
}

function normalizeVehicle(raw) {
  return {
    id: String(pickFirst(raw, ['id', 'vehicleId', 'busId'], '')),
    name: pickFirst(raw, ['name', 'busName', 'vehicleName'], 'Rutgers Bus'),
    routeId: String(pickFirst(raw, ['routeId', 'route', 'routeID'], '')),
    routeName: pickFirst(raw, ['routeName', 'routeShortName', 'route'], null),
    lat: toNumber(pickFirst(raw, ['latitude', 'lat'])),
    lng: toNumber(pickFirst(raw, ['longitude', 'lng', 'lon'])),
    speed: toNumber(pickFirst(raw, ['speed', 'speedMph']), 0),
    heading: toNumber(pickFirst(raw, ['heading', 'bearing', 'calculatedCourse', 'course']), 0),
    updatedAt: toIsoString(pickFirst(raw, ['updatedAt', 'lastUpdated', 'updated', 'createdUtc'])),
    raw,
  };
}

function normalizeAlert(raw) {
  return {
    id: String(pickFirst(raw, ['id', 'alertId'], '')),
    title: pickFirst(raw, ['name', 'title', 'gtfsAlertHeaderText'], 'Transit alert'),
    body: pickFirst(raw, ['html', 'description', 'gtfsAlertDescriptionText'], ''),
    routeId: pickFirst(raw, ['routeId'], null),
    updatedAt: toIsoString(pickFirst(raw, ['updated', 'updatedAt', 'dateTimeCreated', 'createdUtc'])),
    raw,
  };
}

function normalizeEta(raw) {
  return {
    routeId: String(pickFirst(raw, ['routeId', 'route'], '')),
    routeName: pickFirst(raw, ['routeName', 'routeShortName', 'route', 'theStop.routeName'], raw && raw.theStop ? raw.theStop.routeName || raw.theStop.shortName || null : null),
    vehicleId: pickFirst(raw, ['vehicleId', 'busId'], raw && raw.solidEta ? raw.solidEta.busId || null : null),
    arrivalText: pickFirst(raw, ['arrivalText', 'etaText', 'eta'], null),
    minutes: toNumber(pickFirst(raw, ['minutes', 'etaMinutes', 'etaR']), null),
    raw,
  };
}

module.exports = {
  extractCollection,
  normalizeAlert,
  normalizeEta,
  normalizeRoute,
  normalizeStop,
  normalizeSystem,
  normalizeVehicle,
  pickFirst,
};
