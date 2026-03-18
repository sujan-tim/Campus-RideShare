const express = require('express');
const { asyncHandler } = require('../utils/errors');
const systemsController = require('../controllers/systemsController');

const router = express.Router();

router.get('/', asyncHandler(systemsController.listSystems));
router.get('/search', asyncHandler(systemsController.searchSystems));

module.exports = router;
