const rutgersService = require('../services/rutgersService');
const { AppError } = require('../utils/errors');

async function getRutgers(req, res) {
  const overview = await rutgersService.getRutgersOverview();
  res.json(overview);
}

async function getRoutes(req, res) {
  const routes = await rutgersService.getRutgersRoutes();
  res.json({ routes });
}

async function getStops(req, res) {
  const stops = await rutgersService.getRutgersStops(req.query.routeId || null);
  res.json({ stops, routeId: req.query.routeId || null });
}

async function getVehicles(req, res) {
  const vehicles = await rutgersService.getRutgersVehicles(req.query.routeId || null);
  res.json({ vehicles, routeId: req.query.routeId || null });
}

async function getAlerts(req, res) {
  const alerts = await rutgersService.getRutgersAlerts();
  res.json({ alerts });
}

async function getEtas(req, res) {
  const stopId = req.params.stopId;
  if (!stopId) {
    throw new AppError('stopId is required', {
      statusCode: 400,
      code: 'STOP_ID_REQUIRED',
    });
  }

  const etas = await rutgersService.getRutgersEtas(stopId);
  res.json({ stopId, etas });
}

module.exports = {
  getRutgers,
  getRoutes,
  getStops,
  getVehicles,
  getAlerts,
  getEtas,
};
