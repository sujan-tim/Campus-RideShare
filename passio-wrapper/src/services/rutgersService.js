const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');
const passioService = require('./passioService');
const { MemoryCache } = require('../utils/cache');
const { AppError } = require('../utils/errors');
const {
  normalizeAlert,
  normalizeEta,
  normalizeRoute,
  normalizeStop,
  normalizeSystem,
  normalizeVehicle,
} = require('../utils/normalize');

const cache = new MemoryCache();
const dataDir = path.resolve(__dirname, '../data');

async function readJson(filename) {
  const fullPath = path.join(dataDir, filename);
  const contents = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(contents);
}

function isRutgersMatch(system) {
  const haystack = [system.name, system.shortName, system.raw && system.raw.username, system.raw && system.raw.goAgencyName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes('rutgers');
}

async function getSystemsRaw() {
  if (env.useMockData) return readJson('systems.json');
  return passioService.fetchSystems();
}

async function getRoutesRaw(systemId) {
  if (env.useMockData) return readJson('routes.json');
  return passioService.fetchRoutes(systemId);
}

async function getStopsRaw(systemId) {
  if (env.useMockData) return readJson('stops.json');
  return passioService.fetchStops(systemId);
}

async function getVehiclesRaw(systemId) {
  if (env.useMockData) return readJson('vehicles.json');
  return passioService.fetchVehicles(systemId);
}

async function getAlertsRaw(systemId) {
  if (env.useMockData) return readJson('alerts.json');
  return passioService.fetchAlerts(systemId);
}

async function getEtasRaw(systemId, stopId) {
  if (env.useMockData) {
    const etas = await readJson('etas.json');
    return etas[stopId] || [];
  }
  return passioService.fetchEtas(systemId, stopId);
}

async function getSystems() {
  return cache.remember('systems', env.cacheTtlMs.systems, async () => {
    const rawSystems = await getSystemsRaw();
    return rawSystems.map(normalizeSystem);
  });
}

async function searchSystems(query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const systems = await getSystems();
  if (!normalizedQuery) return systems;
  return systems.filter(system => {
    const haystack = [system.name, system.shortName].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

async function resolveRutgersSystem() {
  return cache.remember('rutgers-system', env.cacheTtlMs.systems, async () => {
    const systems = await getSystems();

    if (env.passioRutgersSystemId) {
      const explicitMatch = systems.find(system => system.id === env.passioRutgersSystemId);
      if (explicitMatch) return explicitMatch;
    }

    const matchedSystem = systems.find(isRutgersMatch);
    if (!matchedSystem) {
      throw new AppError('Rutgers system could not be resolved from available systems', {
        statusCode: 404,
        code: 'RUTGERS_SYSTEM_NOT_FOUND',
      });
    }

    return matchedSystem;
  });
}

async function getRutgersRoutes() {
  return cache.remember('rutgers-routes', env.cacheTtlMs.routes, async () => {
    const rutgersSystem = await resolveRutgersSystem();
    const rawRoutes = await getRoutesRaw(rutgersSystem.id);
    return rawRoutes.map(normalizeRoute);
  });
}

async function getRutgersStops(routeId = null) {
  const allStops = await cache.remember('rutgers-stops', env.cacheTtlMs.stops, async () => {
    const rutgersSystem = await resolveRutgersSystem();
    const rawStops = await getStopsRaw(rutgersSystem.id);
    return rawStops.map(normalizeStop);
  });

  if (!routeId) return allStops;
  return allStops.filter(stop => stop.routes.includes(String(routeId)));
}

async function getRutgersVehicles(routeId = null) {
  const [rutgersSystem, routes] = await Promise.all([
    resolveRutgersSystem(),
    getRutgersRoutes(),
  ]);

  const routeMap = new Map(routes.map(route => [route.id, route]));
  const rawVehicles = await cache.remember(`rutgers-vehicles:${routeId || 'all'}`, env.cacheTtlMs.vehicles, async () => (
    getVehiclesRaw(rutgersSystem.id)
  ));

  const vehicles = rawVehicles
    .map(normalizeVehicle)
    .map(vehicle => ({
      ...vehicle,
      routeName: vehicle.routeName || (routeMap.get(vehicle.routeId) && routeMap.get(vehicle.routeId).name) || null,
    }));

  if (!routeId) return vehicles;
  return vehicles.filter(vehicle => vehicle.routeId === String(routeId));
}

async function getRutgersAlerts() {
  return cache.remember('rutgers-alerts', env.cacheTtlMs.alerts, async () => {
    const rutgersSystem = await resolveRutgersSystem();
    const rawAlerts = await getAlertsRaw(rutgersSystem.id);
    return rawAlerts.map(normalizeAlert);
  });
}

async function getRutgersEtas(stopId) {
  const rutgersSystem = await resolveRutgersSystem();
  const rawEtas = await cache.remember(`rutgers-etas:${stopId}`, env.cacheTtlMs.etas, async () => (
    getEtasRaw(rutgersSystem.id, stopId)
  ));

  const normalized = rawEtas.map(normalizeEta);
  return normalized;
}

async function getRutgersOverview() {
  const [system, routes, stops, vehicles, alerts] = await Promise.all([
    resolveRutgersSystem(),
    getRutgersRoutes(),
    getRutgersStops(),
    getRutgersVehicles(),
    getRutgersAlerts(),
  ]);

  return {
    system,
    counts: {
      routes: routes.length,
      stops: stops.length,
      vehicles: vehicles.length,
      alerts: alerts.length,
    },
    source: env.useMockData ? 'mock' : 'live',
  };
}

module.exports = {
  getSystems,
  searchSystems,
  resolveRutgersSystem,
  getRutgersOverview,
  getRutgersRoutes,
  getRutgersStops,
  getRutgersVehicles,
  getRutgersAlerts,
  getRutgersEtas,
};
