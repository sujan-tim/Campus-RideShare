const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), '.env'),
});

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  useMockData: String(process.env.USE_MOCK_DATA || 'false').toLowerCase() === 'true',
  passioBaseUrl: (process.env.PASSIO_BASE_URL || 'https://rutgers.passiogo.com').replace(/\/$/, ''),
  passioTimeoutMs: toNumber(process.env.PASSIO_TIMEOUT_MS, 10000),
  passioAppVersion: toNumber(process.env.PASSIO_APP_VERSION, 2),
  passioDeviceId: toNumber(process.env.PASSIO_DEVICE_ID, 0),
  passioBuildNo: toNumber(process.env.PASSIO_BUILD_NO, 0),
  passioEmbedded: toNumber(process.env.PASSIO_EMBEDDED, 0),
  passioAcronymId: process.env.PASSIO_ACRONYM_ID || process.env.PASSIO_RUTGERS_SYSTEM_ID || '1268',
  passioRutgersSystemId: process.env.PASSIO_RUTGERS_SYSTEM_ID || null,
  cacheTtlMs: {
    systems: toNumber(process.env.SYSTEMS_CACHE_TTL_MS, 300000),
    routes: toNumber(process.env.ROUTES_CACHE_TTL_MS, 900000),
    stops: toNumber(process.env.STOPS_CACHE_TTL_MS, 900000),
    vehicles: toNumber(process.env.VEHICLES_CACHE_TTL_MS, 10000),
    alerts: toNumber(process.env.ALERTS_CACHE_TTL_MS, 60000),
    etas: toNumber(process.env.ETAS_CACHE_TTL_MS, 10000),
  },
};
