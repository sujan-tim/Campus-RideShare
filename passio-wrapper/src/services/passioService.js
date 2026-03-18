const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

const http = axios.create({
  timeout: env.passioTimeoutMs,
  responseType: 'text',
  headers: {
    Accept: 'application/json, text/plain, */*',
    'User-Agent': 'passio-wrapper/1.0',
  },
});

function buildUrl(pathname) {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${env.passioBaseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function parseLooseErrorPayload(rawText) {
  const trimmed = String(rawText || '').trim();
  const match = trimmed.match(/^\[\{error\s+(.+)\}\]$/i);
  return match ? match[1].trim() : null;
}

function parsePayload(rawText, label) {
  if (rawText && typeof rawText === 'object') return rawText;

  const trimmed = String(rawText || '').trim();
  if (!trimmed) {
    throw new AppError(`Upstream Passio returned an empty payload for ${label}`, {
      statusCode: 502,
      code: 'UPSTREAM_EMPTY_RESPONSE',
    });
  }

  const looseError = parseLooseErrorPayload(trimmed);
  if (looseError) {
    throw new AppError(`Upstream Passio rejected ${label}: ${looseError}`, {
      statusCode: 502,
      code: 'UPSTREAM_BAD_RESPONSE',
      details: { raw: trimmed },
    });
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    throw new AppError(`Upstream Passio returned invalid JSON for ${label}`, {
      statusCode: 502,
      code: 'UPSTREAM_INVALID_JSON',
      details: {
        message: error.message,
        raw: trimmed.slice(0, 500),
      },
    });
  }
}

async function requestPassio(label, options) {
  try {
    const response = await http.request({
      method: options.method || 'get',
      url: buildUrl(options.url),
      params: options.params || {},
      data: options.body ? new URLSearchParams({ json: JSON.stringify(options.body) }) : undefined,
      headers: options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
      transformResponse: [data => data],
    });

    const payload = parsePayload(response.data, label);
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && typeof payload.error === 'string' && payload.error) {
      throw new AppError(`Upstream Passio returned an error for ${label}: ${payload.error}`, {
        statusCode: 502,
        code: 'UPSTREAM_BAD_RESPONSE',
        details: payload,
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(`Upstream Passio request failed for ${label}`, {
      statusCode: 502,
      code: 'UPSTREAM_REQUEST_FAILED',
      details: {
        url: buildUrl(options.url),
        params: options.params || {},
        message: error.message,
        status: error.response && error.response.status,
      },
    });
  }
}

function mapStopCollection(stops) {
  const byId = new Map();

  Object.values(stops || {}).forEach(stop => {
    const id = String(stop && (stop.id || stop.stopId || ''));
    if (!id) return;

    if (!byId.has(id)) {
      byId.set(id, {
        ...stop,
        routes: [],
      });
    }

    const aggregatedStop = byId.get(id);
    const routeId = stop && stop.routeId !== undefined && stop.routeId !== null ? String(stop.routeId) : null;

    if (routeId && !aggregatedStop.routes.includes(routeId)) {
      aggregatedStop.routes.push(routeId);
    }
  });

  return Array.from(byId.values());
}

function mapVehicleCollection(buses) {
  return Object.values(buses || {}).flatMap(entries => Array.isArray(entries) ? entries : []);
}

function mapEtaCollection(payload) {
  return Object.values((payload && payload.ETAs) || {}).flatMap(entries => Array.isArray(entries) ? entries : []);
}

async function fetchSystems() {
  const payload = await requestPassio('systems', {
    url: '/mapGetData.php',
    params: {
      getSystems: 2,
      sortMode: 1,
      deviceId: env.passioDeviceId,
      credentials: 1,
      acronymId: env.passioAcronymId,
    },
  });

  return Array.isArray(payload && payload.all) ? payload.all : [];
}

async function fetchRoutes(systemId) {
  const payload = await requestPassio('routes', {
    method: 'post',
    url: '/mapGetData.php',
    params: {
      getRoutes: 1,
      deviceId: env.passioDeviceId,
    },
    body: {
      systemSelected0: String(systemId),
      amount: 1,
    },
  });

  return Array.isArray(payload) ? payload : [];
}

async function fetchStops(systemId) {
  const payload = await requestPassio('stops', {
    method: 'post',
    url: '/mapGetData.php',
    params: {
      getStops: 2,
      deviceId: env.passioDeviceId,
      withOutdated: 1,
      wBounds: 1,
      buildNo: env.passioBuildNo,
      showBusInOos: 0,
    },
    body: {
      s0: String(systemId),
      sA: 1,
    },
  });

  return mapStopCollection(payload && payload.stops);
}

async function fetchVehicles(systemId) {
  const payload = await requestPassio('vehicles', {
    method: 'post',
    url: '/mapGetData.php',
    params: {
      getBuses: 1,
      deviceId: env.passioDeviceId,
      speed: 1,
    },
    body: {
      s0: String(systemId),
      sA: 1,
    },
  });

  return mapVehicleCollection(payload && payload.buses);
}

async function fetchAlerts(systemId) {
  const payload = await requestPassio('alerts', {
    method: 'post',
    url: '/goServices.php',
    params: {
      getAlertMessages: 1,
      deviceId: env.passioDeviceId,
      alertCRC: 'na',
      buildNo: env.passioBuildNo,
      embedded: env.passioEmbedded,
    },
    body: {
      systemSelected0: String(systemId),
      amount: 1,
      routesAmount: 0,
    },
  });

  return Array.isArray(payload && payload.msgs) ? payload.msgs : [];
}

async function fetchEtas(systemId, stopId) {
  const payload = await requestPassio('etas', {
    url: '/mapGetData.php',
    params: {
      eta: 3,
      deviceId: env.passioDeviceId,
      stopIds: String(stopId),
      userId: String(systemId),
    },
  });

  return mapEtaCollection(payload);
}

module.exports = {
  fetchSystems,
  fetchRoutes,
  fetchStops,
  fetchVehicles,
  fetchAlerts,
  fetchEtas,
};
