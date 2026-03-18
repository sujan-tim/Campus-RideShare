const express = require('express');
const { asyncHandler } = require('../utils/errors');
const rutgersController = require('../controllers/rutgersController');

const router = express.Router();

router.get('/', asyncHandler(rutgersController.getRutgers));
router.get('/routes', asyncHandler(rutgersController.getRoutes));
router.get('/stops', asyncHandler(rutgersController.getStops));
router.get('/vehicles', asyncHandler(rutgersController.getVehicles));
router.get('/alerts', asyncHandler(rutgersController.getAlerts));
router.get('/etas/:stopId', asyncHandler(rutgersController.getEtas));

module.exports = router;
