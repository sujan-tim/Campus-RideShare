const rutgersService = require('../services/rutgersService');

async function listSystems(req, res) {
  const systems = await rutgersService.getSystems();
  res.json({ systems });
}

async function searchSystems(req, res) {
  const systems = await rutgersService.searchSystems(req.query.q || '');
  res.json({ systems, query: req.query.q || '' });
}

module.exports = {
  listSystems,
  searchSystems,
};
