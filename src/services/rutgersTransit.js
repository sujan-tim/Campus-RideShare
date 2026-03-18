import { RUTGERS_FALLBACK_ROUTES } from '../constants/transit';

const API_BASE = (import.meta.env.VITE_RUTGERS_TRANSIT_API_BASE || '').replace(/\/$/, '');

function makeUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '' || value === false) return;
    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item));
      return;
    }
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function request(path, params = {}) {
  if (!API_BASE) {
    const error = new Error('Rutgers transit backend is not configured');
    error.code = 'TRANSIT_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch(makeUrl(path, params));
  if (!response.ok) {
    const error = new Error(`Transit request failed: ${response.status}`);
    error.code = 'TRANSIT_HTTP_ERROR';
    throw error;
  }
  return response.json();
}

export function isRutgersTransitConfigured() {
  return Boolean(API_BASE);
}

export function getRutgersTransitConfig() {
  return {
    configured: isRutgersTransitConfigured(),
    apiBase: API_BASE || null,
  };
}

export async function fetchTransitBootstrap() {
  try {
    const [routes, stops, alerts] = await Promise.all([
      request('/routes'),
      request('/stops'),
      request('/alerts'),
    ]);

    return {
      routes: routes?.routes || [],
      stops: stops?.stops || [],
      alerts: alerts?.alerts || [],
      source: 'live',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    if (error.code === 'TRANSIT_NOT_CONFIGURED') {
      return {
        routes: RUTGERS_FALLBACK_ROUTES,
        stops: [],
        alerts: [],
        source: 'fallback',
        lastUpdated: null,
      };
    }
    throw error;
  }
}

export async function fetchTransitVehicles(routeIds = []) {
  const payload = await request('/vehicles', { routeId: routeIds });
  return payload?.vehicles || [];
}

export async function fetchTransitPredictions(stopId, routeIds = []) {
  if (!stopId) return [];
  const payload = await request(`/stops/${encodeURIComponent(stopId)}/predictions`, { routeId: routeIds });
  return payload?.predictions || [];
}
